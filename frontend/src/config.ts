export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper to get full API path
export const getApiPath = (path: string) => {
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
