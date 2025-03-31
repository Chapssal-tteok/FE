"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Resume {
  id: string
  company: string
  position: string
  content: string
  createdAt: string
}

export default function ResumePage() {
  const { isLoggedIn, logout } = useAuth()
  const resume_id = useParams().id
  const router = useRouter()
  const [ resume, setResume ] = useState<Resume | null>({
    id: "1",
    company: "네이버",
    position: "프론트엔드 개발자",
    content: `1. 지원 동기 (500자)
저는 네이버의 프론트엔드 개발자로서 사용자 경험을 혁신하고 싶습니다. 네이버의 기술력과 혁신적인 서비스 개발 문화에 깊은 인상을 받았으며, 특히 네이버의 오픈소스 기여와 기술 공유 문화가 제가 추구하는 개발자의 모습과 일치합니다.

2. 프로젝트 경험 (1000자)
[프로젝트명: AI 기반 자기소개서 작성 도우미]
- React와 TypeScript를 활용한 모던 웹 애플리케이션 개발
- OpenAI API를 활용한 AI 기반 자기소개서 피드백 시스템 구현
- 사용자 경험 개선을 위한 반응형 디자인 적용
- Git을 활용한 버전 관리 및 팀 협업

3. 기술 스택 (500자)
- Frontend: React, TypeScript, Next.js, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- AI: OpenAI API
- Version Control: Git, GitHub
- CI/CD: GitHub Actions`,
    createdAt: "2024-03-20"
  })
  const [ loading, setLoading ] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    if (!resume_id) {
      return
    }
    // if (typeof resume_id === 'string') {
    //   fetchResume(resume_id)
    // }
  }, [isLoggedIn, resume_id, router])

  const handleLogout = () => {
    console.log("Logging out...")
    logout()
    console.log("After logout:", { isLoggedIn })
    router.push("/")
  }

  // 작성한 자기소개서 가져오기
  // const fetchResume = async (resume_id: string) => {
  //   try {
  //     const response = await fetch(`${API_URL}/resume/${resume_id}`)
  //     if(!response.ok) {
  //       throw new Error("Failed to fetch resume data")
  //     }
  //     const data = await response.json()
  //     setResume(data)
  //   } catch (error) {
  //     console.error(error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

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
              <h2 className="text-xl font-bold text-gray-800">{resume.company}</h2>
              <h2 className="text-xl font-semibold text-gray-700">{resume.position}</h2>
              <span className="text-sm text-gray-500 ml-auto">{resume.createdAt}</span>
            </div>
          
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {resume.content}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-5">
          <Link href={`/chat/${resume_id}`}>
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