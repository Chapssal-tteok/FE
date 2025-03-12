"use client";

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "../contexts/AuthContext"

export default function Home() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  const handleStart = () => {
    if (isLoggedIn) {
      router.push("/resume")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 to-white">
      <nav className="absolute top-0 w-full p-4">
        <div className="container flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            PreView
          </Link>
          {isLoggedIn ? (
            <Link href="/mypage">
              <Button variant="outline">My Page</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline">LogIn</Button>
            </Link>
          )}
        </div>
      </nav>

      <main className="container flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            자기소개서 AI 분석 및<br />
            면접 예상 질문 제공 서비스
          </h1>
          <Button className="text-lg px-8 py-6 bg-green-500 hover:bg-green-600" onClick={handleStart}>
            시작하기
          </Button>
        </div>

        {/* Decorative bubbles */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-green-100/50 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-green-100/50 blur-3xl" />
      </main>
    </div>
  )
}