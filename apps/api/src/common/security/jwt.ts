import { createHmac, timingSafeEqual } from "node:crypto";

function base64UrlEncode(data: Buffer | string) {
  const buffer = typeof data === "string" ? Buffer.from(data) : data;
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(data: string) {
  const padded = data.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4 || 4)) % 4;
  return Buffer.from(padded + "=".repeat(padLength), "base64");
}

function sign(input: string, secret: string) {
  return createHmac("sha256", secret).update(input).digest();
}

export interface JwtPayload {
  sub: string;
  tid: string;
  iat: number;
  exp: number;
}

export function signJwt(payload: Omit<JwtPayload, "iat" | "exp">, secret: string, expiresInSeconds: number) {
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const fullPayload: JwtPayload = { ...payload, iat, exp };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const input = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlEncode(sign(input, secret));
  return `${input}.${signature}`;
}

export function verifyJwt(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [encodedHeader, encodedPayload, signature] = parts;
  const input = `${encodedHeader}.${encodedPayload}`;
  const expected = sign(input, secret);
  const actual = base64UrlDecode(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }
  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8")) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return null;
  }
  if (!payload.sub || !payload.tid) {
    return null;
  }
  return payload;
}
