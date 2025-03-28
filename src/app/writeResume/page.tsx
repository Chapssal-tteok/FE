"use client"

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


interface Question {
  id: number
  question: string
  answer: string
}

export default function NewResume() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  const [company, setCompany] = useState("")
  const [position, setPosition] = useState("")
  const [questions, setQuestions] = useState<Question[]>([{ id: 1, question: "", answer: "" }])

  const addQuestion = () => {
    const newId = questions.length + 1
    setQuestions([...questions, { id: newId, question: "", answer: "" }])
  }

  const deleteQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
      // 서버로 데이터 전송
      const response = await fetch(`${API_URL}/resumes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company, position, questions })
      })

      if (!response.ok) {
        throw new Error("서버 오류 발생")
      }

      const result = await response.json()
      console.log("제출 완료:", result)
      // 생성된 ID 기반으로 채팅 페이지 이동
      router.push(`/chat/${result.id}`)
    } catch (error) {
      console.error("제출 실패:", error)
      alert("제출 중 오류가 발생했습니다.")
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 to-white p-4">
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-bold">
          <div className="flex items-center">
            <img src="/Vector.png" alt="PreView Logo" className="w-5 h-5 mb-1" />
            <span className="ml-1">PreView</span>
          </div>
        </Link>
      </div>

      <div className="container max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">회사명</Label>
                  <Input id="company" 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)} 
                  required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">지원 직무</Label>
                  <Input id="position" 
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)} 
                  required />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">자기소개서 문항</h3>

                {questions.map((q, index) => (
                  <div key={q.id} className="space-y-2 p-4 bg-lime-50 rounded-lg">
                    <Label htmlFor={`question-${q.id}`}>문항 {index + 1}</Label>

                    <Input
                      id={`question-${q.id}`}
                      value={q.question}
                      onChange={(e) => {
                        const newQuestions = questions.map((item) => 
                          item.id === q.id ? { ...item, question: e.target.value } : item)
                        setQuestions(newQuestions)
                      }}
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
                      className="min-h-[100px]"
                      required
                    />

                  {/*문항 추가, 삭제 버튼*/}
                  <Button type="button" variant="outline" onClick={addQuestion} className="text-lime-600 mr-1">
                    <PlusCircle className="w-4 h-4" />
                    문항 추가
                  </Button>

                  <Button type="button" variant="outline" onClick={() => deleteQuestion(q.id)} className="text-red-500">
                    <MinusCircle className="w-4 h-4" />
                    문항 삭제
                  </Button>
                </div>
                ))}

              </div>

              <Button type="submit" className="w-full bg-lime-400 hover:bg-lime-500">
                제출
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
