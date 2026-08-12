export const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://uvhug6af4a.execute-api.ap-northeast-1.amazonaws.com"
).replace(/\/$/, "");

export const authOrigin = new URL(apiBaseUrl).origin;
