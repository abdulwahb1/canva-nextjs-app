import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  storeVerifier,
} from "@/lib/auth";

export async function GET() {
  const state = crypto.randomBytes(32).toString("hex");
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  storeVerifier(state, verifier);

  const params = new URLSearchParams({
    code_challenge: challenge,
    code_challenge_method: "s256",
    scope:
      "folder:permission:read design:content:read app:write design:content:write folder:read folder:write folder:permission:write asset:read design:permission:read design:permission:write brandtemplate:content:read comment:read profile:read brandtemplate:meta:read comment:write design:meta:read app:read asset:write",
    response_type: "code",
    client_id: process.env.CANVA_CLIENT_ID!,
    state,
    redirect_uri: process.env.CANVA_REDIRECT_URI!,
  });

  const authUrl = `https://www.canva.com/api/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(authUrl, { status: 302 });
}
