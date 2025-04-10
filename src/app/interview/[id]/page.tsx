// Interview/[id]/page.tsx
"use client"

import { InterviewControllerService, ResumeControllerService } from "@/api-client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { Send, Mic, MicOff, Volume2, File, RefreshCw } from "lucide-react"
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
  questions: Question[]
  currentQuestionIndex: number
  title: string
}

interface InterviewFeedback {
  strengths: string[]
  areasForImprovement: string[]
  suggestions: string[]
  score: number
}

export default function InterviewPage() {
  const resume_id = useParams().resume_id as string
  const interview_id = useParams().id as string
  const { isLoggedIn } = useAuth()
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
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const [showFollowUpQuestions, setShowFollowUpQuestions] = useState<Record<string, boolean>>({})

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadInterview = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await InterviewControllerService.getInterview(Number(interview_id))
      const data = await response.result

      if(!data) {
        console.error("No interview data found")
      }
      
      // 면접 질문이 없으면 생성
      if (data && (!data.interviewQas || data.interviewQas.length === 0)) {
        const generatedQuestions = await generateInterviewQuestions(
          data.company || "",
          data.position || "",
          data.title || ""
        )
        data.interviewQas = generatedQuestions
      }
      
      setInterview({
        _id: String(data?.interviewId || ""),
        company: data?.company || "",
        position: data?.position || "",
        title: data?.title || "",
        questions: data?.interviewQas?.map((qa) => ({
          _id: String(qa.interviewQaId),
          question: qa.question || "",
          answer: qa.answer || "",
          feedback: undefined,
          followUpQuestions: [],
        })) || [],
        currentQuestionIndex: 0,
      })

      // 음성 모드일 경우 첫 질문 읽기
      // if (isVoiceMode && data?.interviewQas?.[0]) {
      //   if (data.interviewQas[0].question) {
      //     await speakText(data.interviewQas[0].question)
      //   }
      // }

    } catch (error) {
      console.error("Failed to load interview:", error)
    } finally {
      setIsLoading(false)
    }
  }, [interview_id, isVoiceMode, /*speakText*/])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      loadInterview()
    }
  }, [isLoggedIn, router, interview_id, loadInterview])

  useEffect(() => {
    scrollToBottom()
  }, [interview])

  // Google TTS API 호출
  // const speakText = useCallback(async (text: string) => {
  //   try {
  //     const response = await 

  //     if (response.ok) {
  //       const audioBlob = await response.blob()
  //       const audioUrl = URL.createObjectURL(audioBlob)
  //       if (audioRef.current) {
  //         audioRef.current.src = audioUrl
  //         await audioRef.current.play()
  //       }
  //     } else {
  //       throw new Error("Failed to synthesize speech")
  //     }
  //   } catch (error) {
  //     console.error("Error in text-to-speech:", error)
  //   }
  // }, [interview_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !interview) return

    setIsLoading(true)
    const currentQuestion = interview.questions[interview.currentQuestionIndex]

    try {
      // 자기소개서 데이터 가져오기
      const resumeResponse = await ResumeControllerService.getResume(Number(resume_id))
      if (!resumeResponse.result) {
        throw new Error("자기소개서 정보를 불러올 수 없습니다.")
      }
      const resumeQas = resumeResponse.result.resumeQas || []

      // 문항과 답변 조합
      const combinedContent = resumeQas
        ? resumeQas.map((qa, index) => `문항 ${index + 1}: ${qa.question}\n답변: ${qa.answer}`).join('\n\n')
        : "자기소개서 문항이 없습니다.";
      // 답변 분석 및 피드백 생성
      const feedback = await analyzeAnswer(
        currentQuestion.question,
        input,
        combinedContent
      )
      setFeedback(feedback)

      // 추가 질문 생성
      const followUps = await generateFollowUpQuestions(
        currentQuestion.question,
        input
      )
      setFollowUpQuestions(followUps)

      // 현재는 로컬 상태만 업데이트 (API 호출 없음)
      setInterview((prev) => {
        if (!prev) return prev
        const updated = [...prev.questions]
        updated[prev.currentQuestionIndex] = {
          ...updated[prev.currentQuestionIndex],
          answer: input,
          feedback,
          followUpQuestions: followUps,
        }
        return {
          ...prev,
          questions: updated,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }
      })

      // 답변 저장 
      // const response = await InterviewControllerService.submitAnswer(
      //   Number(interview_id),
      //   currentQuestion._id,
      //   input,
      //   feedback,
      //   followUps
      // )

      // const updatedInterview = response.result
      // setInterview(updatedInterview)
      setInput('')

      // 다음 질문이 있으면 음성으로 읽기
      // if (
      //   isVoiceMode &&
      //   updatedInterview.currentQuestionIndex < updatedInterview.questions.length - 1
      // ) {
      //   const nextQuestion =
      //     updatedInterview.questions[updatedInterview.currentQuestionIndex + 1]
      //   await speakText(nextQuestion.question)
      // }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 음성 모드 전환
  // const toggleVoiceMode = () => {
  //   setIsVoiceMode(!isVoiceMode)
  //   if (!isVoiceMode && interview?.questions[interview.currentQuestionIndex]) {
  //     speakText(interview.questions[interview.currentQuestionIndex].question)
  //   }
  // }

  // STT 음성 모드: 사용자가 답변한 음성을 텍스트로 변환
  // const startListening = async () => {
  //   setIsListening(true)
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  //     const mediaRecorder = new MediaRecorder(stream)
  //     mediaRecorderRef.current = mediaRecorder
  //     audioChunksRef.current = []

  //     mediaRecorder.addEventListener("dataavailable", (event) => {
  //       audioChunksRef.current.push(event.data)
  //     })

  //     mediaRecorder.addEventListener("stop", async () => {
  //       const audioBlob = new Blob(audioChunksRef.current)
  //       const response = await 

  //       if (response.ok) {
  //         const { transcription } = await response.json()
  //         setInput(transcription)
  //       } else {
  //         throw new Error("Failed to recognize speech")
  //       }

  //       setIsListening(false)
  //       stream.getTracks().forEach((track) => track.stop())
  //     })

  //     mediaRecorder.start()
  //     setTimeout(() => {
  //       mediaRecorder.stop()
  //     }, 10000)
  //   } catch (error) {
  //     console.error("Error in speech recognition:", error)
  //     setIsListening(false)
  //   }
  // }

  // 음성 입력 중지
  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  // 추가 질문 생성
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
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300`}>
        {/* Mode Toggle Header */}
        <div className="py-4 px-6 border-b bg-white">
          <div className="flex items-center gap-6 ml-6">
            <h1 className="text-xl font-semibold text-gray-900">Interview</h1>
            <div className="flex gap-2">
              <Button
                type="button"
                //onClick={toggleVoiceMode}
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
                  //onClick={isListening ? stopListening : startListening}
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
          <div className="max-w-3xl mx-auto space-y-6">
            {interview.questions.map((q, index) => (
              <div key={q._id} className="space-y-4">
                {/* 질문 */}
                <div className="flex justify-start">
                  <div className="relative max-w-[80%] bg-[#DEFFCF]/40 rounded-2xl">
                    <div className="p-4">
                      <p className="font-medium mb-1">Q{index + 1}:</p>
                      <p className="whitespace-pre-wrap">{q.question}</p>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setFeedback(null)} // 질문 재생성 코드-> 맞는지 확인하기
                        disabled={isLoading}
                        className="h-6 w-6 hover:bg-[#DEFFCF]"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
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
                          <p className="font-semibold text-gray-700">피드백</p>
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

                        {/* 피드백 텍스트 */}
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

