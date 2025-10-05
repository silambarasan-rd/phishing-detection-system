// Type definitions for external API responses
export interface GoogleSafeBrowsingResponse {
  matches?: {
    threatType: string;
    platformType: string;
    threat: { url: string };
  }[];
}

// We no longer need the URLhaus interface since we're using the HTML endpoint

export interface WhoisResponse {
  creationDate?: string;
  createdDate?: string;
  created?: string;
  registrar?: string;
  registrarName?: string;
  error?: string;
}