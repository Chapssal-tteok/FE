"use client";

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "../contexts/AuthContext"
import Image from "next/image";

export default function Home() {
  const router = useRouter()
  const { isLoggedIn, logout } = useAuth()

  const handleStart = () => {
    if (isLoggedIn) {
      router.push("/resume")
    } else {
      router.push("/login")
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 to-white">
      <nav className="absolute top-0 w-full p-4">
        <div className="container flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            PreView
          </Link>

          {isLoggedIn ? (
            <div>
              <Link href="/mypage">
                <Button variant="outline">My Page</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>Log out</Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline">LogIn</Button>
            </Link>
          )}
        </div>
      </nav>

      <main className="container flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="relative w-full h-screen flex items-center justify-center">
          <Image src="/Gradients_bg.png" alt="배경" layout="fill" objectFit="cover" />
          <div className="relative z-10 space-y-8 flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Preview
            </h1>
            <h2 className="text-2xl leading-tight">
            자기소개서 AI 분석 및<br />
            면접 예상 질문 제공 서비스
            </h2>
            <Button className="text-lg px-8 py-6 rounded-3xl bg-lime-400 hover:bg-lime-500" onClick={handleStart}>
              시작하기
            </Button>
          </div>
        </div>

        {/* Decorative bubbles */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-green-400/30 blur-3xl z-[-1]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-green-400/30 blur-3xl z-[-1]" />
      </main>
    </div>
  )
}