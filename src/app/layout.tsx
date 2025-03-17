import type React from "react"
import type { Metadata } from "next";

import { Inter } from "next/font/google";
import localFont from "next/font/local";

import "../styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

const Gmarket = localFont({
  src: [
    {
      path: "./font/GmarketSansTTFMedium.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "./font/GmarketSansTTFBold.woff2",
      weight: "700",
      style: "bold"
    },
  ],
  display: "swap",
  variable: "--font-Gmarket",
});

export const metadata: Metadata = {
  title: "PreView - AI Resume Analysis",
  description: "AI-powered resume analysis and interview question service",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={Gmarket.className}>
        <AuthProvider>
          <div className="min-h-screen bg-white">{children}</div>
        </AuthProvider>
      </body>
    </html>
  )
}

