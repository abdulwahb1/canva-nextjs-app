import crypto from "crypto";
import axios from "axios";

// In-memory stores (use Vercel KV/Redis in production)
const stateToVerifier = new Map<string, string>();
const tokenStore = new Map<
  string,
  {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    token_type: string;
  }
>();

const CANVA_ID = process.env.CANVA_CLIENT_ID!;
const CANVA_SECRET = process.env.CANVA_CLIENT_SECRET!;
const CANVA_REDIRECT = process.env.CANVA_REDIRECT_URI!;

function base64url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function generateCodeVerifier() {
  const buf = crypto.randomBytes(64);
  return base64url(buf);
}

export function generateCodeChallenge(verifier: string) {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64url(hash);
}

export function storeVerifier(state: string, verifier: string) {
  stateToVerifier.set(state, verifier);
}
export function getVerifier(state: string) {
  return stateToVerifier.get(state);
}
export function removeVerifier(state: string) {
  stateToVerifier.delete(state);
}

export function storeTokens(tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}) {
  const expires_at = Date.now() + tokens.expires_in * 1000;
  tokenStore.set("default", {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type,
    expires_at,
  });
}

function isExpiringSoon(expires_at: number) {
  return expires_at <= Date.now() + 5 * 60 * 1000;
}

export async function getValidToken(): Promise<string> {
  const t = tokenStore.get("default");
  if (!t) throw new Error("No tokens; authenticate first.");
  if (!isExpiringSoon(t.expires_at)) return t.access_token;

  const refreshed = await refreshAccessToken(t.refresh_token);
  if (!refreshed.success) throw new Error("Refresh failed");
  storeTokens(refreshed as any);
  return (refreshed as any).access_token;
}

export async function exchangeCodeForToken(
  code: string,
  code_verifier: string
) {
  try {
    const res = await axios.post(
      "https://api.canva.com/rest/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code,
        code_verifier,
        redirect_uri: CANVA_REDIRECT,
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${CANVA_ID}:${CANVA_SECRET}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return { success: true, ...res.data };
  } catch (e: any) {
    return { success: false, error: e.response?.data || e.message };
  }
}

export async function refreshAccessToken(refresh_token: string) {
  try {
    const res = await axios.post(
      "https://api.canva.com/rest/v1/oauth/token",
      {
        grant_type: "refresh_token",
        refresh_token,
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${CANVA_ID}:${CANVA_SECRET}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return { success: true, ...res.data };
  } catch (e: any) {
    return { success: false, error: e.response?.data || e.message };
  }
}

export { tokenStore };
