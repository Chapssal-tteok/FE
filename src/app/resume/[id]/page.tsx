// resume/[id]/page.tsx
"use client"

import { ResumeControllerService, ResumeQaControllerService } from "@/api-client"
import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Resume {
  id: string
  title: string
  company: string
  position: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function ResumePage() {
  const { isLoggedIn, logout } = useAuth()
  const resumeId = useParams().id
  const router = useRouter()
  const [ resume, setResume ] = useState<Resume | null>(null)
  const [ loading, setLoading ] = useState(true)

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
      
      // QA 내용을 하나의 문자열로 결합
      const content = qaResponse.result?.map(qa => 
        `Q: ${qa.question}\nA: ${qa.answer || ''}`
      ).join('\n\n') ?? ""
      
      setResume({
        id: resumeId?.toString() ?? "",
        title: title ?? "제목 없음",
        company: company ?? "",
        position: position ?? "",
        content,
        createdAt: createdAt ?? "",
        updatedAt: updatedAt ?? ""
      })
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

  if(loading) return <p>Loading...</p>
  if(!resume) return <p>Resume not found</p>

  return (
    <div className="relative min-h-screen overflow-hidden p-4">
      <div className="absolute inset-0 bg-[url(/Gradients.svg)] bg-center bg-cover opacity-30 z-0"></div>
      <header className="absolute top-0 w-full p-4 z-10">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <div className="flex items-center">
              <Image src="/logo.svg" alt="PreView Logo" width={20} height={20} className="w-5 h-5 mb-1 mt-[-2px]" />
              <span className="ml-1">PreView</span>
            </div>
          </Link>

          <div className="flex space-x-4 mr-4">
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
              <span className="text-sm text-gray-500 ml-auto">
                {resume.createdAt ? new Date(resume.createdAt).toLocaleString() : ""}
              </span>
            </div>
          
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {resume.content}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-5">
          <Link href={`/chat/${resumeId}`}>
            <Button 
              className="bg-lime-400 hover:bg-lime-500 text-white px-6 py-2 rounded-lg shadow-md transition-colors" >
              AI 피드백 받기
            </Button>
          </Link>
        </div>
      </div>
    </div>    
  )
}