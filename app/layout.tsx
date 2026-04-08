import type { Metadata } from "next";
import type { Viewport } from "next";

import "@/app/globals.css";

import { Providers } from "@/app/providers";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";

export const metadata: Metadata = {
  title: "SISAC",
  description: "Sistema administrativo com autenticação, subunidade ativa e shell operacional.",
  manifest: "/manifest.webmanifest",
  applicationName: "SISAC",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SISAC",
  },
  icons: {
    apple: "/icons/apple-touch-icon.svg",
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <RegisterServiceWorker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
