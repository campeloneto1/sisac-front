import type { Metadata } from "next";

import "@/app/globals.css";

import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "SISAC Front",
  description: "Projeto base com autenticacao, subunidade ativa e shell administrativo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

