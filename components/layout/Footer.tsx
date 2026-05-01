import { ExternalLink } from "lucide-react";

const toolLinks = [
  { label: "Passkeys Playground", href: "https://learnpasskeys.io/" },
  { label: "WebAuthn Playground", href: "https://webauthn.me/" },
  { label: "OIDC Playground", href: "https://openidconnect.net/" },
  { label: "SAML Tool", href: "https://samltool.io/" },
];

const projectLinks = [
  { label: "Source Code", href: "https://github.com/utshabeb/jwt-ut" },
  { label: "GitHub Profile", href: "https://github.com/utdevnp" },
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
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "var(--jwt-text-muted)" }}
            >
              Built by
            </p>
            <a
              href="https://github.com/utdevnp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold hover-text transition-colors"
              style={{ color: "var(--jwt-cyan)" }}
            >
              @utdevnp
            </a>
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

          {/* Project */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "var(--jwt-text-muted)" }}
            >
              Project
            </p>
            <ul className="space-y-2">
              {projectLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover-text transition-colors flex items-center gap-1"
                    style={{ color: "var(--jwt-text-muted)" }}
                  >
                    <ExternalLink size={12} />
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
          Copyright © {new Date().getFullYear()} <a href="https://github.com/utdevnp" target="_blank" rel="noopener noreferrer" className="hover-text transition-colors" style={{ color: "var(--jwt-cyan)" }}>@utdevnp</a>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
