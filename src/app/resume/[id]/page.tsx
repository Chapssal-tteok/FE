// resume/[id]/page.tsx
"use client"

import { ResumeControllerService, ResumeQaControllerService, InterviewControllerService } from "@/api-client"
import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MinusCircle, PlusCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Resume {
  id: string
  title: string
  company: string
  position: string
  content: string
  createdAt: string
  updatedAt: string
}

interface Question {
  id: number
  question: string
  answer: string
}

export default function ResumePage() {
  const { isLoggedIn, logout } = useAuth()
  const resumeId = useParams().id
  const router = useRouter()
  const [ resume, setResume ] = useState<Resume | null>(null)
  const [ loading, setLoading ] = useState(true)
  const [ isEditing, setIsEditing ] = useState(false)
  const [ questions, setQuestions ] = useState<Question[]>([])
  const [ deletedQuestionIds, setDeletedQuestionIds ] = useState<number[]>([])

  const fetchResume = useCallback(async (id: string) => {
    try {
      const [resumeResponse, qaResponse] = await Promise.all([
        ResumeControllerService.getResume(Number(id)),
        ResumeQaControllerService.getResumeQasByResumeId(Number(id))
      ])

      if(!resumeResponse || !resumeResponse.result) {
        throw new Error("Failed to fetch resume data")
      }

      const { resumeId, title, company, position, createdAt, updatedAt } = resumeResponse.result
      
      setResume({
        id: resumeId?.toString() ?? "",
        title: title ?? "제목 없음",
        company: company ?? "",
        position: position ?? "",
        content: "",
        createdAt: createdAt ?? "",
        updatedAt: updatedAt ?? ""
      })

      if (qaResponse.result) {
        setQuestions(qaResponse.result.map((qa, index) => ({
          id: qa.resumeQaId ?? index + 1,
          question: qa.question ?? "",
          answer: qa.answer ?? ""
        })))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    if (!resumeId) {
      return
    }
    if (typeof resumeId === 'string') {
      fetchResume(resumeId)
    }
  }, [isLoggedIn, resumeId, router, fetchResume])

  const handleLogout = () => {
    console.log("Logging out...")
    logout()
    console.log("After logout:", { isLoggedIn })
    router.push("/")
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleSaveClick = async () => {
    try {
      if (!resumeId || typeof resumeId !== 'string') return

      // 삭제된 문항 처리
      for (const deletedId of deletedQuestionIds) {
        await ResumeQaControllerService.deleteResumeQa(Number(resumeId), deletedId)
      }

      // 각 문항 업데이트
      for (const q of questions) {
        if (q.id > 0) {
          // 기존 문항 업데이트
          await ResumeQaControllerService.updateResumeQa(Number(resumeId), q.id, {
            question: q.question,
            answer: q.answer
          })
        } else {
          // 새로운 문항 생성 (음수 ID는 새로운 문항을 의미)
          await ResumeQaControllerService.createResumeQa(Number(resumeId), {
            question: q.question,
            answer: q.answer
          })
        }
      }

      setIsEditing(false)
      setDeletedQuestionIds([]) // 삭제 목록 초기화
      await fetchResume(resumeId)
    } catch (error) {
      console.error("Failed to save resume:", error)
      alert("저장 중 오류가 발생했습니다.")
    }
  }

  const handleCancelClick = () => {
    setIsEditing(false)
    setDeletedQuestionIds([]) // 삭제 목록 초기화
    if (typeof resumeId === 'string') {
      fetchResume(resumeId)
    }
  }

  const addQuestion = () => {
    // 새로운 문항의 ID를 음수로 설정하여 임시 ID임을 표시
    const newId = -(questions.length + 1)
    setQuestions([...questions, { id: newId, question: "", answer: "" }])
  }

  const deleteQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
      // 삭제된 문항의 ID가 양수인 경우 (실제 DB에 있는 문항) 삭제 목록에 추가
      if (id > 0) {
        setDeletedQuestionIds([...deletedQuestionIds, id])
      }
    }
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
      const interviewId = interviewResponse.result.interviewId;
      router.push(`/interview/${interviewId}?resume_id=${resumeId}`);
    } catch (error) {
      console.error("면접 연습 세션 생성 중 오류 발생:", error);
      alert("면접 연습 세션 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  if(loading) return <p>Loading...</p>
  if(!resume) return <p>Resume not found</p>

  return (
    <div className="relative min-h-screen overflow-hidden p-4">
      <div className="absolute inset-0 bg-[url(/svg/Gradients.svg)] bg-center bg-cover opacity-30 z-0"></div>
      <header className="absolute top-0 w-full p-4 z-10">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <div className="flex items-center">
              <Image src="/svg/logo.svg" alt="PreView Logo" width={20} height={20} className="w-5 h-5 mb-1 mt-[-2px]" />
              <span className="ml-1">PreView</span>
            </div>
          </Link>

          <div className="flex space-x-4 mr-8">
            <Link href="/mypage">
              <Button variant="outline">
                My Page
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto mt-15 relative z-20">
        <div className="flex items-center justify-between mb-1">
          <Button variant="ghost" className="text-bold text-lime-500 hover:text-lime-600" onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6 mt-[-4px]" />
            뒤로가기
          </Button>
        </div>
      
        <Card className="bg-[#DEFFCF]/40 backdrop-blur-xs rounded-3xl">
          <CardContent>
            <div className="flex items-center justify-start space-x-2 mb-4">
              <h2 className="text-xl font-bold text-gray-800">{resume.title ?? "자기소개서"}</h2>
              <h3 className="text-lg text-gray-700">{resume.company} {resume.position}</h3>
              <span className="text-sm text-gray-500 ml-auto">
                {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : ""}
              </span>
            </div>
          
            <div className="prose max-w-none space-y-4">
              {isEditing ? (
                <>
                  {questions.map((q, index) => (
                    <div key={q.id} className="space-y-2 p-4 bg-white/70 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">문항 {index + 1}</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => deleteQuestion(q.id)} 
                          className="text-red-500"
                        >
                          <MinusCircle className="w-4 h-4 mt-[-2px]" />
                          문항 삭제
                        </Button>
                      </div>

                      <Input
                        value={q.question}
                        onChange={(e) => {
                          const newQuestions = questions.map((item) => 
                            item.id === q.id ? { ...item, question: e.target.value } : item)
                          setQuestions(newQuestions)
                        }}
                        className="bg-white/80"
                        placeholder="문항을 입력하세요"
                      />

                      <Textarea
                        value={q.answer}
                        onChange={(e) => {
                          const newQuestions = questions.map((item) =>
                            item.id === q.id ? { ...item, answer: e.target.value } : item)
                          setQuestions(newQuestions)
                        }}
                        className="min-h-[100px] bg-white/80"
                        placeholder="답변을 입력하세요"
                      />
                    </div>
                  ))}

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addQuestion} 
                    className="text-lime-600"
                  >
                    <PlusCircle className="w-4 h-4 mt-[-2px]" />
                    문항 추가
                  </Button>
                </>
              ) : (
                questions.map((q, index) => (
                  <div key={q.id} className="space-y-2 p-4 bg-white/70 rounded-lg">
                    <h3 className="text-lg font-semibold">문항 {index + 1}</h3>
                    <p className="font-medium">Q: {q.question}</p>
                    <p className="whitespace-pre-wrap">A: {q.answer}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-5 space-x-4">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg shadow-md transition-colors"
                onClick={handleCancelClick}
              >
                취소
              </Button>
              <Button 
                className="bg-lime-400 hover:bg-lime-500 text-white px-6 py-2 rounded-lg shadow-md transition-colors"
                onClick={handleSaveClick}
              >
                저장
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="bg-lime-400 hover:bg-lime-500 text-white px-6 py-2 rounded-lg shadow-md transition-colors"
                onClick={handleEditClick}
              >
                자기소개서 수정
              </Button>
              <Link href={`/chat/${resumeId}`}>
                <Button 
                  className="bg-lime-400 hover:bg-lime-500 text-white px-6 py-2 rounded-lg shadow-md transition-colors"
                >
                  AI 피드백 받기
                </Button>
              </Link>
              <Button 
                className="bg-lime-400 hover:bg-lime-500 text-white px-6 py-2 rounded-lg shadow-md transition-colors"
                onClick={handleInterviewClick}
              >
                면접 연습하기
              </Button>
            </>
          )}
        </div>
      </div>
    </div>    
  )
}