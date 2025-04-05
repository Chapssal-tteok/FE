"use client" 

import { UserAuthControllerService } from "@/api-client"
import { RegisterResponseDTO } from "@/api-client"
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function SignUp() {
  const [username, setUserName] = useState("")
  const [name, setName] = useState("")
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
    setErrorMessage("")

    // 비밀번호 확인
    if(password !== confirmPassword){ 
      alert("비밀번호가 일치하지 않습니다.")
      return
    }

    if(!validatePassword(password)){
      alert("비밀번호는 영문과 숫자를 포함하고, 최소 8자 이상이어야 합니다.")
      return
    }

    // 회원가입 요청
    try{
      const response = await UserAuthControllerService.register({
        username,
        name,
        email,
        password,
      })

      const userInfo : RegisterResponseDTO | undefined = response.result
      console.log("회원가입된 사용자:", userInfo)

      alert("회원가입에 성공했습니다. 로그인 해주세요.")
      router.push("/login")
    } catch (error: any) {
      const message = error?.body?.message || error?.response?.data?.message || "회원가입에 실패했습니다. 다시 시도해주세요."
      setErrorMessage(message)
      console.error("회원가입 실패:", message)
    }
  }

  const isFormValid = () => {
    return (
      username.length > 0 &&
      name.length > 0 &&
      email.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      validatePassword(password) &&
      password === confirmPassword
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative">
      <div className="absolute inset-0 bg-[url(/Gradients.svg)] bg-center bg-cover opacity-30 z-0"></div>
      
      <Link href="/" className="absolute top-8 left-1/2 -translate-x-1/2 text-2xl font-bold z-10">
        <div className="flex items-center">
          <Image src="/logo.svg" alt="PreView Logo" width={20} height={20} className="mb-1 mt-[-2px]" />
          <span className="ml-1">PreView</span>
        </div>
      </Link>

      <div className="relative z-10 w-full max-w-2xl bg-[#DEFFCF]/40 backdrop-blur-xs rounded-3xl p-8">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl px-1 py-0.5 bg-light-green/80 rounded-md text-black">Sign Up</h1>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm">Name*</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-lg border-gray-300 bg-white"
                placeholder="Name"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="username" className="text-sm">Id*</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="rounded-lg border-gray-300 bg-white"
                placeholder="Id"
              />
            </div>

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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border-gray-300 bg-white pr-10"
                placeholder="Password"
              />

              {!validatePassword(password) && password.length > 0 && (
                <p className="text-red-500 text-xs">
                  비밀번호는 영문과 숫자를 포함하고, 최소 8자 이상이어야 합니다.
                </p>
              )}
            </div>

            <div className="relative space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm Password*</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="rounded-lg border-gray-300 bg-white pr-10"
                placeholder="Confirm Password"
              />

              {confirmPassword.length > 0 && password !== confirmPassword ? (
                <p className="text-red-500 text-xs">⚠️ 입력한 비밀번호와 일치하지 않습니다.</p>
              ) : confirmPassword.length > 0 && password === confirmPassword ? (
                <p className="text-green-500 text-xs">✅ 비밀번호가 일치합니다.</p>
              ) : null}
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-semibold hover:underline">
                Sign In
              </Link>
            </div>

            <Button  
              type="submit" 
              className="w-full bg-[#1A1A1A] hover:bg-[#333333] text-white rounded-lg py-6 disabled:{!validatePassword(password) || password !== confirmPassword}"
              disabled={!isFormValid()}
              >
              Sign Up
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}