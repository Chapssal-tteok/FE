// Interview/[id]/page.tsx
"use client"

import { InterviewControllerService, ResumeControllerService, InterviewQaControllerService, ResumeQaControllerService, VoiceControllerService } from "@/api-client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { Send, Mic, MicOff, Volume2, File, RefreshCw } from "lucide-react"

interface Question {
  _id: string
  question: string
  answer?: string
  feedback?: string
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

export default function InterviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const interviewId = params?.id;
  const resumeId = searchParams?.get('resume_id');
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const [showFollowUpQuestions, setShowFollowUpQuestions] = useState<Record<string, boolean>>({})

  const speakText = useCallback(async (text: string) => {
    try {
      console.log("TTS 요청 텍스트:", text);
      
      // 이전 오디오 정리
      if (currentAudio) {
        try {
          currentAudio.onended = null;
          currentAudio.pause();
          currentAudio.src = '';
          currentAudio.remove();
        } catch (cleanupError) {
          console.error("이전 오디오 정리 중 오류:", cleanupError);
        }
        setCurrentAudio(null);
      }

      const response = await VoiceControllerService.textToSpeech({
        text
      });

      console.log("TTS 응답:", response);
      
      if (!response.result) {
        throw new Error("음성 합성에 실패했습니다");
      }

      // 새로운 오디오 요소 생성
      const audio = new Audio();
      
      try {
        // URL인 경우
        if (response.result.startsWith('http')) {
          const url = new URL(response.result);
          audio.src = url.href;
          console.log("오디오 URL:", url.href);
        } else if (response.result.startsWith('data:audio')) {
          audio.src = response.result;
        } else {
          // Base64 문자열인 경우
          const byteCharacters = atob(response.result);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const audioData = new Uint8Array(byteNumbers);
          const audioBlob = new Blob([audioData], { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          audio.src = audioUrl;
        }

        // 오디오 로드 완료 후 재생
        audio.onloadeddata = async () => {
          try {
            console.log("오디오 로드 완료");
            setCurrentAudio(audio);
            await audio.play();
          } catch (playError) {
            console.error("오디오 재생 실패:", playError);
            cleanupAudio(audio);
          }
        };

        // 재생이 끝나면 정리
        audio.onended = () => {
          console.log("오디오 재생 종료");
          cleanupAudio(audio);
        };

        // 오류 발생 시 정리
        audio.onerror = (error) => {
          console.error("오디오 로드 실패:", error);
          console.error("오디오 소스:", audio.src);
          cleanupAudio(audio);
        };

        // 오디오 로드 시작
        audio.load();

      } catch (error) {
        console.error("오디오 처리 중 오류:", error);
        cleanupAudio(audio);
        throw error;
      }

    } catch (error) {
      console.error("TTS 오류:", error);
      throw error;
    }
  }, [currentAudio]);

  // 오디오 정리 함수
  const cleanupAudio = (audio: HTMLAudioElement) => {
    try {
      audio.onended = null;
      audio.onloadeddata = null;
      audio.onerror = null;
      audio.pause();
      audio.src = '';
      audio.remove();
      setCurrentAudio(null);
    } catch (error) {
      console.error("오디오 정리 중 오류:", error);
    }
  };

  const fetchAndUpdateQuestions = useCallback(async (company: string, position: string, resumeContent: string) => {
    // 면접 질문 생성
    await InterviewQaControllerService.generateInterviewQuestion(
      Number(interviewId),
      {
        company,
        position,
        resumeContent
      }
    )
    // 질문 목록 다시 가져오기
    const updatedQasResponse = await InterviewQaControllerService.getInterviewQasByInterviewId(Number(interviewId))
    const updatedQas = updatedQasResponse.result || []
    
    setInterview(prev => ({
      ...prev!,
      questions: updatedQas.map((qa) => ({
        _id: String(qa.interviewQaId),
        question: qa.question || "",
        answer: qa.answer || "",
        feedback: qa.analysis || undefined,
        followUpQuestions: [],
      }))
    }));

    return updatedQas;
  }, [interviewId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  const loadInterview = useCallback(async () => {
    setIsLoading(true)
    try {  
      const response = await InterviewControllerService.getInterview(Number(interviewId))
      const data = response.result

      if(!data) {
        console.error("No interview data found")
      }
      
      // 면접 질문 목록 가져오기
      const qasResponse = await InterviewQaControllerService.getInterviewQasByInterviewId(Number(interviewId))
      const qas = qasResponse.result || []
      
      // 면접 질문이 없으면 생성
      if (data && qas.length === 0) {
        // 자기소개서 내용 가져오기
        const resumeResponse = await ResumeQaControllerService.getResumeQasByResumeId(Number(resumeId))
        const resumeContent = resumeResponse.result
          ? resumeResponse.result.map(qa => `Q: ${qa.question}\nA: ${qa.answer || ''}`).join('\n\n')
          : ""

        await fetchAndUpdateQuestions(data.company || "", data.position || "", resumeContent)
      } else {
        setInterview({
          _id: String(data?.interviewId || ""),
          company: data?.company || "",
          position: data?.position || "",
          title: data?.title || "",
          questions: qas.map((qa) => ({
            _id: String(qa.interviewQaId),
            question: qa.question || "",
            answer: qa.answer || "",
            feedback: qa.analysis || undefined,
            followUpQuestions: [],
          })),
          currentQuestionIndex: 0,
        })
      }

    } catch (error) {
      console.error("Failed to load interview:", error)
    } finally {
      setIsLoading(false)
    }
  }, [interviewId, fetchAndUpdateQuestions, resumeId])

  useEffect(() => {
    console.log("Params:", params);
    console.log("SearchParams:", searchParams);
    console.log("InterviewId:", interviewId);
    console.log("ResumeId:", resumeId);

    if (!isLoggedIn) {
      router.push("/login")
    } else if (!interviewId || isNaN(Number(interviewId))) {
      console.error("Invalid interviewId:", interviewId);
      router.push("/writeResume");
    } else {
      loadInterview()
    }
  }, [isLoggedIn, router, interviewId, loadInterview])

  useEffect(() => {
    scrollToBottom()
  }, [interview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !interview) return

    setIsLoading(true)
    const currentQuestion = interview.questions[interview.currentQuestionIndex]
    if (!currentQuestion) return

    try {
      // 자기소개서 데이터 가져오기
      const resumeResponse = await ResumeControllerService.getResume(Number(interviewId))
      if (!resumeResponse.result) {
        throw new Error("자기소개서 정보를 불러올 수 없습니다.")
      }
      
      // 답변 저장
      await InterviewQaControllerService.updateAnswer(
        Number(interviewId),
        Number(currentQuestion._id),
        {
          answer: input
        }
      )
      
      // 답변 분석
      const analysisResponse = await InterviewQaControllerService.analyzeAnswer(
        Number(interviewId),
        Number(currentQuestion._id),
        {
          question: currentQuestion.question,
          answer: input,
          resume: JSON.stringify(resumeResponse.result)
        }
      )
      
      const feedbackResponse = analysisResponse.result?.analysis || ""

      // 추가 질문 생성
      const followUpResponse = await InterviewQaControllerService.generateFollowUp(
        Number(interviewId),
        {
          question: currentQuestion.question,
          answer: input
        }
      )
      
      const followUps = followUpResponse.result?.question ? [followUpResponse.result.question] : []
      setFollowUpQuestions(followUps)

      // 현재는 로컬 상태만 업데이트 (API 호출 없음)
      setInterview((prev) => {
        if (!prev) return prev;
        const updated = [...prev.questions];
        updated[prev.currentQuestionIndex] = {
          ...updated[prev.currentQuestionIndex],
          answer: input,
          feedback: feedbackResponse,
          followUpQuestions: followUps,
        };
        return {
          ...prev,
          questions: updated,
          currentQuestionIndex: 
            prev.currentQuestionIndex + 1 < prev.questions.length
            ? prev.currentQuestionIndex + 1
            : prev.currentQuestionIndex,
        }
      })

      setInput('')

      // 다음 질문이 있으면 음성으로 읽기
      if (
        isVoiceMode &&
        interview.currentQuestionIndex + 1 < interview.questions.length
      ) {
        const nextQuestion = interview.questions[interview.currentQuestionIndex + 1]
        await speakText(nextQuestion.question)
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // 음성 모드 전환
  const toggleVoiceMode = async () => {
    // 이전 오디오 정리
    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio.remove();
      setCurrentAudio(null);
    }

    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode && interview?.questions[interview.currentQuestionIndex]) {
      try {
        await speakText(interview.questions[interview.currentQuestionIndex].question);
      } catch (error) {
        console.error("음성 모드 전환 중 오류:", error);
      }
    }
  };

  // STT 음성 모드: 사용자가 답변한 음성을 텍스트로 변환
  const startListening = async () => {
    setIsListening(true);
    setMediaError(null);
    
    try {
      // 미디어 장치 지원 확인
      if (typeof window === 'undefined') {
        throw new Error("브라우저 환경에서만 사용 가능합니다.");
      }

      // 개발 환경에서의 처리
      if (process.env.NODE_ENV === 'development') {
        console.log("개발 환경에서는 음성 녹음이 제한될 수 있습니다.");
      }

      // 미디어 장치 접근 권한 요청
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      } catch (mediaError) {
        if (mediaError instanceof Error) {
          if (mediaError.name === 'NotAllowedError') {
            throw new Error("마이크 접근 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.");
          } else if (mediaError.name === 'NotFoundError') {
            throw new Error("마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.");
          } else if (mediaError.name === 'NotReadableError') {
            throw new Error("마이크에 접근할 수 없습니다. 다른 프로그램이 마이크를 사용 중일 수 있습니다.");
          }
        }
        throw new Error("마이크 접근에 실패했습니다.");
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        try {
          const response = await VoiceControllerService.speechToText({
            file: audioBlob
          });

          if (response.result?.transcription) {
            setInput(response.result.transcription);
          } else {
            throw new Error("음성 인식에 실패했습니다");
          }
        } catch (error) {
          console.error("STT 오류:", error);
          setMediaError("음성 인식에 실패했습니다. 다시 시도해주세요.");
        }

        setIsListening(false);
        stream.getTracks().forEach((track) => track.stop());
      });

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, 10000);
    } catch (error) {
      console.error("Error in speech recognition:", error);
      setIsListening(false);
      if (error instanceof Error) {
        setMediaError(error.message);
      } else {
        setMediaError("음성 녹음 중 오류가 발생했습니다.");
      }
    }
  };

  // 음성 입력 중지
  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }

  // 추가 질문 생성
  const toggleFollowUpQuestions = (questionId: string) => {
    setShowFollowUpQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  if (!isLoggedIn) return null
  if (!interview) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">면접 정보를 불러오는 중입니다...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header (Breadcrumb 포함) */}
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
                    <BreadcrumbLink href={`/chat/${resumeId}`}>Chat</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Interview</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          {/* Main Chat Area */}
          <div className={`flex-1 flex flex-col h-screen transition-all duration-300`}>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {interview.questions.map((q, index) => (
                  <div key={q._id} className="space-y-4">
                    {/* 질문 */}
                    <div className="flex justify-start">
                      <div className="relative max-w-[80%] bg-[#DEFFCF]/40 rounded-2xl">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">Q{index + 1}:</p>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  if (!interview) return;
                                  // 자기소개서 내용 가져오기
                                  const resumeResponse = await ResumeQaControllerService.getResumeQasByResumeId(Number(resumeId))
                                  const resumeContent = resumeResponse.result
                                    ? resumeResponse.result.map(qa => `Q: ${qa.question}\nA: ${qa.answer || ''}`).join('\n\n')
                                    : ""
                                  await fetchAndUpdateQuestions(interview.company, interview.position, resumeContent)
                                }}
                                disabled={isLoading}
                                className="h-6 w-6 hover:bg-[#DEFFCF]"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => speakText(q.question)}
                                disabled={isLoading}
                                className="h-6 w-6 hover:bg-[#DEFFCF]"
                              >
                                <Volume2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
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
                            {typeof q.feedback === "string" && (
                              <p className="text-sm text-gray-600 whitespace-pre-line">{q.feedback}</p>
                            )}
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
                {interview && interview.questions.length > 0 && (
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="flex-1">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="답변을 입력하세요"
                        className="h-[100px] resize-none overflow-y-auto bg-[#DEFFCF] border-0 rounded-2xl"
                        disabled={isLoading || isListening}
                      />
                      {mediaError && (
                        <p className="text-red-500 text-sm mt-2">{mediaError}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        type="submit"
                        className="bg-lime-500 hover:bg-lime-600 rounded-full px-6"
                        disabled={isLoading || isListening}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoading}
                        variant={isListening ? "default" : "outline"}
                        className="rounded-full px-6 hover:bg-[#DEFFCF]/40"
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
          <audio ref={audioRef} className="hidden" />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

