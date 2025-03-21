"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

interface Resume {
  id: string
  company: string
  position: string
  content: string
  createdAt: string
}

export default function ResumePage() {
  const { isLoggedIn } = useAuth()
  const resume_id = useParams().id
  const router = useRouter()
  const [ resume, setResume ] = useState<Resume | null>(null)
  const [ loading, setLoading ] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    if (!resume_id) {
      return
    }
    if (typeof resume_id === 'string') {
      fetchResume(resume_id)
    }
  }, [isLoggedIn, resume_id, router])

  const fetchResume = async (resume_id: string) => {
    try {
      const response = await fetch(`${API_URL}/resume/${resume_id}`)
      if(!response.ok) {
        throw new Error("Failed to fetch resume data")
      }
      const data = await response.json()
      setResume(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if(loading) return <p>Loading...</p>
  if(!resume) return <p>Resume not found</p>

  return (
    <div className="container max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{resume.company} - {resume.position}</h1>
      <p className="text-gray-600 mb-4">{resume.createdAt}</p>
      <div className="border p-4 bg-white rounded-md shadow">
        <p>{resume.content}</p>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="text-lime-500" onClick={() => router.back()}>Back</Button>
        <Button className="bg-lime-400 hover:bg-lime-500" onClick={() => router.push(`/chat/${resume_id}`)}>Get Feedback</Button>
    </div>
    </div>
  )
}