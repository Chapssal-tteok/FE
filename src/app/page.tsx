// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth, } from "../contexts/AuthContext"
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const router = useRouter()
  const { isLoggedIn, logout } = useAuth()
  const [typedText, setTypedText] = useState("")
  const [typedSubText, setTypedSubText] = useState("")
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [typingCompleted, setTypingCompleted] = useState(false)

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
      <div className="absolute inset-0 bg-[url(/svg/Gradients.svg)] bg-center bg-cover opacity-50 z-0"></div>
      <header className="absolute top-0 w-full p-4 z-50">
        <div className="container flex justify-between items-center mx-auto px-4">
          <Link href="/" className="text-2xl font-bold">
            <div className="flex items-center">
              <Image src="/svg/logo.svg" alt="PreView Logo" width={20} height={20} className="mb-1 mt-[-2px]" />
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
              <Button variant="outline">Sign In</Button>
            </Link>         
          )}
        </div>
      </header>  

      <main className="container flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="relative z-10 space-y-12 flex flex-col items-start justify-center h-full mr-180 mb-10">
          <div className="flex items-center space-x-2">
            <Image src="/svg/logo.svg" alt="icon" width={20} height={20} className="w-8 h-8 md:h-12 md:w-12 mt-[-14px]"/>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl relative inline-block">
              <span className="invisible">{text}</span>
              <span className="absolute top-0 left-0">{typedText}</span>
              {index < text.length && (
                <span className="absolute w-[2px] h-full bg-black animate-blink" style={{ left: `${index * 0.6}em` }}></span>
              )}
            </h1>
          </div>

          <h2 className="text-2xl leading-tight text-left relative">
            <span className="invisible">{subText}</span>
            <span className="absolute top-0 left-0" dangerouslySetInnerHTML={{ __html: typedSubText.replace(/\n/g, "<br />") }} />
          </h2>

          <Button className="text-2xl px-8 py-7 rounded-3xl shadow-xl shadow-black-500/50 text-black bg-light-green hover:bg-lime-400" 
            onClick={handleStart}>
            시작하기
          </Button>
        </div>

        <div className="fixed bottom-8 right-8 flex space-x-4">
          <a href="mailto:chacha09@ewha.ac.kr" className="hover:opacity-50 transition-opacity">
            <Image src="/svg/email-icon.svg" alt="Email" width={32} height={32} />
          </a>
          <a href="https://github.com/Chapssal-tteok" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">
            <Image src="/svg/github-icon.svg" alt="GitHub" width={32} height={32} />
          </a>
        </div>
      </main>
    </div>
  )
}