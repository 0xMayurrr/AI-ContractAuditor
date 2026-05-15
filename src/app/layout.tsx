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
  title: "SMART_AUDIT | Infrastructure-grade Smart Contract Analysis",
  description:
    "AI-powered Solidity security auditor. MCP-ready API. CreateOS Skill compatible. AI-agent ready. Detect reentrancy, access control issues, and more.",
  openGraph: {
    title: "SMART_AUDIT | Infrastructure-grade Smart Contract Analysis",
    description: "Infrastructure-grade smart contract analysis. MCP-ready. AI-agent compatible. CreateOS Skill ready.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
