"use client" 

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[a-zA-Z\d]{8,}$/
    return regex.test(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 비밀번호 확인
    if(password !== confirmPassword){ 
      alert("비밀번호가 일치하지 않습니다.")
      return
    }

    if(!validatePassword(password)){
      alert("비밀번호는 영문과 숫자를 포함하고, 최소 8자 이상이어야 합니다.")
      return
    }

    setErrorMessage("")
    
    // 회원가입 요청
    try{
      // 실제 백엔드 API 주소로 변경해야함
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch("${API_URL}/auth/signup", {   
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if(!response.ok){
        throw new Error("회원가입에 실패했습니다.")
      }
    
      // 회원가입 성공 후 로그인 페이지로 이동
      alert("회원가입에 성공했습니다. 로그인 해주세요.")
      router.push("/login")

    } catch (error) {
      console.error("회원가입 오류:", error)
      alert("회원가입에 실패했습니다. 다시 시도해주세요.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <Link href="/" className="absolute top-4 left-4">
        <h1 className="text-2xl font-bold">PreView</h1>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">Sign Up</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="email">E-mail*</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                className="invalid:border-pink-500 invalid:text-pink-500 focus:invalid:border-pink-500 focus:invalid:outline-pink-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none dark:disabled:border-gray-700 dark:disabled:bg-gray-800/20" 
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password*</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {!validatePassword(password) && password.length > 0 && (
                <p className="text-red-500 text-sm">
                  비밀번호는 영문과 숫자를 포함하고, 최소 8자 이상이어야 합니다.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password*</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {confirmPassword.length > 0 && password !== confirmPassword ? (
                <p className="text-red-500 text-sm">⚠️ 입력한 비밀번호와 일치하지 않습니다.</p>
              ) : confirmPassword.length > 0 && password === confirmPassword ? (
                <p className="text-green-500 text-sm">✅ 비밀번호가 일치합니다.</p>
              ) : null}
 
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <Button  type="submit" className="disabled:{!validatePassword(password) || password !== confirmPassword}bg-lime-400 hover:bg-lime-500 w-full">
              Sign Up
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-green-600 hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}