"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import Image from "next/image"

export default function LogIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      router.push("/")

    } catch (error) {
      console.error("로그인 오류:", error)
      alert("로그인에 실패했습니다. 다시 시도해주세요.")
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[url(/Gradients.svg)] bg-center bg-cover opacity-30 z-0"></div>
      
      <Link href="/" className="absolute top-8 left-1/2 -translate-x-1/2 text-2xl font-bold z-10">
        <div className="flex items-center">
          <Image src="/logo.svg" alt="PreView Logo" width={20} height={20} className="mb-1 mt-[-2px]" />
          <span className="ml-1">PreView</span>
        </div>
      </Link>

      <div className="relative z-10 w-full max-w-2xl bg-[#DEFFCF]/40 backdrop-blur-xs rounded-3xl p-8">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl px-1 py-0.5 bg-light-green/80 rounded-md text-black">Sign In</h1>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">E-mail*</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="rounded-lg border-gray-300 bg-white"
                placeholder="E-mail"
              />
            </div>

            <div className="relative space-y-1">
              <Label htmlFor="password" className="text-sm">Password*</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border-gray-300 bg-white pr-10"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[32px] text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-black font-semibold hover:underline">
                Sign Up
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#1A1A1A] hover:bg-[#333333] text-white rounded-lg py-6" >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
