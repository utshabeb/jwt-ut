// RSA algorithms: RS256, RS384, RS512, PS256, PS384, PS512
// Uses Web Crypto API with PEM import

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

type RSAAlgorithm = "RS256" | "RS384" | "RS512" | "PS256" | "PS384" | "PS512";

function getAlgParams(alg: RSAAlgorithm): RsaHashedImportParams {
  const hash =
    alg.endsWith("256") ? "SHA-256" :
    alg.endsWith("384") ? "SHA-384" : "SHA-512";
  const name = alg.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5";
  return { name, hash };
}

export async function rsaSign(
  algorithm: RSAAlgorithm,
  privateKeyPem: string,
  data: string
): Promise<string> {
  const params = getAlgParams(algorithm);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    params,
    false,
    ["sign"]
  );

  const sigParams =
    params.name === "RSA-PSS"
      ? { name: "RSA-PSS", saltLength: 32 }
      : { name: "RSASSA-PKCS1-v1_5" };

  const sig = await crypto.subtle.sign(sigParams, key, toArrayBuffer(data));
  return bufToBase64url(sig);
}

export async function rsaVerify(
  algorithm: RSAAlgorithm,
  publicKeyPem: string,
  data: string,
  signature: string
): Promise<boolean> {
  try {
    const params = getAlgParams(algorithm);
    const key = await crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(publicKeyPem),
      params,
      false,
      ["verify"]
    );

    const sigParams =
      params.name === "RSA-PSS"
        ? { name: "RSA-PSS", saltLength: 32 }
        : { name: "RSASSA-PKCS1-v1_5" };

    return await crypto.subtle.verify(
      sigParams,
      key,
      base64urlDecodeToArrayBuffer(signature),
      toArrayBuffer(data)
    );
  } catch {
    return false;
  }
}
