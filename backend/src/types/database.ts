export interface UrlScan {
  id: number;
  url: string;
  created_at: string;
  ip_address: string;
  browser: string;
  location: string;
  is_phishing: boolean;
  scan_results: {
    google_safe_browsing: boolean | null;
    urlhaus: boolean | null;
    whois_suspicious: boolean | null;
    dns_suspicious: boolean | null;
    pattern_suspicious: boolean | null;
  };
}

export type UrlScanInsert = Omit<UrlScan, 'id' | 'created_at'>;