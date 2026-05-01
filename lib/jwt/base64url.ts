// Base64url encoding/decoding per RFC 7519 / RFC 4648

export function base64urlEncode(input: string | Uint8Array): string {
  let binary = "";
  if (typeof input === "string") {
    const bytes = new TextEncoder().encode(input);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
  } else {
    for (let i = 0; i < input.byteLength; i++) {
      binary += String.fromCharCode(input[i]);
    }
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function base64urlDecodeToArrayBuffer(input: string): ArrayBuffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
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

export function base64urlDecode(input: string): Uint8Array {
  return new Uint8Array(base64urlDecodeToArrayBuffer(input));
}

export function base64urlDecodeToString(input: string): string {
  return new TextDecoder().decode(base64urlDecodeToArrayBuffer(input));
}
