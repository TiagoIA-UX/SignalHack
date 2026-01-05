import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SignalHack",
  description: "Hackeie os sinais antes do mercado.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-100`}
      >
        <div className="pointer-events-none fixed inset-0 text-emerald-500/10">
          <div className="sh-glow" />
          <div className="sh-grid" />
          <div className="sh-scanlines" />
        </div>
        <div className="pointer-events-none fixed inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <div className="pointer-events-none fixed inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        {children}
      </body>
    </html>
  );
}
