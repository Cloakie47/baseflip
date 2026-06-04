import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const OG_IMAGE = `${APP_URL}/og.png`;
const TITLE = "Baseflip";
const DESCRIPTION = "Free coinflip on Base";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a1530",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  applicationName: TITLE,
  metadataBase: new URL(APP_URL),
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: TITLE,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = headers().get("cookie") ?? null;
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Providers cookie={cookie}>{children}</Providers>
      </body>
    </html>
  );
}
