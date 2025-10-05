import express from "express";
import whois from "whois-json";
import dns from "dns/promises";
import fetch from "node-fetch";
import { GoogleSafeBrowsingResponse, WhoisResponse } from "../types/api";

const router = express.Router();

async function checkGoogleSafeBrowsing(url: string, apiKey: string) {
  if (!apiKey) return null;
  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const body = {
    client: { clientId: "phishing-detector", clientVersion: "1.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    
    if (!res.ok) {
      console.error('Google Safe Browsing API error:', {
        status: res.status,
        statusText: res.statusText,
        body: await res.text()
      });
      return null;
    }
    
    const data = await res.json() as GoogleSafeBrowsingResponse;
    return data && data.matches ? true : false;
  } catch (e) {
    console.error("Google Safe Browsing error:", e);
    return null;
  }
}

async function checkURLhaus(url: string) {
  try {
    // Using URLhaus's URL lookup endpoint
    const res = await fetch(`https://urlhaus-api.abuse.ch/v1/url/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(url)}`
    });
    
    if (!res.ok) {
      console.error('URLhaus API error:', {
        status: res.status,
        statusText: res.statusText
      });
      return null;
    }

    const data = await res.json() as any;
    return data && data.query_status === 'ok' && (
      data.url_status === 'online' || 
      (data.threat || '').toLowerCase().includes('phish')
    );
  } catch (e) {
    console.error("URLhaus error:", e);
    return null;
  }
}

function not_in_hostname(d: string, hostname: string) {
  if (!hostname) return true;
  if (hostname === d) return false;
  if (hostname.endsWith('.' + d)) return false;
  return true;
}

function ruleChecks(url: string) {
  const reasons: { [k: string]: any } = {};
  let score = 0;
  const u = url.trim();

  reasons.longURL = u.length > 75;
  if (reasons.longURL) score += 1;

  reasons.hasAt = u.includes("@");
  if (reasons.hasAt) score += 2;

  const ipPattern = /\b\d{1,3}(?:\.\d{1,3}){3}\b/;
  reasons.hasIP = ipPattern.test(u);
  if (reasons.hasIP) score += 2;

  const dashCount = (u.match(/-/g) || []).length;
  reasons.manyDashes = dashCount > 3;
  if (reasons.manyDashes) score += 1;

  reasons.usesHTTPS = u.toLowerCase().startsWith("https://");
  if (!reasons.usesHTTPS) score += 1;

  const suspiciousTlds = [".tk", ".ml", ".gq", ".cf", ".ga"];
  reasons.suspiciousTld = suspiciousTlds.some(t => u.toLowerCase().includes(t + "/") || u.toLowerCase().endsWith(t));
  if (reasons.suspiciousTld) score += 1;

  const brandTokens = ["paypal","bank","hdfc","icicibank","sbi","google","facebook","amazon","netflix","apple","microsoft"];
  let hostname = "";
  let pathname = "";
  try {
    const parsed = new URL(u.startsWith('http') ? u : 'http://' + u);
    hostname = parsed.hostname.toLowerCase();
    pathname = ((parsed.pathname || "") + (parsed.search || "") + (parsed.hash || "")).toLowerCase();
  } catch (e) {
    // parsing failed, leave hostname empty
  }

  const domainLikePattern = /[a-z0-9.-]+\.(?:com|net|org|co\.uk|co|in|info|biz|online|site|io|gov|edu)/ig;
  const domainsInPath = (pathname.match(domainLikePattern) || []).map(s => s.toLowerCase());

  for (const token of brandTokens) {
    if (pathname.includes(token)) {
      const canonical = token === "paypal" ? ["paypal.com","paypal.co.uk"] : [token + ".com"];
      const hostnameMatchesBrand = canonical.some(can => hostname === can || hostname.endsWith('.' + can));
      if (!hostnameMatchesBrand) {
        reasons.brandInPath = true;
        score += 2;
        break;
      }
    }
  }

  if (domainsInPath.length > 0) {
    const suspiciousFound = domainsInPath.some(d => not_in_hostname(d, hostname));
    if (suspiciousFound) {
      reasons.domainLikeInPath = domainsInPath;
      score += 2;
    }
  }

  for (const token of brandTokens) {
    const canonicalDomains = {
      'amazon': ['amazon.com', 'amazon.co.uk', 'amazon.in', 'amazon.ca', 'amazon.de', 'amazon.fr', 'amazon.es', 'amazon.it'],
      'google': ['google.com', 'google.co.uk', 'google.in', 'google.ca'],
      'microsoft': ['microsoft.com', 'microsoftonline.com'],
      'apple': ['apple.com', 'icloud.com'],
      'facebook': ['facebook.com', 'fb.com'],
      'netflix': ['netflix.com'],
      'paypal': ['paypal.com', 'paypal.co.uk'],
      'hdfc': ['hdfcbank.com', 'hdfc.com'],
      'icicibank': ['icicibank.com'],
      'sbi': ['sbi.co.in', 'onlinesbi.com'],
      'bank': [] // Skip generic terms
    };

    if (hostname.includes(token)) {
      const allowedDomains = canonicalDomains[token as keyof typeof canonicalDomains] || [token + '.com'];
      const isLegitimate = allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );
      
      if (!isLegitimate && token !== 'bank') {  // Skip checking generic terms
        reasons.deceptiveHostname = true;
        score += 2;
        break;
      }
    }
  }

  return { reasons, score };
}

router.post("/detect", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });

  const normalized = url.trim().startsWith('http') ? url.trim() : 'http://' + url.trim();

  // 1. External API checks
  const gsKey = process.env.GOOGLE_SAFE_BROWSING_KEY || '';
  let googleFlag = null;
  try { googleFlag = await checkGoogleSafeBrowsing(normalized, gsKey); } catch (e) { console.error('Safe Browsing check failed', e); }

  let urlhausFlag = null;
  try { urlhausFlag = await checkURLhaus(normalized); } catch (e) { console.error('URLhaus check failed', e); }

  // If flagged by external API -> high-confidence phishing verdict
  if (googleFlag === true || urlhausFlag === true) {
    return res.json({
      url: normalized,
      apiVerdict: { googleSafeBrowsing: googleFlag, urlhaus: urlhausFlag },
      rules: {},
      score: 10,
      whois: {},
      dns: {},
      finalVerdict: "Phishing 🚨 (detected by external API)"
    });
  }

  // Otherwise, fallback to local heuristics + enrichment
  const ruleResult = ruleChecks(normalized);

  // WHOIS & DNS enrichment (best-effort)
  let whoisData = null;
  let dnsData = null;
  let creationDate = null;
  let isNewDomain = false;
  try {
    const hostname = (() => { try { return new URL(normalized).hostname } catch { return null } })();
    if (hostname) {
      try {
        whoisData = await whois(hostname) as WhoisResponse;
        if (!whoisData || typeof whoisData !== 'object') {
          throw new Error('Invalid WHOIS response');
        }
      } catch (e) {
        console.error('WHOIS lookup failed:', e);
        whoisData = { error: 'WHOIS lookup failed' };
      }

      try {
        const rec = await dns.lookup(hostname);
        dnsData = { hasRecords: true, records: [rec.address] };
      } catch (e) {
        console.error('DNS lookup failed:', e);
        dnsData = { hasRecords: false };
      }

      if (whoisData && !whoisData.error) {
        const creationRaw = whoisData?.creationDate || whoisData?.createdDate || whoisData?.created;
        if (creationRaw) {
          try {
            creationDate = new Date(creationRaw).toISOString();
            const thirty = 30*24*60*60*1000;
            isNewDomain = (Date.now() - new Date(creationDate).getTime()) < thirty;
            if (isNewDomain) ruleResult.score += 2;
          } catch(e) {
            console.error('Date parsing failed:', e);
            creationDate = creationRaw;
          }
        }
      }
    }
  } catch(e) { console.error('whois/dns enrichment failed', e); }

  const finalVerdict = ruleResult.score >= 3 ? 'Suspicious 🚨' : 'Likely Safe ✅';

  res.json({
    url: normalized,
    apiVerdict: { googleSafeBrowsing: googleFlag, urlhaus: urlhausFlag },
    rules: ruleResult.reasons,
    score: ruleResult.score,
    whois: {
      registrar: whoisData?.error ? 'Unknown' : (whoisData?.registrar || whoisData?.registrarName || 'Unknown'),
      creationDate: whoisData?.error ? 'Unknown' : (creationDate || 'Not Available'),
      isNewDomain
    },
    dns: dnsData,
    finalVerdict
  });
});

export default router;
