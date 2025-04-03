"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { ResumeList } from "@/components/mypage/ResumeList"
import { InterviewList } from "@/components/mypage/InterviewList"
import { PasswordChangeDialog } from "@/components/mypage/PasswordChangeDialog"
import { AccountDeleteDialog } from "@/components/mypage/AccountDeleteDialog"
import { DeleteAllRecordsDialog } from "@/components/mypage/DeleteAllRecordsDialog"
import Link from "next/link"
import Image from "next/image"

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
  const [isDeleteAllRecordsDialogOpen, setIsDeleteAllRecordsDialogOpen] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const fetchResumes = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/resumes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setResumes(data)
    } catch (error) {
      console.error("Failed to fetch resumes:", error)
    }
  }, [API_URL])

  const fetchInterviews = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/interviews`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setInterviews(data)
    } catch (error) {
      console.error("Failed to fetch interviews:", error)
    }
  }, [API_URL])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      fetchResumes()
      fetchInterviews()
    }
  }, [isLoggedIn, fetchResumes, fetchInterviews, router])

  const handleDeleteResumes = async (selectedIds: string[]) => {
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`${API_URL}/resumes/${id}`, { 
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ))
      setResumes(prev => prev.filter(item => !selectedIds.includes(item.id)))
    } catch (error) {
      console.error("Failed to delete resumes:", error)
    }
  }

  const handleDeleteInterviews = async (selectedIds: string[]) => {
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`${API_URL}/interviews/${id}`, { 
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ))
      setInterviews(prev => prev.filter(item => !selectedIds.includes(item.id)))
    } catch (error) {
      console.error("Failed to delete interviews:", error)
    }
  }

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/users/password`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
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
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
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
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-white p-4">
      <header className="absolute top-0 w-full p-4 z-10">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <div className="flex items-center">
              <Image src="/logo.svg" alt="PreView Logo" width={20} height={20} className="w-5 h-5 mb-1 mt-[-2px]" />
              <span className="ml-1">PreView</span>
            </div>
          </Link>
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleLogout}>Log out</Button>
          </div>
        </div>
      </header>
      
      <div className="container max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6">My Page</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResumeList resumes={resumes} onDelete={handleDeleteResumes} />
          <InterviewList interviews={interviews} onDelete={handleDeleteInterviews} />
        </div>

        {/* 설정 영역 */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4">설정</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="font-medium">이메일</span>
              <span className="text-gray-600">{user?.email}</span>
            </div>
            
            <div className="flex items-center justify-between border-b pb-4">
              <span className="font-medium">비밀번호</span>
              <Button 
                variant="outline" 
                onClick={() => setIsPasswordDialogOpen(true)}
                className="text-lime-500 hover:bg-lime-50 "
              >
                비밀번호 변경
              </Button>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <span className="font-medium">모든 자기소개서 및 면접 기록 삭제하기</span>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteAllRecordsDialogOpen(true)}
                className="text-red-600 hover:bg-red-50"
              >
                모두 삭제
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">계정 삭제</span>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 hover:bg-red-50"
              >
                계정 삭제
              </Button>
            </div>
          </div>
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

      <DeleteAllRecordsDialog
        isOpen={isDeleteAllRecordsDialogOpen}
        onOpenChange={setIsDeleteAllRecordsDialogOpen}
        onConfirm={async () => {
          await handleDeleteResumes(resumes.map(r => r.id))
          await handleDeleteInterviews(interviews.map(i => i.id))
        }}
      />
    </div>
  )
}

