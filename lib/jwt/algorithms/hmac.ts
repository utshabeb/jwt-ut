// HMAC algorithms: HS256, HS384, HS512
// Uses Web Crypto API (works in browser + Edge runtime)

function toArrayBuffer(data: string | Uint8Array): ArrayBuffer {
  if (typeof data === "string") {
    const encoded = new TextEncoder().encode(data);
    return encoded.buffer.slice(0) as ArrayBuffer;
  }
  return data.buffer.slice(0) as ArrayBuffer;
}

function base64urlDecodeToArrayBuffer(sig: string): ArrayBuffer {
  const padded = sig.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const paddedStr = pad ? padded + "=".repeat(4 - pad) : padded;
  const binary = atob(paddedStr);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buf;
}

export async function hmacSign(
  algorithm: "HS256" | "HS384" | "HS512",
  secret: string | Uint8Array,
  data: string
): Promise<string> {
  const hashAlg =
    algorithm === "HS256" ? "SHA-256" : algorithm === "HS384" ? "SHA-384" : "SHA-512";

  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(secret),
    { name: "HMAC", hash: hashAlg },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, toArrayBuffer(data));

  const bytes = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hmacVerify(
  algorithm: "HS256" | "HS384" | "HS512",
  secret: string | Uint8Array,
  data: string,
  signature: string
): Promise<boolean> {
  try {
    const hashAlg =
      algorithm === "HS256" ? "SHA-256" : algorithm === "HS384" ? "SHA-384" : "SHA-512";

    const key = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(secret),
      { name: "HMAC", hash: hashAlg },
      false,
      ["verify"]
    );

    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlDecodeToArrayBuffer(signature),
      toArrayBuffer(data)
    );
  } catch {
    return false;
  }
}
