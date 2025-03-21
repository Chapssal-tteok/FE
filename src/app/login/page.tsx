"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"

export default function LogIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    //로그인 요청
    try{
      const response = await fetch(`${API_URL}/login`, {   
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if(!response.ok){
        throw new Error("로그인에 실패했습니다.")
      }

      const data = await response.json() // 토큰 응답 받기
      login(data.token, data.user) // 토큰 및 사용자 정보 저장

      // 로그인 후 자소서 작성 페이지로 이동
      alert("로그인에 성공했습니다.")
      router.push("/writeResume")

    } catch (error) {
      console.error("로그인 오류:", error)
      alert("로그인에 실패했습니다. 다시 시도해주세요.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">

      <Link href="/" className="absolute top-4 left-4">
        <h1 className="text-2xl font-bold">PreView</h1>
      </Link>

      <Card className="w-full max-w-md">

        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="email">E-mail*</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                className="invalid:border-red-300 invalid:text-red-400 focus:invalid:border-red-400 focus:invalid:outline-red-400 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none"
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="relative space-y-2">
              <Label htmlFor="password">Password*</Label>
              <Input
                id="password"
                type={showPassword ? "text":"password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/5 h-full flex items-center text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button type="submit" className="bg-lime-400 hover:bg-lime-500 w-full">
              Login
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-green-600 hover:underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
