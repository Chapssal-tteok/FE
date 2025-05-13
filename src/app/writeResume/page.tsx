// writeResume/page.tsx
"use client"

import { ResumeControllerService, ResumeQaControllerService, InterviewControllerService, InterviewQaControllerService } from "@/api-client"
import type { CreateResumeDTO, CreateResumeQaDTO, CreateInterviewDTO, CreateInterviewQaDTO } from "@/api-client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, MinusCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Question {
  id: number
  question: string
  answer: string
}

export default function NewResume() {
  const { isLoggedIn, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  const handleLogout = () => {
    console.log("Logging out...")
    logout()
    console.log("After logout:", { isLoggedIn })
    router.push("/")
  }

  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [position, setPosition] = useState("")
  const [questions, setQuestions] = useState<Question[]>([{ id: 1, question: "", answer: "" }])

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
     // 입력 필드 검증
    if (!company.trim() || !position.trim()) {
      alert("회사명과 지원 직무를 입력해주세요.")
      return
    }

    for (const q of questions) {
      if (!q.question.trim() || !q.answer.trim()) {
        alert("모든 문항과 답변을 작성해주세요.")
        return
      }
    }

    try {
      // 새 자기소개서 생성
      const createResumeRequest: CreateResumeDTO = {
        title,
        company,
        position,
      }

      const resumeResponse = await ResumeControllerService.createResume(createResumeRequest)
      const resumeId = resumeResponse.result?.resumeId

      if(!resumeId) {
        throw new Error("자기소개서 생성 실패")
      }

      // 문항 및 답변 생성
      for (const q of questions) {
        const createResumeQaRequest: CreateResumeQaDTO = {
          question: q.question,
          answer: q.answer,
        };
  
        await ResumeQaControllerService.createResumeQa(resumeId, createResumeQaRequest);
      }

      // 생성된 ID 기반으로 채팅 페이지 이동
      router.push(`/chat/${resumeId}`)
    } catch (error) {
      console.error("제출 실패:", error)
      alert("제출 중 오류가 발생했습니다.")
    }
  }

  const addQuestion = () => {
    const newId = questions.length + 1
    setQuestions([...questions, { id: newId, question: "", answer: "" }])
  }

  const deleteQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const handleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 입력 필드 검증
    if (!company.trim() || !position.trim()) {
      alert("회사명과 지원 직무를 입력해주세요.")
      return
    }
    for (const q of questions) {
      if (!q.question.trim() || !q.answer.trim()) {
        alert("모든 문항과 답변을 작성해주세요.")
        return
      }
    }
    try {
      const createInterviewRequest: CreateInterviewDTO = {
        title,
        company,
        position,
      }
      
      const interviewResponse = await InterviewControllerService.createInterview(createInterviewRequest);
      const interviewId = interviewResponse.result?.interviewId;
      if (!interviewId) {
        throw new Error("면접 생성 실패");
      }

      // 문항 및 답변 생성
      for (const q of questions) {
        const createInterviewQaRequest: CreateInterviewQaDTO = {
          question: q.question,
        };
  
        await InterviewQaControllerService.createInterviewQa(interviewId, createInterviewQaRequest);
      }

      router.push(`/interview/${interviewId}`)
    } catch (error) {
      console.error("Interview 제출 실패:", error)
      alert("제출 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden p-4">
      <div className="absolute inset-0 bg-[url(/svg/Gradients.svg)] bg-center bg-cover opacity-30 z-0"></div>
      <header className="absolute top-0 w-full p-4 z-50">
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

      <div className="container max-w-4xl mx-auto mt-15">
        <Card className="bg-[#DEFFCF]/50 backdrop-blur-xs rounded-3xl">
          <CardContent className="p-6 ">
            <form className="space-y-6">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/80"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">회사명</Label>
                  <Input id="company" 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)} 
                  className="bg-white/80"
                  required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">지원 직무</Label>
                  <Input id="position" 
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)} 
                  className="bg-white/80"
                  required />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">자기소개서 문항</h3>

                {questions.map((q, index) => (
                  <div key={q.id} className="space-y-2 p-4 bg-white/70 rounded-lg">
                    <Label htmlFor={`question-${q.id}`}>문항 {index + 1}</Label>

                    <Input
                      id={`question-${q.id}`}
                      value={q.question}
                      onChange={(e) => {
                        const newQuestions = questions.map((item) => 
                          item.id === q.id ? { ...item, question: e.target.value } : item)
                        setQuestions(newQuestions)
                      }}
                      className="bg-white/80"
                      required
                    />

                    <Label htmlFor={`answer-${q.id}`}>답변 {index + 1}</Label>
                    <Textarea
                      id={`answer-${q.id}`}
                      value={q.answer}
                      onChange={(e) => {
                        const newQuestions = questions.map((item) =>
                          item.id === q.id ? { ...item, answer: e.target.value } : item)
                        setQuestions(newQuestions)
                      }}
                      className="min-h-[100px] bg-white/80"
                      required
                    />

                  {/*문항 추가, 삭제 버튼*/}
                  <Button type="button" variant="outline" onClick={addQuestion} className="text-lime-600 mr-1">
                    <PlusCircle className="w-4 h-4 mt-[-2px]" />
                    문항 추가
                  </Button>

                  <Button type="button" variant="outline" onClick={() => deleteQuestion(q.id)} className="text-red-500">
                    <MinusCircle className="w-4 h-4 mt-[-2px]" />
                    문항 삭제
                  </Button>
                </div>
                ))}
              </div>
                <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 text-black bg-lime-400 hover:bg-lime-500" 
                  onClick={handleChatSubmit}
                >
                  자기소개서 피드백
                </Button>

                <Button 
                  type="submit" 
                  className="flex-1 text-black bg-green-500 hover:bg-green-600"
                  onClick={handleInterviewSubmit}
                >
                  면접 연습
                </Button>
                </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
