"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { FilePen, UserCircle2, LogOut, RefreshCw, Send } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function Chat() {
  const resume_id = useParams().id
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  useEffect(() => {
    const fetchInitialMessages = async () => {
      try {
        setIsLoading(true)
        // 자기소개서 데이터 가져오기
        const resumeResponse = await fetch(`${API_URL}/resumes/${resume_id}`)
        if(!resumeResponse.ok) {
          throw new Error("Failed to fetch resume data")
        }
        const resumeData = await resumeResponse.json()

        // ChatGPT에 자기소개서 분석 요청
        const analysisResponse = await fetch(`${API_URL}/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            resume: resumeData.content,
            company: resumeData.company,
            position: resumeData.position
          })
        })

        if(!analysisResponse.ok) {
          throw new Error("Failed to analyze resume")
        }

        const analysisData = await analysisResponse.json()
        
        // 초기 메시지 설정
        setMessages([
          { role: "AI", content: "안녕하세요! 자기소개서 분석을 도와드리겠습니다." },
          { role: "AI", content: analysisData.feedback }
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
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          message,
          resume_id,
          conversation_history: messages
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, 
        { role: "user", content: message },
        { role: "AI", content: data.reply }])
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4">

      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r">
        <div className="p-4 border-b">
          <Link href="/" className="text-xl font-bold">PreView</Link>
        </div>
        <div className="p-4">
          <Link href="/writeResume">
            <Button variant="outline" className="w-full justify-start">
              <FilePen className="w-4 h-4 mr-2" />
              New Resume
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <h1 className="text-3xl font-bold mb-6">자기소개서 피드백</h1>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${msg.role === "AI" ? "bg-lime-100" : "bg-gray-100"}`}>
                <p className="text-sm font-medium">{msg.role === "AI" ? "AI" : "You"}</p>
                <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="p-4 rounded-lg bg-lime-100">
                <p className="text-sm font-medium">AI</p>
                <p className="mt-1">답변을 생성하는 중...</p>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto flex gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setMessages([])}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            <div className="flex-1 flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 입력하세요"
                className="min-h-[50px]"
                disabled={isLoading}
              />
              <Button 
                className="bg-lime-400 hover:bg-lime-500" 
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}