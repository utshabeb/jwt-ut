export default function IntroductionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex gap-10">
      {/* Sticky sidebar ToC */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-20">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--jwt-text-muted)" }}
          >
            On this page
          </p>
          <nav className="space-y-1 text-sm">
            {TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block py-1 hover-text transition-colors"
                style={{ color: "var(--jwt-text-muted)" }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <article className="flex-1 min-w-0 prose-custom">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--jwt-text)" }}>
          Introduction to JSON Web Tokens
        </h1>
        <p className="mb-8" style={{ color: "var(--jwt-text-muted)" }}>
          Built by{" "}
          <a
            href="https://github.com/utdevnp"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--jwt-cyan)" }}
            className="hover:underline"
          >
            Utshab Luitel
          </a>{" "}
          — Web Developer at Ebpearls Multipurpose Pvt Ltd, Kathmandu Nepal.
        </p>

        <Section id="what-is-jwt" title="What is JSON Web Token?">
          <p>
            JSON Web Token (JWT) is an open standard (
            <a
              href="https://tools.ietf.org/html/rfc7519"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--jwt-cyan)" }}
            >
              RFC 7519
            </a>
            ) that defines a compact and self-contained way for securely
            transmitting information between parties as a JSON object. This
            information can be verified and trusted because it is digitally
            signed. JWTs can be signed using a secret (with the{" "}
            <strong style={{ color: "var(--jwt-text)" }}>HMAC</strong> algorithm) or a
            public/private key pair using{" "}
            <strong style={{ color: "var(--jwt-text)" }}>RSA</strong> or{" "}
            <strong style={{ color: "var(--jwt-text)" }}>ECDSA</strong>.
          </p>
          <p>
            Although JWTs can be encrypted to also provide secrecy between
            parties, we will focus on <em>signed</em> tokens. Signed tokens can
            verify the <em>integrity</em> of the claims contained within it,
            while encrypted tokens <em>hide</em> those claims from other
            parties. When tokens are signed using public/private key pairs, the
            signature also certifies that only the party holding the private key
            is the one that signed it.
          </p>
        </Section>

        <Section id="when-to-use" title="When should you use JSON Web Tokens?">
          <p>Here are some scenarios where JSON Web Tokens are useful:</p>
          <ul>
            <li>
              <strong style={{ color: "var(--jwt-text)" }}>Authorization</strong> — The most
              common scenario. Once the user is logged in, each subsequent
              request will include the JWT, allowing the user to access routes,
              services, and resources that are permitted with that token. Single
              Sign On is a feature that widely uses JWT nowadays because of its
              small overhead and its ability to be easily used across different
              domains.
            </li>
            <li>
              <strong style={{ color: "var(--jwt-text)" }}>Information Exchange</strong> —
              JSON Web Tokens are a good way of securely transmitting
              information between parties. Because JWTs can be signed—for
              example, using public/private key pairs—you can be sure the
              senders are who they say they are. Additionally, as the signature
              is calculated using the header and the payload, you can also
              verify that the content hasn&apos;t been tampered with.
            </li>
          </ul>
        </Section>

        <Section id="structure" title="What is the JSON Web Token structure?">
          <p>
            In its compact form, JSON Web Tokens consist of three parts
            separated by dots (<code>.</code>):
          </p>
          <ul>
            <li>
              <span style={{ color: "var(--jwt-red)" }}>Header</span>
            </li>
            <li>
              <span style={{ color: "var(--jwt-purple)" }}>Payload</span>
            </li>
            <li>
              <span style={{ color: "var(--jwt-cyan)" }}>Signature</span>
            </li>
          </ul>
          <p>Therefore, a JWT typically looks like:</p>
          <CodeBlock>
            <span style={{ color: "var(--jwt-red)" }}>xxxxx</span>
            <span style={{ color: "var(--jwt-text)" }}>.</span>
            <span style={{ color: "var(--jwt-purple)" }}>yyyyy</span>
            <span style={{ color: "var(--jwt-text)" }}>.</span>
            <span style={{ color: "var(--jwt-cyan)" }}>zzzzz</span>
          </CodeBlock>

          <h3
            className="text-lg font-semibold mt-6 mb-2"
            style={{ color: "var(--jwt-red)" }}
          >
            Header
          </h3>
          <p>
            The header typically consists of two parts: the type of the token
            (JWT) and the signing algorithm being used, such as HMAC SHA256 or
            RSA.
          </p>
          <CodeBlock>
            {`{
  "alg": "HS256",
  "typ": "JWT"
}`}
          </CodeBlock>
          <p>
            This JSON is <strong style={{ color: "var(--jwt-text)" }}>Base64Url</strong>{" "}
            encoded to form the first part of the JWT.
          </p>

          <h3
            className="text-lg font-semibold mt-6 mb-2"
            style={{ color: "var(--jwt-purple)" }}
          >
            Payload
          </h3>
          <p>
            The second part of the token is the payload, which contains the
            claims. Claims are statements about an entity (typically, the user)
            and additional data. There are three types of claims:{" "}
            <em>registered</em>, <em>public</em>, and <em>private</em> claims.
          </p>
          <ul>
            <li>
              <strong style={{ color: "var(--jwt-text)" }}>Registered claims</strong> — A set
              of predefined claims which are not mandatory but recommended:{" "}
              <code>iss</code> (issuer), <code>exp</code> (expiration time),{" "}
              <code>sub</code> (subject), <code>aud</code> (audience), and
              others.
            </li>
            <li>
              <strong style={{ color: "var(--jwt-text)" }}>Public claims</strong> — Can be
              defined at will by those using JWTs. To avoid collisions, they
              should be defined in the IANA JSON Web Token Registry or as a
              URI.
            </li>
            <li>
              <strong style={{ color: "var(--jwt-text)" }}>Private claims</strong> — Custom
              claims created to share information between parties that agree on
              using them.
            </li>
          </ul>
          <CodeBlock>
            {`{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}`}
          </CodeBlock>

          <h3
            className="text-lg font-semibold mt-6 mb-2"
            style={{ color: "var(--jwt-cyan)" }}
          >
            Signature
          </h3>
          <p>
            To create the signature, you take the encoded header, the encoded
            payload, a secret, the algorithm specified in the header, and sign
            that.
          </p>
          <CodeBlock>
            {`HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)`}
          </CodeBlock>
          <p>
            The signature is used to verify the message wasn&apos;t changed
            along the way, and in the case of tokens signed with a private key,
            it can also verify that the sender of the JWT is who it says it is.
          </p>
        </Section>

        <Section id="how-it-works" title="How do JSON Web Tokens work?">
          <p>
            In authentication, when the user successfully logs in using their
            credentials, a JSON Web Token will be returned. Since tokens are
            credentials, great care must be taken to prevent security issues.
          </p>
          <p>
            Whenever the user wants to access a protected route or resource, the
            user agent should send the JWT, typically in the{" "}
            <strong style={{ color: "var(--jwt-text)" }}>Authorization</strong> header using
            the <strong style={{ color: "var(--jwt-text)" }}>Bearer</strong> schema:
          </p>
          <CodeBlock>{`Authorization: Bearer <token>`}</CodeBlock>
          <p>
            The server&apos;s protected routes will check for a valid JWT in the
            Authorization header, and if it&apos;s present, the user will be
            allowed to access protected resources.
          </p>
        </Section>

        <Section id="why-jwt" title="Why should we use JSON Web Tokens?">
          <p>
            As JSON is less verbose than XML, when it is encoded its size is
            smaller, making JWT more compact than SAML. This makes JWT a good
            choice to be passed in HTML and HTTP environments.
          </p>
          <p>
            Security-wise, SWT can only be symmetrically signed by a shared
            secret using the HMAC algorithm. However, JWT and SAML tokens can
            use a public/private key pair for signing. Signing XML with XML
            Digital Signature without introducing obscure security holes is very
            difficult compared to the simplicity of signing JSON.
          </p>
          <p>
            JSON parsers are common in most programming languages because they
            map directly to objects. Conversely, XML doesn&apos;t have a natural
            document-to-object mapping.
          </p>
        </Section>

        <Section
          id="validate-vs-verify"
          title="Difference Between Validating and Verifying a JWT"
        >
          <p>
            JWT validation and verification address slightly different aspects
            of JWT security:
          </p>
          <ul>
            <li>
              <strong style={{ color: "var(--jwt-text)" }}>JWT Validation</strong> — checks
              the structure, format, and content of the JWT: that it has three
              parts, each part is correctly Base64URL encoded, and that claims
              like <code>exp</code>, <code>nbf</code>, <code>iat</code> are
              valid.
            </li>
            <li>
              <strong style={{ color: "var(--jwt-text)" }}>JWT Verification</strong> — confirms
              the authenticity and integrity of the token by checking the
              signature against the header and payload using the algorithm
              specified in the header and the correct key.
            </li>
          </ul>
        </Section>

        <Section
          id="decode-vs-encode"
          title="Difference Between Decoding and Encoding a JWT"
        >
          <p>
            <strong style={{ color: "var(--jwt-text)" }}>Encoding</strong> a JWT involves
            transforming the header and payload into a compact, URL-safe format:
            both are JSON-serialised then Base64URL encoded, concatenated with a
            dot, and a signature is appended.
          </p>
          <p>
            <strong style={{ color: "var(--jwt-text)" }}>Decoding</strong> reverses this
            process by converting the Base64URL-encoded header and payload back
            into JSON — anyone can do this without needing a key. Verification
            is the additional step of re-computing the signature and comparing
            it to the one in the token.
          </p>
        </Section>

        {/* CTA */}
        <div
          className="mt-12 rounded-xl p-8 text-center"
          style={{
            backgroundColor: "var(--jwt-surface)",
            border: "1px solid var(--jwt-border)",
          }}
        >
          <h3 className="text-xl font-bold mb-2" style={{ color: "var(--jwt-text)" }}>
            Get Started with JSON Web Tokens
          </h3>
          <p className="mb-4" style={{ color: "var(--jwt-text-muted)" }}>
            Explore more open source projects by Utshab Luitel — web developer at
            Ebpearls Multipurpose Pvt Ltd, Kathmandu Nepal.
          </p>
          <a
            href="https://github.com/utdevnp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 rounded font-semibold text-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--jwt-cyan)",
              color: "#0f3460",
            }}
          >
            View GitHub Profile
          </a>
        </div>
      </article>
    </div>
  );
}

// ---- Sub-components ----

const TOC = [
  { id: "what-is-jwt", label: "What is JWT?" },
  { id: "when-to-use", label: "When to use JWTs?" },
  { id: "structure", label: "JWT Structure" },
  { id: "how-it-works", label: "How JWTs work" },
  { id: "why-jwt", label: "Why use JWTs?" },
  { id: "validate-vs-verify", label: "Validate vs Verify" },
  { id: "decode-vs-encode", label: "Decode vs Encode" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <h2 className="text-xl font-bold mb-4 pb-2" style={{ color: "var(--jwt-text)", borderBottom: "1px solid var(--jwt-border)" }}>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--jwt-text-muted)" }}>
        {children}
      </div>
    </section>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre
      className="rounded p-4 font-mono text-xs overflow-x-auto my-3 leading-relaxed"
      style={{
        backgroundColor: "var(--jwt-code-bg)",
        border: "1px solid var(--jwt-border)",
        color: "var(--jwt-text)",
      }}
    >
      <code>{children}</code>
    </pre>
  );
}
