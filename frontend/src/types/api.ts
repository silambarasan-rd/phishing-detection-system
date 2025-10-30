export interface DetectionResponse {
  url: string;
  apiVerdict: {
    googleSafeBrowsing: boolean | null;
    urlhaus: boolean | null;
  };
  rules: {
    [key: string]: any;
  };
  score: number;
  whois: {
    registrar: string;
    creationDate: string;
    isNewDomain: boolean;
  };
  dns: {
    hasRecords?: boolean;
    records?: string[];
  };
  finalVerdict: string;
  previousQueries: number;
}