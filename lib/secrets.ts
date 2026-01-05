import crypto from "crypto";

const VERSION_PREFIX = "v1";

function deriveKeyFromAuthSecret(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set (>= 32 chars) to encrypt/decrypt secrets");
  }
  return crypto.scryptSync(secret, "SignalHack:secrets", 32);
}

export function encryptSecret(plaintext: string): string {
  const key = deriveKeyFromAuthSecret();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION_PREFIX, iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(":");
}

export function decryptSecret(payload: string): string | null {
  try {
    const [v, ivB64, tagB64, ctB64] = payload.split(":");
    if (v !== VERSION_PREFIX || !ivB64 || !tagB64 || !ctB64) return null;

    const key = deriveKeyFromAuthSecret();
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const ciphertext = Buffer.from(ctB64, "base64");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  } catch {
    return null;
  }
}
