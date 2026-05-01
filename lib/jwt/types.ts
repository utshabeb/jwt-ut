// JWT Types per RFC 7519

export type Algorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512"
  | "none";

export interface JOSEHeader {
  alg: Algorithm;
  typ?: string;
  cty?: string;
  kid?: string;
  [key: string]: unknown;
}

// RFC 7519 §4.1 Registered Claim Names
export interface RegisteredClaims {
  /** Issuer */
  iss?: string;
  /** Subject */
  sub?: string;
  /** Audience */
  aud?: string | string[];
  /** Expiration Time (NumericDate) */
  exp?: number;
  /** Not Before (NumericDate) */
  nbf?: number;
  /** Issued At (NumericDate) */
  iat?: number;
  /** JWT ID */
  jti?: string;
}

export type JWTPayload = RegisteredClaims & Record<string, unknown>;

export interface DecodeResult {
  header: JOSEHeader;
  payload: JWTPayload;
  signature: string;
  /** Raw encoded parts */
  parts: [string, string, string];
}

export interface VerifyOptions {
  /** Expected audience */
  audience?: string | string[];
  /** Expected issuer */
  issuer?: string;
  /** Clock tolerance in seconds for exp/nbf (default: 0) */
  clockTolerance?: number;
  /** Skip expiration check */
  ignoreExpiration?: boolean;
  /** Skip not-before check */
  ignoreNotBefore?: boolean;
  /** Allowed algorithms (default: all except none) */
  algorithms?: Algorithm[];
  /** Allow alg=none tokens (default: false — must be explicit) */
  allowUnsecured?: boolean;
}

export interface SignOptions {
  algorithm?: Algorithm;
  expiresIn?: number; // seconds
  notBefore?: number; // seconds
  audience?: string | string[];
  issuer?: string;
  subject?: string;
  jwtid?: string;
  header?: Partial<JOSEHeader>;
  /** For HS*, provide raw secret string */
  secret?: string;
  /** Base64url-encoded secret */
  secretBase64?: boolean;
}

export type KeyLike = string | CryptoKey;

export interface JWTValidationError {
  code:
    | "INVALID_FORMAT"
    | "INVALID_HEADER"
    | "INVALID_PAYLOAD"
    | "ALGORITHM_MISMATCH"
    | "SIGNATURE_INVALID"
    | "TOKEN_EXPIRED"
    | "TOKEN_NOT_YET_VALID"
    | "AUDIENCE_MISMATCH"
    | "ISSUER_MISMATCH"
    | "UNSECURED_NOT_ALLOWED";
  message: string;
}
