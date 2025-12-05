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
  title: "Zecit - Privacy Bridge",
  description: "Safe and private bridge from Zcash to Solana",
};

import AppWalletProvider from "@/components/AppWalletProvider";
import EvmWalletProvider from "@/components/EvmWalletProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <EvmWalletProvider>
          <AppWalletProvider>
            {children}
          </AppWalletProvider>
        </EvmWalletProvider>
      </body>
    </html>
  );
}

