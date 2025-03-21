"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

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
  const [selectedResumes, setSelectedResumes] = useState<string[]>([])
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([])
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [deleteError, setDeleteError] = useState("")

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      fetchResumes()
      fetchInterviews()
    }
  }, [isLoggedIn])

  // 자기소개서 가져오기
  const fetchResumes = async () => {
    try {
      const response = await fetch(`${API_URL}/resumes`)
      const data = await response.json()
      setResumes(data)
    } catch (error) {
      console.error("Failed to fetch resumes:", error)
    }
  }

  // 면접 기록 가져오기
  const fetchInterviews = async () => {
    try {
      const response = await fetch(`${API_URL}/interviews`)
      const data = await response.json()
      setInterviews(data)
    } catch (error) {
      console.error("Failed to fetch interviews:", error)
    }
  }

  const handleDeleteItems = async (selectedItems: string[], 
                                  setItems: React.Dispatch<React.SetStateAction<any[]>>, endpoint: string) => {
    try {
      await Promise.all(selectedItems.map(id => fetch(`${API_URL}/${endpoint}/${id}`, { method: "DELETE" })));
      setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    } catch (error) {
      console.error(`Failed to delete ${endpoint}:`, error);
    }
  }
  
  const toggleSelection = 
  (id: string, selectedItems: string[], setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }
  
  // 로그아웃
  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // 회원 탈퇴 요청 (비밀번호 확인)
  const handleDeactivate = async () => {
    try {
      if (!user) throw new Error("User not found")
      const response = await fetch(`${API_URL}/users/${user.id}/deactivate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword }),
      })

      if(!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "비밀번호가 올바르지 않습니다.")
      }

      // 탈퇴 확인 단계로 이동
      setIsDeleteDialogOpen(true)
      setDeleteError("")
    } catch (error:any) {
      setDeleteError(error.message)
    }
  }

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    try {
      if (!user) throw new Error("User not found")
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword }),
      })

      if(!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "회원 탈퇴에 실패하였습니다.")
      }

      logout()
      router.push("/")
    } catch (error:any) {
      console.error("Failed to delete account:", error)
      setDeleteError("회원 탈퇴 중 오류가 발생했습니다.")
    }
  }

  // 비밀번호 확인
  const validatePasswords = () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.")
      return false
    }
    if (newPassword.length < 8) {
      setPasswordError("새 비밀번호는 최소 8자 이상이어야 합니다.")
      return false
    }
    setPasswordError("")
    return true
  }

  // 비밀번호 변경
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswords()) return
    try {
      const response = await fetch(`${API_URL}/users/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (response.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다.")
        setIsPasswordDialogOpen(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
      } else {
        const data = await response.json()
        setPasswordError(data.message || "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.")
      }
    } catch (error) {
      console.error("Failed to change password:", error)
      setPasswordError("비밀번호 변경 중 오류가 발생했습니다.")
    }
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
          <Card>
            <CardHeader>
              <CardTitle>내 자기소개서</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {resumes.map((resume) => (
                  <li key={resume.id} className="flex items-center bg-white p-4 rounded-lg shadow">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedResumes.includes(resume.id)}
                      onChange={() => toggleSelection(resume.id, selectedResumes, setSelectedResumes)}
                    />
                    <Link href={`/resume/${resume.id}`} className="flex-1">
                      <div>
                        <h3 className="font-semibold">{resume.company}</h3>
                        <p className="text-sm text-gray-600">{resume.position}</p>
                        <p className="text-xs text-gray-500">{resume.createdAt}</p>
                      </div>
                    </Link>
                    <Link href={`/chat/${resume.id}`}>
                    {/* 기존 채팅 페이지로 이동하는지 확인 */}
                      <Button variant="outline" className="text-lime-500">피드백 받기</Button>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* 새 자기소개서 작성 버튼 */}
              <div className="mt-8 text-center">
                <Link href="/writeResume">
                <Button className="bg-lime-400 hover:bg-lime-500">새 자기소개서 작성</Button>
                </Link>
              </div>

              {/* 선택 삭제 버튼*/}
              <div className="mt-4 text-center">
                <Button variant="destructive" onClick={() => handleDeleteItems(selectedResumes, setResumes, "resumes")}>
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>면접 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {interviews.map((interview) => (
                  <li key={interview.id} className="flex items-center bg-white p-4 rounded-lg shadow">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedInterviews.includes(interview.id)}
                      onChange={() => toggleSelection(interview.id, selectedInterviews, setSelectedInterviews)}
                    />
                    <Link href={`/interview/${interview.id}`} className="flex-1">
                      <div>
                        <h3 className="font-semibold">{interview.company}</h3>
                        <p className="text-sm text-gray-600">{interview.position}</p>
                        <p className="text-xs text-gray-500">{interview.createdAt}</p>
                      </div>
                    </Link>       
                  </li>
                ))}
              </ul>

              <div className="mt-8 text-center">
                <Button variant="destructive" onClick={() => handleDeleteItems(selectedInterviews, setInterviews, "interviews")}>
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 비밀번호 변경 버튼 */}
        <div className="mt-8 text-center space-x-4">
          <Button className="text-lime-600" onClick={() => setIsPasswordDialogOpen(true)}>비밀번호 변경</Button>
          <Button variant="destructive" className="text-red-500" onClick={handleDeactivate}>회원 탈퇴</Button>
        </div>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmNewPassword">새 비밀번호 확인</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">변경</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 회원 탈퇴 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 탈퇴하시겠습니까?</DialogTitle>
          </DialogHeader>
          <p>회원 탈퇴를 진행하면 계정이 완전히 삭제됩니다.</p>
          <div className="space-y-4">
            <Label htmlFor="deletePassword">비밀번호 입력</Label>
              <Input
                id="deletePassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
          </div>
          {deleteError && <p className="text-red-500 text-sm">{deleteError}</p>}
          <DialogFooter className="mt-4">
            <Button variant="destructive" className="text-red-500" onClick={handleDeleteAccount}>회원 탈퇴</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

