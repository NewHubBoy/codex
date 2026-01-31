import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hasPasswordHash(hash?: string | null) {
  return Boolean(hash && hash.includes(":"));
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) {
    return false;
  }
  const derived = scryptSync(password, salt, KEY_LEN);
  const storedBuffer = Buffer.from(hash, "hex");
  if (storedBuffer.length !== KEY_LEN) {
    return false;
  }
  return timingSafeEqual(derived, storedBuffer);
}
