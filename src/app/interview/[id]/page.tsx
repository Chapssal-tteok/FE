"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { FilePen, UserCircle2, LogOut, Send, Mic, MicOff, Volume2, Menu, File } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { generateInterviewQuestions, analyzeAnswer, generateFollowUpQuestions } from '@/services/interviewService'

interface Question {
  _id: string
  question: string
  answer?: string
  feedback?: InterviewFeedback
  followUpQuestions?: string[]
}

interface Interview {
  _id: string
  company: string
  position: string
  resumeContent: string
  questions: Question[]
  currentQuestionIndex: number
}

interface InterviewFeedback {
  strengths: string[]
  areasForImprovement: string[]
  suggestions: string[]
  score: number
}

interface InterviewHistory {
  id: string
  company: string
  position: string
  date: string
  status: string
}

export default function InterviewPage() {
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
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistory[]>([])
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const [showFollowUpQuestions, setShowFollowUpQuestions] = useState<Record<string, boolean>>({})

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const speakText = useCallback(async (text: string) => {
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
  }, [API_URL, interview_id])

  const loadInterview = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/interviews/${interview_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      
      // 면접 질문이 없으면 생성
      if (!data.questions || data.questions.length === 0) {
        const generatedQuestions = await generateInterviewQuestions(
          data.company,
          data.position,
          data.resumeContent
        )
        data.questions = generatedQuestions
      }
      
      setInterview(data)
      if (isVoiceMode && data.questions[0]) {
        await speakText(data.questions[0].question)
      }
    } catch (error) {
      console.error("Failed to load interview:", error)
    } finally {
      setIsLoading(false)
    }
  }, [API_URL, interview_id, isVoiceMode, speakText])

  const fetchInterviewHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/interviews/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setInterviewHistory(data)
      }
    } catch (error) {
      console.error("Failed to fetch interview history:", error)
    }
  }, [API_URL])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      loadInterview()
      fetchInterviewHistory()
    }
  }, [isLoggedIn, router, interview_id, loadInterview, fetchInterviewHistory])

  useEffect(() => {
    scrollToBottom()
  }, [interview])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !interview) return

    setIsLoading(true)
    const currentQuestion = interview.questions[interview.currentQuestionIndex]

    try {
      // 답변 분석 및 피드백 생성
      const feedback = await analyzeAnswer(
        currentQuestion.question,
        input,
        interview.resumeContent
      )
      setFeedback(feedback)

      // 추가 질문 생성
      const followUps = await generateFollowUpQuestions(
        currentQuestion.question,
        input
      )
      setFollowUpQuestions(followUps)

      // 답변 저장
      const response = await fetch(
        `${API_URL}/interviews/${interview._id}/questions/${currentQuestion._id}/answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ 
            answer: input,
            feedback: feedback,
            followUpQuestions: followUps
          }),
        }
      )
      const updatedInterview = await response.json()
      setInterview(updatedInterview)
      setInput('')

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
      console.error('Failed to submit answer:', error)
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

  const toggleFollowUpQuestions = (questionId: string) => {
    setShowFollowUpQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  if (!isLoggedIn || !interview) return null

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
                {interviewHistory.map((interview) => (
                  <Link key={interview.id} href={`/interview/${interview.id}`}>
                    <div className={`p-3 hover:bg-[#DEFFCF]/40 rounded-lg cursor-pointer ${
                      interview.id === interview_id ? 'bg-[#DEFFCF] font-bold' : ''
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
        <div className="py-4 px-6 border-b bg-white">
          <div className="flex items-center gap-6 ml-6">
            <h1 className="text-xl font-semibold text-gray-900">Interview</h1>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={toggleVoiceMode}
                variant="outline"
                className="rounded-full px-4 py-2 flex items-center gap-2 text-sm hover:bg-[#DEFFCF]/40"
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
                  className="rounded-full px-4 py-2 flex items-center gap-2 text-sm hover:bg-[#DEFFCF]/40"
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
                  <div className="relative max-w-[80%] bg-[#DEFFCF]/40 rounded-2xl">
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
                {feedback && (
                  <div className="flex justify-center">
                    <div className="w-[90%] bg-white border-2 border-[#DEFFCF] rounded-xl shadow-sm">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-700">면접관 피드백</p>
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-[#DEFFCF] rounded-full text-sm text-gray-600">
                              Q{index + 1}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleFollowUpQuestions(q._id)}
                              className="hover:bg-[#DEFFCF]/40"
                            >
                              추가 질문
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium text-gray-700">강점:</p>
                            <p className="text-gray-600">{feedback.strengths.join(', ')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">개선점:</p>
                            <p className="text-gray-600">{feedback.areasForImprovement.join(', ')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">제안:</p>
                            <p className="text-gray-600">{feedback.suggestions.join(', ')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">점수:</p>
                            <p className="text-gray-600">{feedback.score}/100</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 추가 질문 */}
                {showFollowUpQuestions[q._id] && followUpQuestions && followUpQuestions.length > 0 && (
                  <div className="flex justify-start">
                    <div className="relative max-w-[80%] bg-[#DEFFCF]/40 rounded-2xl">
                      <div className="p-4">
                        <p className="font-medium mb-2">추가 질문:</p>
                        {followUpQuestions.map((followUp, i) => (
                          <p key={i} className="whitespace-pre-wrap mb-2">
                            • {followUp}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="relative max-w-[80%] bg-[#DEFFCF] rounded-2xl">
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
                  placeholder="답변을 입력하세요"
                  className="h-[100px] resize-none overflow-y-auto bg-[#DEFFCF] border-0 rounded-2xl"
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

