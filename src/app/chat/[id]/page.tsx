// chat/[id]/page.tsx
"use client"

import { ResumeControllerService } from "@/api-client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { RefreshCw, Send, Bot, Video } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { analyzeResume, getChatResponse } from "@/services/openaiService"

interface Message {
  role: "user" | "AI"
  content: string;
}

export default function Chat() {
  const { id: resume_id } = useParams()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
        const resumeResponse = await ResumeControllerService.getResume(Number(resume_id))
        if (!resumeResponse.result) {
          throw new Error("자기소개서 정보를 불러올 수 없습니다.")
        }
        const resumeData = resumeResponse.result
        const { resumeQas, company, position } = resumeData

        // 문항과 답변 조합
        const combinedContent = resumeQas
          ? resumeQas.map((qa, index) => `문항 ${index + 1}: ${qa.question}\n답변: ${qa.answer}`).join('\n\n')
          : "자기소개서 문항이 없습니다.";

        // ChatGPT에 자기소개서 분석 요청
        if (!company || !position) {
          throw new Error("회사명 또는 직무 정보가 누락되었습니다.");
        }
        const feedback = await analyzeResume(combinedContent, company, position)
        
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

      const reply = await getChatResponse(message, 'gpt-4', 'text')
      if (typeof reply !== 'string') throw new Error('Invalid response type')

      setMessages((prev) => [...prev, 
        { role: "user", content: message },
        { role: "AI", content: reply }
      ])
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
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/writeResume">
                      Write Resume
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Resume Feedback</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-screen ${isSidebarOpen ? 'ml-[240px]' : 'ml-[60px]'} transition-all duration-300`}>
        {/* Mode Toggle Header */}
        <div className="py-5 px-6 border-b bg-white">
          <div className="flex items-center gap-6 ml-6">
            <h1 className="text-xl font-semibold text-gray-900">Resume Feedback</h1>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "AI" ? "justify-start" : "justify-end"}`}>
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
                  {msg.role === "AI" && index === messages.length - 1 && (
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
                <div className="relative max-w-[80%] bg-[#DEFFCF] rounded-2xl">
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