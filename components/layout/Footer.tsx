import { ExternalLink, MapPin, Building2 } from "lucide-react";

const toolLinks = [
  { label: "Passkeys Playground", href: "https://learnpasskeys.io/" },
  { label: "WebAuthn Playground", href: "https://webauthn.me/" },
  { label: "OIDC Playground", href: "https://openidconnect.net/" },
  { label: "SAML Tool", href: "https://samltool.io/" },
];

const legalLinks = [
  { label: "MIT License", href: "https://github.com/utdevnp/jwt-ut/blob/main/LICENSE" },
  { label: "Source Code", href: "https://github.com/utshabeb/jwt-ut" },
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
              className="text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: "var(--jwt-text-muted)" }}
            >
              Built by
            </p>
            <p className="text-base font-bold mb-1" style={{ color: "var(--jwt-text)" }}>
              Utshab Luitel
            </p>
            <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: "var(--jwt-text-muted)" }}>
              <Building2 size={12} />
              <span>Ebpearls Multipurpose Pvt Ltd</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs mb-4" style={{ color: "var(--jwt-text-muted)" }}>
              <MapPin size={12} />
              <span>Kathmandu, Nepal</span>
            </div>
            <div className="flex gap-3">
              {[
                { href: "https://github.com/utdevnp", label: "GitHub" },
                { href: "https://www.linkedin.com/in/utsabluitel", label: "LinkedIn" },
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

          {/* Links */}
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "var(--jwt-text-muted)" }}
            >
              Project
            </p>
            <ul className="space-y-2">
              {legalLinks.map((l) => (
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
          Copyright © {new Date().getFullYear()} Utshab Luitel · Ebpearls Multipurpose Pvt Ltd · Kathmandu, Nepal
        </div>
      </div>
    </footer>
  );
}
