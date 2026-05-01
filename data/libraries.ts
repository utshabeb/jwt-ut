export interface Library {
  name: string;
  author: string;
  authorUrl?: string;
  stars: number;
  repoUrl: string;
  installCmd: string;
  language: string;
  features: {
    sign: boolean;
    verify: boolean;
    iss: boolean;
    sub: boolean;
    aud: boolean;
    exp: boolean;
    nbf: boolean;
    iat: boolean;
    jti: boolean;
    typ: boolean;
  };
  algorithms: string[];
  minVersion?: string;
}

const ALL_ALGOS = [
  "HS256","HS384","HS512",
  "RS256","RS384","RS512",
  "ES256","ES256K","ES384","ES512",
  "PS256","PS384","PS512","EdDSA",
];

const ALL_FEATURES = {
  sign: true, verify: true,
  iss: true, sub: true, aud: true, exp: true,
  nbf: true, iat: true, jti: true, typ: true,
};

export const LIBRARIES: Library[] = [
  // Node.js
  {
    name: "auth0/node-jsonwebtoken",
    author: "Auth0",
    authorUrl: "https://auth0.com",
    stars: 17900,
    repoUrl: "https://github.com/auth0/node-jsonwebtoken",
    installCmd: "npm install jsonwebtoken",
    language: "Node.js",
    features: ALL_FEATURES,
    algorithms: ["HS256","HS384","HS512","RS256","RS384","RS512","ES256","ES384","ES512","PS256","PS384","PS512"],
  },
  {
    name: "panva/jose",
    author: "Filip Skokan",
    authorUrl: "https://github.com/panva",
    stars: 4980,
    repoUrl: "https://github.com/panva/jose",
    installCmd: "npm install jose",
    language: "Node.js",
    features: ALL_FEATURES,
    algorithms: ALL_ALGOS,
  },
  {
    name: "auth0/jwks-rsa",
    author: "Auth0",
    authorUrl: "https://auth0.com",
    stars: 980,
    repoUrl: "https://github.com/auth0/node-jwks-rsa",
    installCmd: "npm install jwks-rsa",
    language: "Node.js",
    features: { ...ALL_FEATURES, sign: false, nbf: false, iat: false, jti: false, typ: false },
    algorithms: ["RS256","RS384","RS512","ES256","ES384","ES512"],
  },

  // Python
  {
    name: "jpadilla/pyjwt",
    author: "Jose Padilla",
    authorUrl: "https://github.com/jpadilla",
    stars: 5200,
    repoUrl: "https://github.com/jpadilla/pyjwt",
    installCmd: "pip install PyJWT",
    language: "Python",
    features: ALL_FEATURES,
    algorithms: ["HS256","HS384","HS512","RS256","RS384","RS512","ES256","ES384","ES512","PS256","PS384","PS512","EdDSA"],
  },
  {
    name: "mpdavis/python-jose",
    author: "Michael Davis",
    authorUrl: "https://github.com/mpdavis",
    stars: 1400,
    repoUrl: "https://github.com/mpdavis/python-jose",
    installCmd: "pip install python-jose",
    language: "Python",
    features: ALL_FEATURES,
    algorithms: ["HS256","HS384","HS512","RS256","RS384","RS512","ES256","ES384","ES512","PS256","PS384","PS512"],
  },

  // Go
  {
    name: "golang-jwt/jwt",
    author: "golang-jwt",
    authorUrl: "https://github.com/golang-jwt",
    stars: 6587,
    repoUrl: "https://github.com/golang-jwt/jwt",
    installCmd: "go get github.com/golang-jwt/jwt/v5",
    language: "Go",
    features: ALL_FEATURES,
    algorithms: ALL_ALGOS,
    minVersion: "v3.2.2",
  },
  {
    name: "lestrrat-go/jwx",
    author: "lestrrat",
    authorUrl: "https://github.com/lestrrat",
    stars: 1819,
    repoUrl: "https://github.com/lestrrat-go/jwx",
    installCmd: "go get github.com/lestrrat-go/jwx",
    language: "Go",
    features: ALL_FEATURES,
    algorithms: ALL_ALGOS,
  },

  // Java
  {
    name: "auth0/java-jwt",
    author: "Auth0",
    authorUrl: "https://auth0.com",
    stars: 4900,
    repoUrl: "https://github.com/auth0/java-jwt",
    installCmd: 'implementation "com.auth0:java-jwt:4.4.0"',
    language: "Java",
    features: ALL_FEATURES,
    algorithms: ["HS256","HS384","HS512","RS256","RS384","RS512","ES256","ES384","ES512","PS256","PS384","PS512"],
  },
  {
    name: "jwtk/jjwt",
    author: "Les Hazlewood",
    authorUrl: "https://github.com/lhazlewood",
    stars: 10300,
    repoUrl: "https://github.com/jwtk/jjwt",
    installCmd: 'implementation "io.jsonwebtoken:jjwt-api:0.12.3"',
    language: "Java",
    features: ALL_FEATURES,
    algorithms: ALL_ALGOS,
  },

  // Ruby
  {
    name: "jwt/ruby-jwt",
    author: "JWT Maintainers",
    authorUrl: "https://github.com/jwt",
    stars: 3600,
    repoUrl: "https://github.com/jwt/ruby-jwt",
    installCmd: "gem install jwt",
    language: "Ruby",
    features: ALL_FEATURES,
    algorithms: ["HS256","HS384","HS512","RS256","RS384","RS512","ES256","ES384","ES512","PS256","PS384","PS512","EdDSA"],
  },

  // PHP
  {
    name: "firebase/php-jwt",
    author: "Firebase",
    authorUrl: "https://firebase.google.com",
    stars: 9700,
    repoUrl: "https://github.com/firebase/php-jwt",
    installCmd: "composer require firebase/php-jwt",
    language: "PHP",
    features: ALL_FEATURES,
    algorithms: ["HS256","HS384","HS512","RS256","RS384","RS512","ES256","ES384","ES512","PS256","PS384","PS512","EdDSA"],
  },
  {
    name: "lcobucci/jwt",
    author: "Luís Cobucci",
    authorUrl: "https://github.com/lcobucci",
    stars: 2400,
    repoUrl: "https://github.com/lcobucci/jwt",
    installCmd: "composer require lcobucci/jwt",
    language: "PHP",
    features: ALL_FEATURES,
    algorithms: ["HS256","HS384","HS512","RS256","RS384","RS512","ES256","ES384","ES512","PS256","PS384","PS512","EdDSA"],
  },

  // .NET
  {
    name: "AzureAD/azure-activedirectory-identitymodel-extensions",
    author: "Microsoft",
    authorUrl: "https://microsoft.com",
    stars: 1021,
    repoUrl: "https://github.com/MSOpenTech/azure-activedirectory-identitymodel-extensions-for-dotnet",
    installCmd: "Install-Package System.IdentityModel.Tokens.Jwt",
    language: ".NET",
    features: ALL_FEATURES,
    algorithms: ALL_ALGOS,
  },
  {
    name: "jwt-dotnet/jwt",
    author: "Alexander Batishchev",
    authorUrl: "https://github.com/jwt-dotnet",
    stars: 2102,
    repoUrl: "https://github.com/jwt-dotnet/jwt",
    installCmd: "Install-Package JWT.NET",
    language: ".NET",
    features: ALL_FEATURES,
    algorithms: ALL_ALGOS,
  },

  // Rust
  {
    name: "Keats/jsonwebtoken",
    author: "Vincent Prouillet",
    authorUrl: "https://github.com/Keats",
    stars: 1700,
    repoUrl: "https://github.com/Keats/jsonwebtoken",
    installCmd: 'jsonwebtoken = "9"',
    language: "Rust",
    features: ALL_FEATURES,
    algorithms: ["HS256","HS384","HS512","RS256","RS384","RS512","ES256","ES384","ES512","PS256","PS384","PS512","EdDSA"],
  },

  // Swift
  {
    name: "vapor/jwt-kit",
    author: "Vapor",
    authorUrl: "https://vapor.codes",
    stars: 450,
    repoUrl: "https://github.com/vapor/jwt-kit",
    installCmd: '.package(url: "https://github.com/vapor/jwt-kit.git", from: "4.0.0")',
    language: "Swift",
    features: ALL_FEATURES,
    algorithms: ["HS256","HS384","HS512","RS256","RS384","RS512","ES256","ES384","ES512","PS256","PS384","PS512","EdDSA"],
  },

  // Elixir
  {
    name: "ueberauth/guardian",
    author: "hassox",
    authorUrl: "https://github.com/ueberauth",
    stars: 3390,
    repoUrl: "https://github.com/ueberauth/guardian",
    installCmd: '{:guardian, "~> 2.0"}',
    language: "Elixir",
    features: ALL_FEATURES,
    algorithms: ["HS256","HS384","HS512","RS256","RS384","RS512","ES256","ES384","ES512"],
  },
];

export const LANGUAGES = [
  "All",
  "Node.js",
  "Python",
  "Go",
  "Java",
  "Ruby",
  "PHP",
  ".NET",
  "Rust",
  "Swift",
  "Elixir",
];
