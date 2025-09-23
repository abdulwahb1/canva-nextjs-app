import { NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  getVerifier,
  removeVerifier,
  storeTokens,
} from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return NextResponse.redirect(new URL(`/?auth=error`, req.url));
  if (!code || !state)
    return NextResponse.redirect(new URL(`/?auth=missing`, req.url));

  const verifier = getVerifier(state);
  if (!verifier)
    return NextResponse.redirect(new URL(`/?auth=invalid_state`, req.url));

  const res = await exchangeCodeForToken(code, verifier);
  removeVerifier(state);

  if (!res.success)
    return NextResponse.redirect(new URL(`/?auth=fail`, req.url));

  storeTokens(res as any);
  return NextResponse.redirect(new URL(`/?auth=success`, req.url));
}
