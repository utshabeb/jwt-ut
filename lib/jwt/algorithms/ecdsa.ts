// ECDSA algorithms: ES256, ES384, ES512
// Uses Web Crypto API

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN.*?-----/, "")
    .replace(/-----END.*?-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buf;
}

function toArrayBuffer(data: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(data);
  return encoded.buffer.slice(0) as ArrayBuffer;
}

function bufToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sigBase64urlToArrayBuffer(sig: string): ArrayBuffer {
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

type ECAlgorithm = "ES256" | "ES384" | "ES512";

function getCurve(alg: ECAlgorithm): string {
  return alg === "ES256" ? "P-256" : alg === "ES384" ? "P-384" : "P-521";
}

function getHash(alg: ECAlgorithm): string {
  return alg === "ES256" ? "SHA-256" : alg === "ES384" ? "SHA-384" : "SHA-512";
}

export async function ecdsaSign(
  algorithm: ECAlgorithm,
  privateKeyPem: string,
  data: string
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "ECDSA", namedCurve: getCurve(algorithm) },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: getHash(algorithm) },
    key,
    toArrayBuffer(data)
  );
  return bufToBase64url(sig);
}

export async function ecdsaVerify(
  algorithm: ECAlgorithm,
  publicKeyPem: string,
  data: string,
  signature: string
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(publicKeyPem),
      { name: "ECDSA", namedCurve: getCurve(algorithm) },
      false,
      ["verify"]
    );

    return await crypto.subtle.verify(
      { name: "ECDSA", hash: getHash(algorithm) },
      key,
      sigBase64urlToArrayBuffer(signature),
      toArrayBuffer(data)
    );
  } catch {
    return false;
  }
}
