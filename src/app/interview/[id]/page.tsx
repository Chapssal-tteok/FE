"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { FilePen, UserCircle2, LogOut, Mic, MicOff, Volume2 } from "lucide-react"
import Link from "next/link"

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

export default function InterviewPage({ params }: { params: { id: string } }) {
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      loadInterview()
    }
  }, [isLoggedIn, router, params.id])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // 면접 세션 로드
  const loadInterview = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/interviews/${params.id}`, {
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
      const response = await fetch(`${API_URL}/interviews/${params.id}/audio-qas`, {
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
          `${API_URL}/interviews/${params.id}/audio-qas/${interview?.questions[interview.currentQuestionIndex]._id}`,
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r fixed h-full">
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
      <div className="container max-w-4xl mx-auto ml-64">
        <h1 className="text-3xl font-bold mb-6">Interview Practice</h1>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4 mb-4 h-[60vh] overflow-y-auto">
              {interview.questions.map((q, index) => (
                <div key={q._id} className="space-y-2">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="font-semibold">Q{index + 1}:</div>
                    {q.question}
                  </div>
                  {q.answer && (
                    <div className="bg-blue-100 p-3 rounded-lg ml-4">
                      <div className="font-semibold">Your Answer:</div>
                      {q.answer}
                    </div>
                  )}
                  {q.feedback && (
                    <div className="bg-green-100 p-3 rounded-lg ml-8">
                      <div className="font-semibold">Feedback:</div>
                      {q.feedback}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="text-center text-gray-500">처리 중...</div>
              )}
            </div>
            {interview.currentQuestionIndex < interview.questions.length && (
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
                <Button
                  type="button"
                  onClick={toggleVoiceMode}
                  variant="outline"
                  className="flex items-center"
                >
                  {isVoiceMode ? (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      음성 모드
                    </>
                  ) : (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      텍스트 모드
                    </>
                  )}
                </Button>
                {isVoiceMode && (
                  <Button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isListening ? "녹음 중..." : "음성 입력"}
                  </Button>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

