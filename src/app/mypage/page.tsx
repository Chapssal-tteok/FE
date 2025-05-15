// mypage/page.tsx
"use client"

import { ResumeControllerService, InterviewControllerService, UserControllerService } from "@/api-client"
import { UpdateUserDTO, ResumeDTO, InterviewDTO, UserInfoDTO } from "@/api-client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { ResumeList } from "@/components/mypage/ResumeList"
import { InterviewList } from "@/components/mypage/InterviewList"
import { PasswordChangeDialog } from "@/components/mypage/PasswordChangeDialog"
//import { AccountDeleteDialog } from "@/components/mypage/AccountDeleteDialog"
import { DeleteAllRecordsDialog } from "@/components/mypage/DeleteAllRecordsDialog"
import Link from "next/link"
import Image from "next/image"

interface Resume {
  resumeId: string
  title: string
  company: string
  position: string
  createdAt: string
  updatedAt: string
}

interface Interview {
  interviewId: string
  title: string
  company: string
  position: string
  createdAt: string
  updatedAt: string
}

export default function MyPage() {
  const { resumeId } = useParams()
  const { isLoggedIn, logout } = useAuth()
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  //const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleteAllRecordsDialogOpen, setIsDeleteAllRecordsDialogOpen] = useState(false)

  const fetchResumes = useCallback(async () => {
    try {
      const response = await UserControllerService.getMyResumes()
      if (response.result) {
        if (Array.isArray(response.result)) {
          setResumes(response.result.map((resume: ResumeDTO) => ({
            resumeId: String(resume.resumeId),
            title: resume.title || "",
            company: resume.company || "",
            position: resume.position || "",
            createdAt: resume.createdAt || "",
            updatedAt: resume.updatedAt || "",
          })))
        } else {
          console.error("Unexpected response format:", response.result)
        }
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error)
    }
  }, [])

  const fetchInterviews = useCallback(async () => {
    try {
      const response = await UserControllerService.getMyInterviews()
      if (response.result) {
        if (Array.isArray(response.result)) {
          setInterviews(response.result.map((interview: InterviewDTO) => ({
            interviewId: String(interview.interviewId),
            title: interview.title || "",
            company: interview.company || "",
            position: interview.position || "",
            createdAt: interview.createdAt || "",
            updatedAt: interview.updatedAt || "",
          })))
        } else {
          console.error("Unexpected response format:", response.result)
        }
      }
    } catch (error) {
      console.error("Failed to fetch interviews:", error)
    }
  }, [])

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await UserControllerService.getUserInfo()
      if (response.result) {
        setUserInfo(response.result)
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      fetchResumes()
      fetchInterviews()
      fetchUserInfo()
    }
  }, [isLoggedIn, fetchResumes, fetchInterviews, fetchUserInfo, router])

  const handleDeleteResumes = async (selectedIds: string[]) => {
    try {
      // ID 유효성 검사
      const validIds = selectedIds.filter(id => !isNaN(Number(id)) && Number(id) > 0)
      
      if (validIds.length === 0) {
        throw new Error("유효한 이력서 ID가 없습니다.")
      }

      await Promise.all(
        validIds.map(async (id) => {
          try {
            await ResumeControllerService.deleteResume(Number(id))
          } catch (error) {
            console.error(`이력서 ID ${id} 삭제 실패:`, error)
            throw error
          }
        })
      )
      
      setResumes(prev => prev.filter(item => !validIds.includes(item.resumeId)))
    } catch (error) {
      console.error("이력서 삭제 중 오류 발생:", error)
      alert("이력서 삭제 중 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }

  const handleDeleteInterviews = async (selectedIds: string[]) => {
    try {
      await Promise.all(selectedIds.map(id => InterviewControllerService.deleteInterview(Number(id))))
      setInterviews(prev => prev.filter(item => !selectedIds.includes(item.interviewId)))
    } catch (error) {
      console.error("Failed to delete interviews:", error)
    }
  }

  const handleDeleteAllRecords = async () => {
    try {
      await Promise.all([
        ...resumes.map(resume => ResumeControllerService.deleteResume(Number(resume.resumeId))),
        ...interviews.map(interview => InterviewControllerService.deleteInterview(Number(interview.interviewId)))
      ])
      setResumes([])
      setInterviews([])
    } catch (error) {
      console.error("Failed to delete all records:", error)
    }
  }

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      const payload: UpdateUserDTO = {
        currentPassword,
        password: newPassword
      }
      const response = await UserControllerService.updateUserInfo(payload)
      if (!response.isSuccess) {
        throw new Error(response.message || "비밀번호 변경에 실패했습니다.")
      }
      alert("비밀번호가 성공적으로 변경되었습니다.")
    } catch (error) {
      console.error("비밀번호 변경 실패:", error)
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.")
    }
  }

  // 회원 탈퇴 처리 -> 회원 탈퇴 API 추가 후 사용
  // const handleAccountDelete = async (password: string) => {
  //   try {
  //     if (!user) throw new Error("User not found")
      
  //     const response = await UserControllerService.deleteUserInfo()

  //     if (!response.isSuccess) {
  //       throw new Error(response.message || "회원 탈퇴에 실패하였습니다.")
  //     }
      
  //     logout()
  //     router.push("/")
  //   } catch (error) {
  //     console.error("회원 탈퇴 실패:", error)
  //     alert(error instanceof Error ? error.message : "오류가 발생했습니다.")
  //   }
  // }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isLoggedIn) return null

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-lime-50 to-white p-4">
      <header className="absolute top-0 w-full p-4 z-10">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <div className="flex items-center">
              <Image src="/svg/logo.svg" alt="PreView Logo" width={20} height={20} className="w-5 h-5 mb-1 mt-[-2px]" />
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
              <span className="font-medium">이름</span>
              <span className="text-gray-600">{userInfo?.name || "Unknown User"}</span>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <span className="font-medium">이메일</span>
              <span className="text-gray-600">{userInfo?.email || "Unknown User"}</span>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <span className="font-medium">아이디</span>
              <span className="text-gray-600">{userInfo?.username || "Unknown User"}</span>
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
                //onClick={() => setIsDeleteDialogOpen(true)}
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

      {/* <AccountDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleAccountDelete}
      /> */}

      <DeleteAllRecordsDialog
        isOpen={isDeleteAllRecordsDialogOpen}
        onOpenChange={setIsDeleteAllRecordsDialogOpen}
        onConfirm={handleDeleteAllRecords}
      />
    </div>
  )
}

