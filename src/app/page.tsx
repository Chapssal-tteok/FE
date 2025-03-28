"use client";

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth, } from "../contexts/AuthContext"
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter()
  const { isLoggedIn, logout } = useAuth()
  const [typedText, setTypedText] = useState("")
  const [typedSubText, setTypedSubText] = useState("")
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [typingCompleted, setTypingCompleted] = useState(false)
  const [cursorInSubText, setCursorInSubText] = useState(false)

  const text = "PreView"
  const subText = "자기소개서 AI 분석 및\n면접 예상 질문 제공 서비스"
  
  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setTypedText((prev) => prev + text[index])
        setIndex(index + 1)
      }, 150) // 글자 간격 설정
      return () => clearTimeout(timer)
    } else {
      setTypingCompleted(true)
    }
  }, [index])
  
  useEffect(() => {
    if (typingCompleted && subIndex < subText.length) {
      const timer = setTimeout(() => {
        setTypedSubText((prev) => prev + subText[subIndex])
        setSubIndex(subIndex + 1)
      }, 50) // 서브 텍스트 타이핑 속도 설정
      return () => clearTimeout(timer)
    } else if(subIndex >= subText.length) {
      setCursorInSubText(false)
    }
  }, [subIndex, typingCompleted])

  const handleStart = () => {
    if (isLoggedIn) {
      router.push("/writeResume")
    } else {
      router.push("/login")
    }
  }

  const handleLogout = () => {
    console.log("Logging out...")
    logout()
    console.log("After logout:", { isLoggedIn })
    router.push("/")
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <nav className="absolute top-0 w-full p-4 z-50">
        <div className="container flex justify-between items-center mx-auto px-4">
          <Link href="/" className="text-2xl font-bold">
            <div className="flex items-center">
              <img src="/Vector.png" alt="PreView Logo" className="w-5 h-5 mb-1" />
              <span className="ml-1">PreView</span>
            </div>
          </Link>

          {isLoggedIn ? (
            <div className="space-x-4">
              <Link href="/mypage">
                <Button variant="outline">
                  My Page
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>         
          )}
        </div>
      </nav>

      <main className="container flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="absolute inset-0 bg-[url(/Gradients.png)] bg-center bg-cover z-0">
          <div className="relative z-10 space-y-8 flex flex-col items-start justify-center h-full ml-80 mb-10">
            <div className="flex items-center space-x-2">
              <img src="/Vector.png" alt="icon" className="w-8 h-8 md:h-12 md:w-12 mt-[-14px]"/>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl relative inline-block">
                {typedText}
                {index < text.length && !cursorInSubText && (
                  <span className="absolute w-[2px] h-full bg-black animate-blink"></span>
                )}
              </h1>
            </div>

            <h2 className="text-2xl leading-tight text-left">
              <span dangerouslySetInnerHTML={{ __html: typedSubText.replace(/\n/g, "<br />") }} />
            </h2>

            <Button className="text-xl px-8 py-7 rounded-3xl shadow-xl shadow-black-500/50 text-black bg-light-green hover:bg-lime-400" 
              onClick={handleStart}>
              시작하기
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}