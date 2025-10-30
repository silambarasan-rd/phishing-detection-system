import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export interface UserDetails {
  ipAddress: string;
  browser: string;
  location: string;
}

export function extractUserDetails(req: Request): UserDetails {
  // Get IP address, considering potential proxy headers
  const ipAddress = req.headers['x-forwarded-for'] as string || 
                   req.socket.remoteAddress || 
                   'unknown';

  // Parse user agent for browser info
  const userAgent = req.headers['user-agent'] || '';
  const uaParser = new UAParser(userAgent);
  const browser = `${uaParser.getBrowser().name || 'unknown'} ${uaParser.getBrowser().version || ''}`.trim();

  // For now, we'll use the IP's country from the CF-IPCountry header if available
  // In a production environment, you might want to use a geolocation service
  const location = req.headers['cf-ipcountry'] as string || 'unknown';

  return {
    ipAddress: ipAddress.split(',')[0].trim(), // Get first IP if forwarded
    browser,
    location
  };
}