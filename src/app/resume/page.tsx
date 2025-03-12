"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, ArrowLeft, MinusCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface Question {
  id: number
  question: string
  answer: string
}

export default function NewResume() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

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

  const deleteQuestion = () => {
    // 마지막 문항을 제거 ---맞는지 확인하기
    if (questions.length > 1) {
      const newQuestions = [...questions]
      newQuestions.pop()
      setQuestions(newQuestions)
    }
  }

  //수정 필요
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 제출 로직 추가 필요
    // api 호출로 서버에 데이터 전송?
    console.log("제출된 데이터:", { company, position, questions })

    // 채팅 페이지로 이동
    router.push("/chat/[id]") // 실제 구현 시 고유한 ID를 생성하여 사용해야 함
  }

  if (!isLoggedIn) {
    return null // 또는 로딩 인디케이터
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-white p-4">

      <Link href="/" className="absolute top-4 left-4">
        <h1 className="text-2xl font-bold">PreView</h1>
      </Link>

      <div className="container max-w-4xl mx-auto">

        <Link href="/" className="inline-block mb-4">
          <Button variant="ghost" className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>

        <Card>
          <CardContent className="p-6">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">

                  <Label htmlFor="company">회사명</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />

                </div>
                <div className="space-y-2">

                  <Label htmlFor="position">지원 직무</Label>
                  <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} required />

                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">

                  <h3 className="text-lg font-semibold">자기소개서 문항</h3>

                  {/*문항 추가, 삭제 버튼*/}
                  <Button type="button" variant="outline" onClick={addQuestion} className="text-lime-600">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    문항 추가
                  </Button>

                  <Button type="button" variant="outline" onClick={deleteQuestion} className="text-red-400">
                    <MinusCircle className="w-4 h-4 mr-2" />
                    문항 삭제
                  </Button>

                </div>

                {questions.map((q, index) => (
                  <div key={q.id} className="space-y-2 p-4 bg-green-50 rounded-lg">
                    <Label htmlFor={`question-${q.id}`}>문항 {index + 1}</Label>

                    <Input
                      id={`question-${q.id}`}
                      value={q.question}
                      onChange={(e) => {
                        const newQuestions = [...questions]
                        newQuestions[index].question = e.target.value
                        setQuestions(newQuestions)
                      }}
                      required
                    />

                    <Label htmlFor={`answer-${q.id}`}>답변 {index + 1}</Label>

                    <Textarea
                      id={`answer-${q.id}`}
                      value={q.answer}
                      onChange={(e) => {
                        const newQuestions = [...questions]
                        newQuestions[index].answer = e.target.value
                        setQuestions(newQuestions)
                      }}
                      className="min-h-[100px]"
                      required
                    />

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
