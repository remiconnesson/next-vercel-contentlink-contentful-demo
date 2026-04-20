import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { LivePreviewProvider } from "@/lib/cms/contentful-live-preview-provider";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Content Link Demo — Contentful + Vercel",
  description:
    "Minimal demo of Vercel Content Link with Contentful: Content Source Maps, draft preview, and on-demand revalidation.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: draftEnabled } = await draftMode();

  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <LivePreviewProvider enabled={draftEnabled}>
          {children}
        </LivePreviewProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
