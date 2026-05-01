// Core JWT decode, sign, and verify logic
// Works in browser (Web Crypto API) and Node.js Edge runtime

import { base64urlEncode, base64urlDecode, base64urlDecodeToString } from "./base64url";
import { hmacSign, hmacVerify } from "./algorithms/hmac";
import { rsaSign, rsaVerify } from "./algorithms/rsa";
import { ecdsaSign, ecdsaVerify } from "./algorithms/ecdsa";
import type {
  Algorithm,
  JOSEHeader,
  JWTPayload,
  DecodeResult,
  VerifyOptions,
  SignOptions,
  JWTValidationError,
} from "./types";

export * from "./types";
export * from "./base64url";

// ---------------------------------------------------------------------------
// Decode (no verification)
// ---------------------------------------------------------------------------

export function decodeJWT(token: string): DecodeResult | { error: JWTValidationError } {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return {
      error: {
        code: "INVALID_FORMAT",
        message: `JWT must have exactly 3 parts separated by '.', got ${parts.length}`,
      },
    };
  }

  let header: JOSEHeader;
  let payload: JWTPayload;

  try {
    header = JSON.parse(base64urlDecodeToString(parts[0]));
  } catch {
    return { error: { code: "INVALID_HEADER", message: "Failed to parse JWT header as JSON" } };
  }

  try {
    payload = JSON.parse(base64urlDecodeToString(parts[1]));
  } catch {
    return { error: { code: "INVALID_PAYLOAD", message: "Failed to parse JWT payload as JSON" } };
  }

  return {
    header,
    payload,
    signature: parts[2],
    parts: [parts[0], parts[1], parts[2]],
  };
}

// ---------------------------------------------------------------------------
// Sign
// ---------------------------------------------------------------------------

export async function signJWT(
  payload: JWTPayload,
  keyOrSecret: string,
  options: SignOptions = {}
): Promise<string> {
  const alg: Algorithm = options.algorithm ?? "HS256";
  const now = Math.floor(Date.now() / 1000);

  const claims: JWTPayload = { ...payload };
  if (options.issuer) claims.iss = options.issuer;
  if (options.subject) claims.sub = options.subject;
  if (options.audience) claims.aud = options.audience;
  if (options.jwtid) claims.jti = options.jwtid;
  if (!claims.iat) claims.iat = now;
  if (options.expiresIn !== undefined) claims.exp = now + options.expiresIn;
  if (options.notBefore !== undefined) claims.nbf = now + options.notBefore;

  const header: JOSEHeader = {
    alg,
    typ: "JWT",
    ...(options.header ?? {}),
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(claims));
  const signingInput = `${headerB64}.${payloadB64}`;

  let signature = "";

  if (alg === "none") {
    signature = "";
  } else if (alg.startsWith("HS")) {
    const secret = options.secretBase64
      ? base64urlDecode(keyOrSecret)
      : keyOrSecret;
    signature = await hmacSign(alg as "HS256" | "HS384" | "HS512", secret, signingInput);
  } else if (alg.startsWith("RS") || alg.startsWith("PS")) {
    signature = await rsaSign(alg as "RS256" | "RS384" | "RS512" | "PS256" | "PS384" | "PS512", keyOrSecret, signingInput);
  } else if (alg.startsWith("ES")) {
    signature = await ecdsaSign(alg as "ES256" | "ES384" | "ES512", keyOrSecret, signingInput);
  }

  return `${signingInput}.${signature}`;
}

// ---------------------------------------------------------------------------
// Verify
// ---------------------------------------------------------------------------

export interface VerifyResult {
  valid: boolean;
  header?: JOSEHeader;
  payload?: JWTPayload;
  error?: JWTValidationError;
}

export async function verifyJWT(
  token: string,
  keyOrSecret: string,
  options: VerifyOptions = {}
): Promise<VerifyResult> {
  const decoded = decodeJWT(token);

  if ("error" in decoded) {
    return { valid: false, error: decoded.error };
  }

  const { header, payload, signature, parts } = decoded;
  const signingInput = `${parts[0]}.${parts[1]}`;
  const alg = header.alg;

  // alg=none guard
  if (alg === "none") {
    if (!options.allowUnsecured) {
      return {
        valid: false,
        header,
        payload,
        error: {
          code: "UNSECURED_NOT_ALLOWED",
          message: "Unsecured JWTs (alg=none) are not allowed unless allowUnsecured=true",
        },
      };
    }
    // For unsecured, no signature to verify
  } else {
    // Verify signature
    let sigValid = false;

    try {
      if (alg.startsWith("HS")) {
        const secret = options.algorithms?.includes(alg as Algorithm) === false
          ? (() => { throw new Error("alg not allowed") })()
          : keyOrSecret;
        sigValid = await hmacVerify(alg as "HS256" | "HS384" | "HS512", secret, signingInput, signature);
      } else if (alg.startsWith("RS") || alg.startsWith("PS")) {
        sigValid = await rsaVerify(alg as "RS256" | "RS384" | "RS512" | "PS256" | "PS384" | "PS512", keyOrSecret, signingInput, signature);
      } else if (alg.startsWith("ES")) {
        sigValid = await ecdsaVerify(alg as "ES256" | "ES384" | "ES512", keyOrSecret, signingInput, signature);
      }
    } catch {
      sigValid = false;
    }

    if (!sigValid) {
      return {
        valid: false,
        header,
        payload,
        error: { code: "SIGNATURE_INVALID", message: "JWT signature verification failed" },
      };
    }
  }

  // Claim validation
  const now = Math.floor(Date.now() / 1000);
  const tolerance = options.clockTolerance ?? 0;

  if (!options.ignoreExpiration && payload.exp !== undefined) {
    if (now > payload.exp + tolerance) {
      return {
        valid: false,
        header,
        payload,
        error: { code: "TOKEN_EXPIRED", message: `JWT expired at ${new Date(payload.exp * 1000).toISOString()}` },
      };
    }
  }

  if (!options.ignoreNotBefore && payload.nbf !== undefined) {
    if (now < payload.nbf - tolerance) {
      return {
        valid: false,
        header,
        payload,
        error: {
          code: "TOKEN_NOT_YET_VALID",
          message: `JWT not valid before ${new Date(payload.nbf * 1000).toISOString()}`,
        },
      };
    }
  }

  if (options.issuer && payload.iss !== options.issuer) {
    return {
      valid: false,
      header,
      payload,
      error: { code: "ISSUER_MISMATCH", message: `Expected issuer "${options.issuer}", got "${payload.iss}"` },
    };
  }

  if (options.audience) {
    const expected = Array.isArray(options.audience) ? options.audience : [options.audience];
    const actual = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
    const match = expected.some((e) => actual.includes(e));
    if (!match) {
      return {
        valid: false,
        header,
        payload,
        error: { code: "AUDIENCE_MISMATCH", message: `Audience mismatch` },
      };
    }
  }

  return { valid: true, header, payload };
}

// ---------------------------------------------------------------------------
// Utility: decode without verifying (for display)
// ---------------------------------------------------------------------------

export function safeDecode(token: string): { header: JOSEHeader | null; payload: JWTPayload | null; signature: string } {
  const result = decodeJWT(token);
  if ("error" in result) {
    return { header: null, payload: null, signature: "" };
  }
  return { header: result.header, payload: result.payload, signature: result.signature };
}
