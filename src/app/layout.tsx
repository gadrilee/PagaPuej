import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PagaPuej — Cuentas Claras, Amistades Duraderas",
  description:
    "Divide gastos entre amigos de forma justa y transparente. Registra quién pagó qué, y descubre exactamente cómo saldar deudas.",
  keywords: ["dividir gastos", "viajes", "amigos", "cuentas", "PagaPuej"],
  authors: [{ name: "PagaPuej" }],
  themeColor: "#7c3aed",
  openGraph: {
    title: "PagaPuej",
    description: "Cuentas Claras, Amistades Duraderas",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Background glow decorations */}
        <div
          className="glow-blob"
          style={{
            width: 600,
            height: 600,
            background: "#7c3aed",
            top: -200,
            left: -200,
          }}
        />
        <div
          className="glow-blob"
          style={{
            width: 500,
            height: 500,
            background: "#06b6d4",
            bottom: -150,
            right: -150,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
