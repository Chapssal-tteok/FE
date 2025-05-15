// chat/[id]/page.tsx
"use client"

import { ResumeControllerService, ResumeQaControllerService, InterviewControllerService } from "@/api-client"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Bot, Edit2, Save, X, MessageSquare } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface QaFeedback {
  question: string;
  answer: string;
  feedback: string;
}

interface Question {
  id: number;
  question: string;
  answer: string;
}

export default function Chat() {
  const { id: resumeId } = useParams();
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [qaFeedbacks, setQaFeedbacks] = useState<QaFeedback[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    scrollToBottom()
  }, [qaFeedbacks])

  const fetchInitialMessages = async () => {
    try {
      setIsLoading(true)

      // 자기소개서 데이터와 문답 데이터 가져오기
      const [resumeResponse, qaResponse] = await Promise.all([
        ResumeControllerService.getResume(Number(resumeId)),
        ResumeQaControllerService.getResumeQasByResumeId(Number(resumeId))
      ])

      if (!resumeResponse.result) {
        throw new Error("자기소개서 정보를 불러올 수 없습니다.")
      }

      const resumeData = resumeResponse.result
      const { company, position } = resumeData

      if (!company || !position) {
        throw new Error("회사명 또는 직무 정보가 누락되었습니다.");
      }

      // questions 상태 업데이트
      if (qaResponse.result) {
        setQuestions(qaResponse.result.map((qa, index) => ({
          id: qa.resumeQaId ?? index + 1,
          question: qa.question ?? "",
          answer: qa.answer ?? ""
        })))
      }

      // 각 문답에 대해 분석 요청
      try {
        const feedbackPromises = qaResponse.result?.map(async (qa) => {
          if (!qa.resumeQaId || !qa.question || !qa.answer) return null;
          
          const analysisResponse = await ResumeQaControllerService.analyzeResumeQa(
            Number(resumeId),
            qa.resumeQaId,
            {
              question: qa.question,
              answer: qa.answer,
              company: company,
              position: position
            }
          );

          return {
            question: qa.question,
            answer: qa.answer,
            feedback: analysisResponse.result?.analysis || ""
          };
        }) || [];

        const feedbacks = (await Promise.all(feedbackPromises)).filter((feedback): feedback is QaFeedback => feedback !== null);
        setQaFeedbacks(feedbacks);
      } catch (error) {
        console.error("피드백 생성 중 오류 발생:", error);
        // 피드백 생성 실패 시에도 문답은 표시
        setQaFeedbacks([]);
      }
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
      // 에러 발생 시에도 문답은 표시
      setQaFeedbacks([]);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialMessages()
  }, [resumeId, fetchInitialMessages])

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleSaveClick = async () => {
    try {
      if (!resumeId || typeof resumeId !== 'string') return

      // 각 문항 업데이트
      for (const q of questions) {
        if (q.id > 0) {
          try {
            // 기존 문항 업데이트
            await ResumeQaControllerService.updateResumeQa(Number(resumeId), q.id, {
              question: q.question,
              answer: q.answer
            })
          } catch (error) {
            console.error(`문항 ${q.id} 업데이트 중 오류 발생:`, error);
            throw new Error("문항 업데이트 중 오류가 발생했습니다.");
          }
        }
      }

      setIsEditing(false)
      await fetchInitialMessages()
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  const handleCancelClick = () => {
    setIsEditing(false)
  }

  const handleInterviewClick = async () => {
    try {
      if (!resumeId) return;

      // 자기소개서 데이터 가져오기
      const resumeResponse = await ResumeControllerService.getResume(Number(resumeId));
      if (!resumeResponse.result) {
        throw new Error("자기소개서 정보를 불러올 수 없습니다.");
      }

      const { company, position } = resumeResponse.result;
      if (!company || !position) {
        throw new Error("회사명 또는 직무 정보가 누락되었습니다.");
      }

      // 면접 연습 세션 생성
      const interviewResponse = await InterviewControllerService.createInterview({
        title: `${company} ${position} 면접 연습`,
        company: company,
        position: position
      });

      if (!interviewResponse.result?.interviewId) {
        throw new Error("면접 연습 세션 생성에 실패했습니다.");
      }

      // 생성된 면접 연습 세션으로 이동
      router.push(`/interview/${interviewResponse.result.interviewId}`);
    } catch (error) {
      console.error("면접 연습 세션 생성 중 오류 발생:", error);
      alert("면접 연습 세션 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
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
                    <BreadcrumbLink href="/writeResume">Write Resume</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Resume Feedback</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
  
          {/* Main Content Area */}
          <div className="flex-1 flex transition-all duration-300">
            {/* Left Side - Questions and Answers */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-6">
                {isEditing ? (
                  questions.map((q, index) => (
                    <div key={q.id} className="bg-white rounded-2xl p-6 shadow-md">
                      <h3 className="text-lg font-semibold mb-4">문항 {index + 1}</h3>
                      <div className="space-y-4">
                        <Input
                          value={q.question}
                          onChange={(e) => {
                            const newQuestions = questions.map((item) => 
                              item.id === q.id ? { ...item, question: e.target.value } : item)
                            setQuestions(newQuestions)
                          }}
                          className="bg-gray-50"
                          placeholder="문항을 입력하세요"
                        />
                        <Textarea
                          value={q.answer}
                          onChange={(e) => {
                            const newQuestions = questions.map((item) =>
                              item.id === q.id ? { ...item, answer: e.target.value } : item)
                            setQuestions(newQuestions)
                          }}
                          className="min-h-[150px] bg-gray-50"
                          placeholder="답변을 입력하세요"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  questions.map((q, index) => (
                    <div key={q.id} className="bg-white rounded-2xl p-6 shadow-md">
                      <h3 className="text-lg font-semibold mb-4">문항 {index + 1}</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="whitespace-pre-wrap">{q.question}</p>
                        </div>
                        <div>
                          <p className="whitespace-pre-wrap">{q.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="bg-gray-400 hover:bg-gray-500 text-white"
                        onClick={handleCancelClick}
                      >
                        <X className="w-4 h-4 mr-2 mt-[-2px]" />
                        취소
                      </Button>
                      <Button
                        className="bg-lime-500 hover:bg-lime-600 text-white"
                        onClick={handleSaveClick}
                      >
                        <Save className="w-4 h-4 mr-2 mt-[-2px]" />
                        저장
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        className="bg-lime-500 hover:bg-lime-600 text-white"
                        onClick={handleEditClick}
                      >
                        <Edit2 className="w-4 h-4 mt-[-2px]" />
                        자기소개서 수정
                      </Button>
                      <Button
                        className="bg-lime-500 hover:bg-lime-600 text-white"
                        onClick={handleInterviewClick}
                      >
                        <MessageSquare className="w-4 h-4 mt-[-2px]" />
                        면접 연습하기
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Feedback */}
            <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
              <div className="max-w-3xl mx-auto space-y-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mb-4"></div>
                    <p className="text-gray-600">자기소개서 피드백을 생성하고 있습니다...</p>
                  </div>
                ) : (
                  qaFeedbacks.map((qa, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-md">
                      <div className="flex items-center gap-2 mb-4">
                        <Bot className="w-6 h-6 text-lime-600" />
                        <h3 className="text-lg font-semibold">피드백 {index + 1}</h3>
                      </div>
                      <p className="whitespace-pre-wrap">{qa.feedback}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )  
}
