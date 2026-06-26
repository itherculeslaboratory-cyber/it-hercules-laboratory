import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import "./globals.css";

export const runtime = 'edge';

export const metadata: Metadata = {
  title: "IT Hercules Laboratory",
  description: "研究観測・血統・マーケット統合プラットフォーム",
  icons: {
    icon: [{ url: BRAND_ASSETS.favicon, type: "image/png" }],
    apple: [{ url: BRAND_ASSETS.logoMark, type: "image/png" }],
    shortcut: BRAND_ASSETS.favicon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-theme="light">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
