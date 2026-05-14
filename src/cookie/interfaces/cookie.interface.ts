export interface CookieRequest {
  baseURL: string;
  headers: {
    'Content-Type': string;
    'Cookie-Subscription-Key': string;
  };
}
