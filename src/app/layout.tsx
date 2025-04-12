// src/app/layout.tsx
import type React from "react"
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext"
import { Providers } from "./providers";

const Gmarket = localFont({
  src: [
    {
      path: "../../public/font/GmarketSansTTFMedium.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../../public/font/GmarketSansTTFBold.woff2",
      weight: "700",
      style: "bold"
    },
  ],
  display: "swap",
  variable: "--font-Gmarket",
});

export const metadata: Metadata = {
  title: "PreView",
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
        <Providers>
          <AuthProvider>
            <div className="min-h-screen bg-white">{children}</div>
          </AuthProvider>
        </Providers>
        
      </body>
    </html>
  )
}

