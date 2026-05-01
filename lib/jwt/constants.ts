// Default example JWT token (HS256, secret: "your-256-bit-secret")
// header: {"alg":"HS256","typ":"JWT"}
// payload: {"sub":"1234567890","name":"John Doe","admin":true,"iat":1516239022}

export const DEFAULT_SECRET = "your-256-bit-secret";

export const DEFAULT_HEADER = {
  alg: "HS256",
  typ: "JWT",
};

export const DEFAULT_PAYLOAD = {
  sub: "1234567890",
  name: "John Doe",
  admin: true,
  iat: 1516239022,
};

export const DEFAULT_RS256_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2a2rwplBQLzHPZe5TNJG
yTQJkbKnXnbKPRITKJLBHXcOMR3s2YlzUxIl5OzRwQWILFVtMGfDuWpZRzSn2L
4opLO1KxeaUDOkO5nf8QHAO0JF0sVSqnvr6GF4V8VdkSMr4yvKqPH6L6+Q8L+
YlxeMGqN7/wRs3u2pQ87mxWV5iXkv5hQ/qW2tq1M7ZNvp7Cj3M0Oq2RHEi+Km
qbsXg2A7qwAXxvhwIYSzBYjFBhHY6qXkE6mXIDjM6bkCrN/zDPBjCOPnKZ3DIO
2Gv7gfZg1d3v2I5TpzNY2t2Kn9BFn3bkDmL3vYtS3L9VGMhX/JVqKHrYM0hKt
BQIDAQAB
-----END PUBLIC KEY-----`;

export const DEFAULT_RS256_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDZravCmUFAvMc9
l7lM0kbJNAmRsqdedso9EhMoksEddw4xHezZiXNTEiXk7NHBBYgsVW0wZ8O5all
HNKfYviiks7UrF5pQM6Q7md/xAcA7QkXSxVKqe+voYXhXxV2RIyvjK8qo8fovr5
Dwv5iXF4wao3v/BGze7alDzubFZXmJeS/mFD+pba2rUztk2+nsKPczQ6rZEcSL4
qapuxeDYDurABfG+HAhhLMFiMUGEdjqpeQTqZcgOMzpuQKs3/MM8GMI4+cpncMg7
Ya/uB9mDV3e/YjlOnM1ja3Yqf0EWfduQOYve9i1Lcv1UYyFf8lWooetgzSEq0FB
AgMBAAECggEBAMdKgzMB5yPSmAFN/dFBHITDmW4LJRb7c4G6YnLYFpibsIHFJyJW
dxVhWDqIUyR3F3kO+SuLHT6Uc5qfSvnq5mXQzB5vL1eR3w0Yf+oFbTxuJF3n/
QHAO0JF0sVSqnvr6GF4V8VdkSMr4yvKqPH6L6+Q8L+YlxeMGqN7/wRs3u2pQ87
mxWV5iXkv5hQ/qW2tq1M7ZNvp7Cj3M0Oq2RHEi+KmqbsXg2A7qwAXxvhwIYSz
BYjFBhHY6qXkE6mXIDjM6bkCrN/zDPBjCOPnKZ3DIO2Gv7gfZg1d3v2I5TpzNY
2t2Kn9BFn3bkDmL3vYtS3L9VGMhX/JVqKHrYM0hKtAECggEBAO7E1aOXWF3xW3
placeholder_private_key_data
-----END PRIVATE KEY-----`;

export const ALGORITHMS = [
  "HS256", "HS384", "HS512",
  "RS256", "RS384", "RS512",
  "ES256", "ES384", "ES512",
  "PS256", "PS384", "PS512",
  "none",
] as const;

export type SupportedAlgorithm = typeof ALGORITHMS[number];

export function isHmacAlg(alg: string): boolean {
  return alg.startsWith("HS");
}

export function isRsaAlg(alg: string): boolean {
  return alg.startsWith("RS") || alg.startsWith("PS");
}

export function isEcAlg(alg: string): boolean {
  return alg.startsWith("ES");
}

export function algRequiresAsymmetricKey(alg: string): boolean {
  return isRsaAlg(alg) || isEcAlg(alg);
}

export function formatNumericDate(ts: number): string {
  try {
    return new Date(ts * 1000).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return String(ts);
  }
}

export function isExpired(exp: number): boolean {
  return Date.now() / 1000 > exp;
}

export const REGISTERED_CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: "Issuer — identifies the principal that issued the JWT",
  sub: "Subject — identifies the principal that is the subject of the JWT",
  aud: "Audience — identifies the recipients the JWT is intended for",
  exp: "Expiration Time — identifies the expiration time (NumericDate)",
  nbf: "Not Before — identifies the time before which the JWT must not be accepted",
  iat: "Issued At — identifies the time at which the JWT was issued",
  jti: "JWT ID — provides a unique identifier for the JWT",
};
