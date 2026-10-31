import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AVR Imóveis & Leads",
  description: "Painel imobiliário para gerenciamento de imóveis e leads",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
