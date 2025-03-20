"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { MessageCircle, UserCircle2, LogOut } from "lucide-react"
import Link from "next/link"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function InterviewPage() {
  const { isLoggedIn, logout } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      loadInitialQuestion()
    }
  }, [isLoggedIn, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // 질문 생성
  const loadInitialQuestion = async () => {
    setIsLoading(true)
    try {
      // 백엔드 API 호출
      const API_URL = process.env.PUBLIC_API_URL;
      const response = await fetch("${API_URL}/interviews")
      const data = await response.json()
      setMessages([{ role: "assistant", content: data.question }])
      if (isVoiceMode) {
        await speakText(data.question)
      }
    } catch (error) {
      console.error("Failed to load initial question:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // 답변에 대한 피드백 생성
    try {
      // 백엔드 API 호출
      const API_URL = process.env.PUBLIC_API_URL;
      const response = await fetch("${API_URL}/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: input }),
      })
      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
      if (isVoiceMode) {
        await speakText(data.response)
      }
    } catch (error) {
      console.error("Failed to get response:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
  }
  
  // 음성모드_ai가 생성한 질문을 음성으로 변환
  const speakText = async (text: string) => {
    try {
      // 백엔드 API 호출로 대체_실제 API 주소로 변경 필요
      const API_URL = process.env.PUBLIC_API_URL;
      const response = await fetch("${API_URL}/interviews/{interviews_id}/audio-qas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          await audioRef.current.play()
        }
      } else {
        throw new Error("Failed to synthesize speech")
      }
    } catch (error) {
      console.error("Error in text-to-speech:", error)
    }
  }

  // 음성모드_사용자가 답변한 음성을 텍스트로 변환
  const startListening = async () => {
    setIsListening(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data)
      })

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks)
        // 백엔드 API 호출로 대체_실제 API 주소로 변경 필요
        const API_URL = process.env.PUBLIC_API_URL;
        const response = await fetch("${API_URL}/interviews/{interviews_id}/audio-qas/{qa_id}", {
          method: "POST",
          body: audioBlob,
        })

        if (response.ok) {
          const { transcription } = await response.json()
          setInput(transcription)
        } else {
          throw new Error("Failed to recognize speech")
        }

        setIsListening(false)
      })

      mediaRecorder.start()

      setTimeout(() => {
        mediaRecorder.stop()
        stream.getTracks().forEach((track) => track.stop())
      }, 10000)
    } catch (error) {
      console.error("Error in speech recognition:", error)
      setIsListening(false)
    }
  }

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4">
    {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r">
        <div className="p-4 border-b">
          <Link href="/" className="text-xl font-bold">PreView</Link>
        </div>
        <div className="p-4">
          <Link href="/resume">
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="space-y-2">
            <Link href="/mypage">
              <Button variant="ghost" className="w-full justify-start">
                <UserCircle2 className="w-4 h-4 mr-2" />
                My Page
              </Button>
            </Link>
            
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Interview</h1>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4 mb-4 h-[60vh] overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"
                  } max-w-[80%]`}
                >
                  {message.content}
                </div>
              ))}
              {isLoading && <div className="text-center">답변을 생성하는 중...</div>}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="답변을 입력하세요..."
                disabled={isLoading || isListening}
              />
              <Button type="submit" disabled={isLoading || isListening}>
                전송
              </Button>
              <Button type="button" onClick={toggleVoiceMode} variant="outline">
                {isVoiceMode ? "텍스트 모드" : "음성 모드"}
              </Button>
              {isVoiceMode && (
                <Button type="button" onClick={startListening} disabled={isListening}>
                  {isListening ? "듣는 중..." : "음성 입력"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

