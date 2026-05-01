// JWKS auto-fetch and verification utility
// Fetches OIDC discovery doc → jwks_uri → matching key → verifies signature

export interface JWKSKey {
  kty: string;
  use?: string;
  kid?: string;
  n?: string;   // RSA modulus
  e?: string;   // RSA exponent
  x?: string;   // EC x
  y?: string;   // EC y
  crv?: string; // EC curve
  alg?: string;
}

export interface JWKSResult {
  valid: boolean;
  error?: string;
  kid?: string;
  issuer?: string;
}

// Cache: issuer → jwks_uri
const discoveryCache = new Map<string, string>();
// Cache: jwks_uri → keys (short TTL)
const jwksCache = new Map<string, { keys: JWKSKey[]; fetchedAt: number }>();
const JWKS_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getJwksUri(issuer: string): Promise<string> {
  if (discoveryCache.has(issuer)) return discoveryCache.get(issuer)!;

  // Normalise issuer — strip trailing slash
  const base = issuer.replace(/\/$/, "");
  const discoveryUrl = `${base}/.well-known/openid-configuration`;

  const res = await fetch(discoveryUrl, { next: { revalidate: 300 } } as RequestInit);
  if (!res.ok) throw new Error(`OIDC discovery failed: ${res.status} ${discoveryUrl}`);

  const doc = await res.json();
  if (!doc.jwks_uri) throw new Error("No jwks_uri in OIDC discovery document");

  discoveryCache.set(issuer, doc.jwks_uri);
  return doc.jwks_uri;
}

async function getJwksKeys(jwksUri: string): Promise<JWKSKey[]> {
  const cached = jwksCache.get(jwksUri);
  if (cached && Date.now() - cached.fetchedAt < JWKS_TTL_MS) return cached.keys;

  const res = await fetch(jwksUri, { next: { revalidate: 300 } } as RequestInit);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status} ${jwksUri}`);

  const doc = await res.json();
  const keys: JWKSKey[] = doc.keys ?? [];
  jwksCache.set(jwksUri, { keys, fetchedAt: Date.now() });
  return keys;
}

function base64urlToArrayBuffer(b64: string): ArrayBuffer {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const s = pad ? padded + "=".repeat(4 - pad) : padded;
  const binary = atob(s);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buf;
}

async function importRsaPublicKey(jwk: JWKSKey, alg: string): Promise<CryptoKey> {
  const hash = alg.endsWith("384") ? "SHA-384" : alg.endsWith("512") ? "SHA-512" : "SHA-256";
  const name = alg.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5";
  return crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: jwk.alg, use: jwk.use } as JsonWebKey,
    { name, hash },
    false,
    ["verify"]
  );
}

async function importEcPublicKey(jwk: JWKSKey): Promise<CryptoKey> {
  const crv = jwk.crv ?? "P-256";
  const namedCurve = crv === "P-384" ? "P-384" : crv === "P-521" ? "P-521" : "P-256";
  return crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, use: jwk.use } as JsonWebKey,
    { name: "ECDSA", namedCurve },
    false,
    ["verify"]
  );
}

function toBuffer(s: string): ArrayBuffer {
  return new TextEncoder().encode(s).buffer.slice(0) as ArrayBuffer;
}

async function verifyWithKey(
  jwk: JWKSKey,
  alg: string,
  headerPayload: string,
  signature: string
): Promise<boolean> {
  try {
    const sigBuf = base64urlToArrayBuffer(signature);
    const dataBuf = toBuffer(headerPayload);

    if (jwk.kty === "RSA") {
      const key = await importRsaPublicKey(jwk, alg);
      const hash = alg.endsWith("384") ? "SHA-384" : alg.endsWith("512") ? "SHA-512" : "SHA-256";
      const params = alg.startsWith("PS")
        ? { name: "RSA-PSS", saltLength: 32 }
        : { name: "RSASSA-PKCS1-v1_5" };
      // Suppress unused hash warning — it's used in importRsaPublicKey
      void hash;
      return await crypto.subtle.verify(params, key, sigBuf, dataBuf);
    }

    if (jwk.kty === "EC") {
      const key = await importEcPublicKey(jwk);
      const crv = jwk.crv ?? "P-256";
      const hash = crv === "P-384" ? "SHA-384" : crv === "P-521" ? "SHA-512" : "SHA-256";
      return await crypto.subtle.verify({ name: "ECDSA", hash }, key, sigBuf, dataBuf);
    }

    return false;
  } catch {
    return false;
  }
}

export async function jwksVerify(token: string): Promise<JWKSResult> {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return { valid: false, error: "Invalid token structure" };

    const [headerB64, payloadB64, signatureB64] = parts;
    const headerPayload = `${headerB64}.${payloadB64}`;

    // Decode header
    let header: { alg?: string; kid?: string };
    try {
      header = JSON.parse(atob(headerB64.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
      return { valid: false, error: "Cannot decode token header" };
    }

    const alg = header.alg ?? "";
    if (!alg || alg === "none") return { valid: false, error: "Token uses alg=none, cannot verify via JWKS" };

    // Decode payload to get issuer
    let payload: { iss?: string };
    try {
      const padded = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
      const pad = padded.length % 4;
      payload = JSON.parse(atob(pad ? padded + "=".repeat(4 - pad) : padded));
    } catch {
      return { valid: false, error: "Cannot decode token payload" };
    }

    if (!payload.iss) return { valid: false, error: "No issuer (iss) claim in token" };

    const jwksUri = await getJwksUri(payload.iss);
    const keys = await getJwksKeys(jwksUri);

    if (keys.length === 0) return { valid: false, error: "No keys found in JWKS" };

    // Try matching kid first, then try all keys
    const candidates = header.kid
      ? keys.filter((k) => k.kid === header.kid)
      : keys;

    if (header.kid && candidates.length === 0) {
      return { valid: false, error: `No JWKS key found matching kid=${header.kid}` };
    }

    for (const key of candidates) {
      const ok = await verifyWithKey(key, alg, headerPayload, signatureB64);
      if (ok) return { valid: true, kid: key.kid, issuer: payload.iss };
    }

    return { valid: false, error: "Signature verification failed against all matching JWKS keys", issuer: payload.iss };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : "JWKS verification error" };
  }
}

/** Returns true if the token's issuer looks like it uses OIDC / JWKS */
export function isPublicToken(token: string): boolean {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return false;
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4;
    const payload = JSON.parse(atob(pad ? padded + "=".repeat(4 - pad) : padded));
    const iss: string = payload.iss ?? "";
    // Must be an https URL (public OIDC issuer)
    return iss.startsWith("https://");
  } catch {
    return false;
  }
}
