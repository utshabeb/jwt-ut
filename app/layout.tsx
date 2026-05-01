import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Banner from "@/components/layout/Banner";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "JWT.io Clone — JSON Web Token Debugger",
  description:
    "Decode, verify, and generate JSON Web Tokens (JWT). An open, industry standard RFC 7519 method for representing claims securely between two parties.",
};

// Inline script runs before paint to set correct data-theme and avoid flash
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('jwt-theme');
    var theme = stored === 'light' || stored === 'dark' ? stored
      : (stored === 'system' || !stored)
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <Banner />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
