"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { FilePen, UserCircle2, LogOut, RefreshCw, Send, Bot, Menu, Video } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { analyzeResume, getChatResponse } from "@/services/openaiService"

interface FeedbackHistory {
  id: string
  company: string
  position: string
  date: string
}

interface Message {
  role: string;
  content: string;
}

export default function Chat() {
  const resume_id = useParams().id as string
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistory[]>([])

  const API_URL = process.env.NEXT_PUBLIC_API_URL

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
        // 자기소개서 데이터 가져오기
        const resumeResponse = await fetch(`${API_URL}/resumes/${resume_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if(!resumeResponse.ok) {
          throw new Error("Failed to fetch resume data")
        }
        const resumeData = await resumeResponse.json()

        // 피드백 기록 가져오기
        const historyResponse = await fetch(`${API_URL}/resumes/feedback-history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if(historyResponse.ok) {
          const historyData = await historyResponse.json()
          setFeedbackHistory(historyData)
        }

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
  }, [resume_id, API_URL])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSendMessage = async () => {
    if(!message.trim()) return

    try {
      setIsLoading(true)
      const resumeResponse = await fetch(`${API_URL}/resumes/${resume_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if(!resumeResponse.ok) {
        throw new Error("Failed to fetch resume data")
      }
      const resumeData = await resumeResponse.json()
      console.log("Resume Data:", resumeData);

      const reply = await getChatResponse(message, 'gpt-4', 'text')
      if (typeof reply !== 'string') throw new Error('Invalid response type')

      setMessages((prev) => [...prev, 
        { role: "user", content: message },
        { role: "AI", content: reply }])
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
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-[240px]' : 'w-[60px]'} bg-gray-100/20 shadow-lg fixed h-screen z-50 transition-all duration-300`}>
        <div className="flex justify-between items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-[#DEFFCF]/40"
          >
            <Menu className="w-7 h-7" />
          </Button>
          
          {isSidebarOpen && (
            <Link href="/writeResume">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-[#DEFFCF]/40"
              >
                <FilePen className="w-7 h-7" />
              </Button>
            </Link>
          )}
        </div>

        {isSidebarOpen && (
          <>
            <div className="p-4">
              <div className="space-y-2">
                {feedbackHistory.map((feedback) => (
                  <Link key={feedback.id} href={`/chat/${feedback.id}`}>
                    <div className={`p-3 hover:bg-[#DEFFCF]/40 rounded-lg cursor-pointer ${
                      feedback.id === resume_id ? 'bg-[#DEFFCF] font-bold' : ''
                    }`}>
                      <p className="font-medium text-sm">{feedback.company}/{feedback.position}</p>
                      <p className="text-xs text-gray-500">{feedback.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 w-full p-4">
              <div className="space-y-2">
                <Link href="/mypage">
                  <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-black hover:bg-[#DEFFCF]/40">
                    <UserCircle2 className="w-5 h-5 mr-3" />
                    My Page
                  </Button>
                </Link>
                
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-gray-600 hover:text-black hover:bg-[#DEFFCF]/40">
                  <LogOut className="w-5 h-5 mr-3" />
                  Log out
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-screen ${isSidebarOpen ? 'ml-[240px]' : 'ml-[60px]'} transition-all duration-300`}>
        {/* Mode Toggle Header */}
        <div className="py-5 px-6 border-b bg-white">
          <div className="flex items-center gap-6 ml-6">
            <h1 className="text-xl font-semibold text-gray-900">Feedback</h1>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "AI" ? "justify-start" : "justify-end"}`}>
                <div className={`relative max-w-[80%] ${
                  msg.role === "AI" 
                    ? "bg-[#DEFFCF]/40" 
                    : "bg-lime-300"
                } rounded-2xl`}>
                  {msg.role === "AI" && (
                    <div className="absolute -left-10 top-2">
                      <Bot className="w-6 h-6 text-lime-600" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "AI" && idx === messages.length - 1 && (
                    <div className="absolute bottom-2 right-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setMessages([])}
                        disabled={isLoading}
                        className="h-6 w-6 hover:bg-[#DEFFCF]"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="relative max-w-[80%] bg-gray-100 rounded-2xl">
                  <div className="absolute -left-10 top-2">
                    <Bot className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="p-4">
                    <p>답변을 생성하는 중...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="궁금한 점을 물어보세요"
                className="h-[100px] resize-none overflow-y-auto bg-[#DEFFCF] border-0 rounded-2xl"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-3">
                <Button 
                  className="bg-lime-500 hover:bg-lime-600 rounded-full px-6" 
                  onClick={handleSendMessage}
                  disabled={isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
                <Link href={`/interview/${resume_id}`}>
                  <Button 
                    className="bg-lime-500 hover:bg-lime-600 rounded-full px-6"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}