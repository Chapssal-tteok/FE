"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { FilePen, UserCircle2, LogOut, Send, Mic, MicOff, Volume2, Menu, File } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"


interface Question {
  _id: string
  question: string
  answer?: string
  feedback?: string
}

interface Interview {
  _id: string
  questions: Question[]
  currentQuestionIndex: number
}

// 샘플 인터뷰 기록 데이터 추가
const sampleInterviewHistory = [
  { id: "1", company: "네이버", position: "프론트엔드 개발자", date: "2024.03.20" },
  { id: "2", company: "카카오", position: "백엔드 개발자", date: "2024.03.19" },
  { id: "3", company: "라인", position: "풀스택 개발자", date: "2024.03.18" },
]

export default function Interview() {
  const interview_id = useParams().id as string
  const { isLoggedIn, logout } = useAuth()
  const router = useRouter()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      // 샘플 데이터 설정
      const sampleInterview: Interview = {
        _id: "sample-interview-1",
        questions: [
          {
            _id: "q1",
            question: "자기소개를 해주세요.",
            answer: "안녕하세요. 저는 컴퓨터공학을 전공한 김철수입니다. 웹 개발에 관심이 많아 React와 Node.js를 주로 공부하고 있습니다.",
            feedback: "좋은 자기소개입니다. 기술 스택에 대한 구체적인 언급이 인상적입니다."
          },
          {
            _id: "q2",
            question: "프로젝트 경험 중 가장 기억에 남는 것은 무엇인가요?",
            answer: "대학교 3학년 때 진행한 AI 기반 추천 시스템 프로젝트가 가장 기억에 남습니다. 사용자 행동 데이터를 분석하여 맞춤형 추천을 제공하는 시스템을 개발했습니다.",
            feedback: "구체적인 프로젝트 경험과 기술적 도전을 잘 설명해주셨습니다."
          },
          {
            _id: "q3",
            question: "협업 시 갈등이 발생하면 어떻게 해결하시나요?",
            answer: "저는 항상 개방적인 소통을 지향합니다. 팀원들과 정기적인 미팅을 통해 의견을 나누고, 문제가 발생하면 즉시 공유하여 함께 해결방안을 찾습니다.",
            feedback: "효과적인 커뮤니케이션 방식에 대해 잘 설명해주셨습니다."
          }
        ],
        currentQuestionIndex: 2
      }
      setInterview(sampleInterview)
    }
  }, [isLoggedIn, router, interview_id])

  useEffect(() => {
    scrollToBottom()
  }, [interview])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // 면접 세션 로드
  const loadInterview = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/interviews/${interview_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setInterview(data)
      if (isVoiceMode && data.questions[0]) {
        await speakText(data.questions[0].question)
      }
    } catch (error) {
      console.error("Failed to load interview:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !interview) return

    setIsLoading(true)
    const currentQuestion = interview.questions[interview.currentQuestionIndex]

    try {
      const response = await fetch(
        `${API_URL}/interviews/${interview._id}/questions/${currentQuestion._id}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ answer: input }),
        }
      )
      const updatedInterview = await response.json()
      setInterview(updatedInterview)
      setInput("")

      // 다음 질문이 있으면 음성으로 읽기
      if (
        isVoiceMode &&
        updatedInterview.currentQuestionIndex < updatedInterview.questions.length - 1
      ) {
        const nextQuestion =
          updatedInterview.questions[updatedInterview.currentQuestionIndex + 1]
        await speakText(nextQuestion.question)
      }
    } catch (error) {
      console.error("Failed to submit answer:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    if (!isVoiceMode && interview?.questions[interview.currentQuestionIndex]) {
      speakText(interview.questions[interview.currentQuestionIndex].question)
    }
  }

  // 음성 모드: AI가 생성한 질문을 음성으로 변환
  const speakText = async (text: string) => {
    try {
      const response = await fetch(`${API_URL}/interviews/${interview_id}/audio-qas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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

  // 음성 모드: 사용자가 답변한 음성을 텍스트로 변환
  const startListening = async () => {
    setIsListening(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data)
      })

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunksRef.current)
        const response = await fetch(
          `${API_URL}/interviews/${interview_id}/audio-qas/${interview?.questions[interview.currentQuestionIndex]._id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: audioBlob,
          }
        )

        if (response.ok) {
          const { transcription } = await response.json()
          setInput(transcription)
        } else {
          throw new Error("Failed to recognize speech")
        }

        setIsListening(false)
        stream.getTracks().forEach((track) => track.stop())
      })

      mediaRecorder.start()
      setTimeout(() => {
        mediaRecorder.stop()
      }, 10000)
    } catch (error) {
      console.error("Error in speech recognition:", error)
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  if (!isLoggedIn || !interview) return null

  const currentQuestion = interview.questions[interview.currentQuestionIndex]

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-[240px]' : 'w-[60px]'} bg-white shadow-lg fixed h-screen z-50 transition-all duration-300`}>
        <div className="flex justify-between items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-gray-100"
          >
            <Menu className="w-7 h-7" />
          </Button>
          
          {isSidebarOpen && (
            <Link href="/writeResume">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100"
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
                {sampleInterviewHistory.map((interview) => (
                  <Link key={interview.id} href={`/interview/${interview.id}`}>
                    <div className={`p-3 hover:bg-gray-100 rounded-lg cursor-pointer ${
                      interview.id === interview_id ? 'bg-gray-100 font-bold' : ''
                    }`}>
                      <p className="font-medium text-sm">{interview.company}/{interview.position}</p>
                      <p className="text-xs text-gray-500">{interview.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 w-full p-4 border-t">
              <div className="space-y-2">
                <Link href="/mypage">
                  <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-black hover:bg-gray-100">
                    <UserCircle2 className="w-5 h-5 mr-3" />
                    My Page
                  </Button>
                </Link>
                
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-gray-600 hover:text-black hover:bg-gray-100">
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
        <div className="py-4 px-6 border-b bg-white">
          <div className="flex items-center gap-6 ml-6">
            <h1 className="text-xl font-semibold text-gray-900">Interview</h1>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={toggleVoiceMode}
                variant="outline"
                className="rounded-full px-4 py-2 flex items-center gap-2 text-sm"
                >
                {isVoiceMode ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    음성 모드
                  </>
                ) : (
                <>
                    <MicOff className="w-4 h-4" />
                    텍스트 모드
                  </>
                )}
              </Button>
              {isVoiceMode && (
                <Button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  variant={isListening ? "default" : "outline"}
                  className="rounded-full px-4 py-2 flex items-center gap-2 text-sm"
                >
                  <Mic className="w-4 h-4" />
                  {isListening ? "녹음 중지" : "음성 녹음"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {interview.questions.map((q, index) => (
              <div key={q._id} className="space-y-4">
                {/* 질문 */}
                <div className="flex justify-start">
                  <div className="relative max-w-[80%] bg-gray-100 rounded-2xl">
                    <div className="p-4">
                      <p className="font-medium mb-1">Q{index + 1}:</p>
                      <p className="whitespace-pre-wrap">{q.question}</p>
                    </div>
                  </div>
                </div>

                {/* 답변 */}
                {q.answer && (
                  <div className="flex justify-end">
                    <div className="relative max-w-[80%] bg-lime-300 rounded-2xl">
                      <div className="p-4">
                        <p className="whitespace-pre-wrap">{q.answer}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 피드백 */}
                {q.feedback && (
                  <div className="flex justify-center">
                    <div className="w-[90%] bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-700">면접관 피드백</p>
                          <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                            Q{index + 1}
                          </div>
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap">{q.feedback}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="relative max-w-[80%] bg-gray-100 rounded-2xl">
                  <div className="p-4">
                    <p>처리 중...</p>
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
            {interview.currentQuestionIndex < interview.questions.length && (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  className="h-[100px] resize-none overflow-y-auto bg-gray-100 border-0 rounded-2xl"
                  disabled={isLoading || isListening}
                />
                <div className="flex flex-col gap-3">
                  <Button 
                    type="submit" 
                    className="bg-lime-500 hover:bg-lime-600 rounded-full px-6"
                    disabled={isLoading || isListening} >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Link href={`/chat/${interview_id}`}>
                    <Button 
                      className="bg-lime-500 hover:bg-lime-600 rounded-full px-6"
                    >
                      <File className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

