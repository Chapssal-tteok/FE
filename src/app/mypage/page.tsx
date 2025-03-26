"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { ResumeList } from "@/components/mypage/ResumeList"
import { InterviewList } from "@/components/mypage/InterviewList"
import { PasswordChangeDialog } from "@/components/mypage/PasswordChangeDialog"
import { AccountDeleteDialog } from "@/components/mypage/AccountDeleteDialog"

interface Resume {
  id: string
  company: string
  position: string
  createdAt: string
}

interface Interview {
  id: string
  company: string
  position: string
  createdAt: string
}

export default function MyPage() {
  const { isLoggedIn, logout, user } = useAuth()
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      fetchResumes()
      fetchInterviews()
    }
  }, [isLoggedIn])

  const fetchResumes = async () => {
    try {
      const response = await fetch(`${API_URL}/resumes`)
      const data = await response.json()
      setResumes(data)
    } catch (error) {
      console.error("Failed to fetch resumes:", error)
    }
  }

  const fetchInterviews = async () => {
    try {
      const response = await fetch(`${API_URL}/interviews`)
      const data = await response.json()
      setInterviews(data)
    } catch (error) {
      console.error("Failed to fetch interviews:", error)
    }
  }

  const handleDeleteResumes = async (selectedIds: string[]) => {
    try {
      await Promise.all(selectedIds.map(id => fetch(`${API_URL}/resumes/${id}`, { method: "DELETE" })))
      setResumes(prev => prev.filter(item => !selectedIds.includes(item.id)))
    } catch (error) {
      console.error("Failed to delete resumes:", error)
    }
  }

  const handleDeleteInterviews = async (selectedIds: string[]) => {
    try {
      await Promise.all(selectedIds.map(id => fetch(`${API_URL}/interviews/${id}`, { method: "DELETE" })))
      setInterviews(prev => prev.filter(item => !selectedIds.includes(item.id)))
    } catch (error) {
      console.error("Failed to delete interviews:", error)
    }
  }

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/users/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.")
    }
    alert("비밀번호가 성공적으로 변경되었습니다.")
  }

  const handleAccountDelete = async (password: string) => {
    if (!user) throw new Error("User not found")
    const response = await fetch(`${API_URL}/users/${user.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || "회원 탈퇴에 실패하였습니다.")
    }

    logout()
    router.push("/")
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">마이 페이지</h1>
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleLogout}>Log out</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResumeList resumes={resumes} onDelete={handleDeleteResumes} />
          <InterviewList interviews={interviews} onDelete={handleDeleteInterviews} />
        </div>

        <div className="mt-8 text-center space-x-4">
          <Button className="text-lime-600" onClick={() => setIsPasswordDialogOpen(true)}>
            비밀번호 변경
          </Button>
          <Button variant="destructive" className="text-red-500" onClick={() => setIsDeleteDialogOpen(true)}>
            회원 탈퇴
          </Button>
        </div>
      </div>

      <PasswordChangeDialog
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onSubmit={handlePasswordChange}
      />

      <AccountDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleAccountDelete}
      />
    </div>
  )
}

