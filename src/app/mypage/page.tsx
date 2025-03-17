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
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      fetchResumes()
      fetchInterviews()
    }
  }, [isLoggedIn, router])

  const fetchResumes = async () => {
    try {
        // API 호출 필요
      const API_URL = process.env.PUBLIC_API_URL;
      const response = await fetch("${API_URL}/resumes/{resume_id}")
      const data = await response.json()
      setResumes(data)
    } catch (error) {
      console.error("Failed to fetch resumes:", error)
    }
  }

  const fetchInterviews = async () => {
    try {
        // API 호출 필요
      const API_URL = process.env.PUBLIC_API_URL;
      const response = await fetch("${API_URL}/interviews/{interview_id}")
      const data = await response.json()
      setInterviews(data)
    } catch (error) {
      console.error("Failed to fetch interviews:", error)
    }
  }

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswords()) return
    try {
        // API 호출 필요
      const API_URL = process.env.PUBLIC_API_URL;
      const response = await fetch("${API_URL}/users/password", {
        method: "POST",
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>내 자기소개서</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {resumes.map((resume) => (
                  <li key={resume.id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold">{resume.company}</h3>
                    <p className="text-sm text-gray-600">{resume.position}</p>
                    <p className="text-xs text-gray-400">{resume.createdAt}</p>
                  </li>
                ))}
              </ul>
              {/* 새 자기소개서 작성 버튼 */}
              <div className="mt-8 text-center">
                <Link href="/resume">
                <Button className="bg-lime-400 hover:bg-lime-500">새 자기소개서 작성</Button>
                </Link>
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
                  <li key={interview.id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold">{interview.company}</h3>
                    <p className="text-sm text-gray-600">{interview.position}</p>
                    <p className="text-xs text-gray-400">{interview.createdAt}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 text-center">
          <Button onClick={() => setIsPasswordDialogOpen(true)}>비밀번호 변경</Button>
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
    </div>
  )
}

