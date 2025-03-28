"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { FilePen, UserCircle2, LogOut, RefreshCw, Send, Bot, Activity } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { analyzeResume, getChatResponse } from "@/services/openaiService"


// 개발 환경용 샘플 데이터
const sampleResumeData = {
  id: "1",
  company: "네이버",
  position: "프론트엔드 개발자",
  content: `[지원동기]
저는 네이버의 프론트엔드 개발자로서 사용자 경험을 혁신하고 싶습니다. 
대학에서 웹 개발을 전공했으며, 다양한 프로젝트를 통해 실무 경험을 쌓았습니다.

[프로젝트 경험]
1. 캡스톤 디자인 프로젝트
- React와 TypeScript를 활용한 웹 애플리케이션 개발
- 사용자 경험 개선을 위한 UI/UX 디자인 개선
- 팀 프로젝트에서 프론트엔드 리더 역할 수행

2. 개인 포트폴리오 웹사이트
- Next.js와 Tailwind CSS를 활용한 반응형 웹사이트 개발
- SEO 최적화 및 성능 개선
- 모던 웹 기술 스택 적용`
}

export default function Chat() {
  const resume_id = useParams().id as string
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchInitialMessages = async () => {
      try {
        setIsLoading(true)
        // // 자기소개서 데이터 가져오기
        // const resumeResponse = await fetch(`${API_URL}/resumes/${resume_id}`)
        // if(!resumeResponse.ok) {
        //   throw new Error("Failed to fetch resume data")
        // }
        // const resumeData = await resumeResponse.json()

        // 개발 환경에서는 샘플 데이터 사용
        const resumeData = sampleResumeData

        // ChatGPT에 자기소개서 분석 요청
        const feedback = await analyzeResume(
          resumeData.content,
          resumeData.company,
          resumeData.position
        )
        
        // 초기 메시지 설정
        setMessages([
          { role: "AI", content: "안녕하세요! 자기소개서 분석을 도와드리겠습니다." },
          { role: "AI", content: feedback || "자기소개서 분석이 완료되었습니다." }
        ])
      } catch (error) {
        console.error("Error fetching feedback", error)
        setMessages([{ role: "AI", content: "죄송합니다. 자기소개서 분석 중 오류가 발생했습니다." }])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialMessages()
  }, [resume_id])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSendMessage = async () => {
    if(!message.trim()) return

    try {
      setIsLoading(true)
      // const resumeResponse = await fetch(`${API_URL}/resumes/${resume_id}`)
      // if(!resumeResponse.ok) {
      //   throw new Error("Failed to fetch resume data")
      // }
      // const resumeData = await resumeResponse.json()

      // 개발 환경에서는 샘플 데이터 사용
      const resumeData = sampleResumeData

      const reply = await getChatResponse(message, messages, resumeData.content)
      setMessages((prev) => [...prev, 
        { role: "user", content: message },
        { role: "AI", content: reply || "죄송합니다. 응답을 생성할 수 없습니다." }])
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages(prev => [...prev, 
        { role: "user", content: message },
        { role: "AI", content: "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다." }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-white flex">

      {/* Sidebar */}
      <div className="w-54 shadow bg-lime-100 border-r fixed h-screen">
        <div className="p-4 border-b">
          <Link href="/" className="text-xl font-bold">
            <div className="flex items-center justify-center">
              <img src="/Vector.png" alt="PreView Logo" className="w-5 h-5 mb-1" />
              <span className="ml-1">PreView</span>
            </div>
          </Link>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <Link href="/writeResume">
              <Button variant="ghost" className="w-full justify-start hover:bg-lime-200">
                <FilePen className="w-4 h-4 mr-2" />
                New Resume
              </Button>
            </Link>
            
            {/* 링크 수정 필요 */}
            <Link href={`/interview/`}>
              <Button variant="ghost" className="w-full justify-start hover:bg-lime-200">
                <Activity className="w-4 h-4 mr-2" />
                Go Interview
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 w-54 p-4">
          <div className="space-y-2">
            <Link href="/mypage">
              <Button variant="ghost" className="w-full justify-start hover:bg-lime-200">
                <UserCircle2 className="w-4 h-4 mr-2" />
                My Page
              </Button>
            </Link>
            
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start hover:bg-lime-200">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 ml-54 flex flex-col h-screen">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`relative ${
                msg.role === "AI" 
                  ? "bg-lime-100 self-start max-w-[80%] ml-2" 
                  : "bg-gray-100 self-end ml-auto max-w-fit"
              } rounded-lg`}>
                {msg.role === "AI" && (
                  <div className="absolute -left-8 top-6">
                    <Bot className="w-6 h-6 text-lime-600" />
                  </div>
                )}
                <div className="p-5">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "AI" && idx === messages.length - 1 && (
                  <div className="absolute bottom-2 right-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setMessages([])}
                      disabled={isLoading}
                      className="h-6 w-6"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="relative bg-lime-100 self-start max-w-[80%] ml-2 rounded-lg">
                <div className="absolute -left-8 top-6">
                  <Bot className="w-6 h-6 text-lime-600" />
                </div>
                <div className="p-5">
                  <p>답변을 생성하는 중...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 mb-5">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="궁금한 점을 물어보세요"
                className="h-[100px] resize-none overflow-y-auto bg-white border-lime-500 shadow-sm rounded-xl"
                disabled={isLoading}
              />
              <Button 
                className="bg-lime-400 hover:bg-lime-500" 
                onClick={handleSendMessage}
                disabled={isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}