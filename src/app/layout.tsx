import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Blend Mode — Digital Growth Agency",
    template: "%s · Blend Mode",
  },
  description:
    "Explode your visibility on Google. SEO, ads, CRO and automation that turn traffic into leads and sales — plus a client portal to track it all.",
  openGraph: {
    title: "Blend Mode — Digital Growth Agency",
    description:
      "Explode your visibility on Google. SEO, ads, CRO and automation that turn traffic into real leads and sales.",
    url: siteUrl,
    siteName: "Blend Mode",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blend Mode — Digital Growth Agency",
    description:
      "Explode your visibility on Google. SEO, ads, CRO and automation that turn traffic into real leads and sales.",
  },
};

// Runs before paint to apply the saved (or system) theme — prevents a flash of
// the wrong theme on load.
const themeInit = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Saira+Condensed:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
