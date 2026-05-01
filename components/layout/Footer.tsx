import { ExternalLink } from "lucide-react";

const toolLinks = [
  { label: "Passkeys Playground", href: "https://learnpasskeys.io/" },
  { label: "WebAuthn Playground", href: "https://webauthn.me/" },
  { label: "OIDC Playground", href: "https://openidconnect.net/" },
  { label: "SAML Tool", href: "https://samltool.io/" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "https://www.okta.com/privacy-policy/" },
  { label: "Security", href: "https://trust.okta.com/" },
];

export default function Footer() {
  return (
    <footer
      style={{ backgroundColor: "var(--jwt-surface)", borderTop: "1px solid var(--jwt-border)" }}
      className="mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Branding */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "var(--jwt-text-muted)" }}
            >
              Presented by Auth0
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { href: "https://www.youtube.com/oktadev", label: "YouTube" },
                { href: "https://x.com/auth0", label: "X / Twitter" },
                { href: "https://www.linkedin.com/company/oktadev/", label: "LinkedIn" },
              ].map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--jwt-text-muted)" }}
                  className="hover-text transition-colors flex items-center gap-1 text-xs"
                  aria-label={s.label}
                >
                  <ExternalLink size={14} />
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "var(--jwt-text-muted)" }}
            >
              Tools
            </p>
            <ul className="space-y-2">
              {toolLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover-text transition-colors"
                    style={{ color: "var(--jwt-text-muted)" }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "var(--jwt-text-muted)" }}
            >
              Legal
            </p>
            <ul className="space-y-2">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover-text transition-colors"
                    style={{ color: "var(--jwt-text-muted)" }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="pt-6 text-xs"
          style={{ borderTop: "1px solid var(--jwt-border)", color: "var(--jwt-text-muted)" }}
        >
          Copyright © {new Date().getFullYear()} Okta. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
