export const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://uvhug6af4a.execute-api.ap-northeast-1.amazonaws.com"
).replace(/\/$/, "");

function readAuthOrigin(baseUrl: string | undefined): string | null {
  if (!baseUrl) return null;

  try {
    const url = new URL(baseUrl);
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

export const authOrigin = readAuthOrigin(process.env.NEXT_PUBLIC_AUTH_BASE_URL);
