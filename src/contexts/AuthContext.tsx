// contexts/AuthContext.tsx
"use client"

import React, { createContext, useState, useContext, useEffect, type ReactNode } from "react"

interface User{
  username: string  //id
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (token: string, user: User) => void
  logout: () => void
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token")
      const savedUser = localStorage.getItem("user")

      if (savedToken && savedUser) {
        setToken(savedToken)
        setIsLoggedIn(true)
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  const login = (token: string, user: User) => {
    try {
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      setToken(token)
      setUser(user)
      setIsLoggedIn(true)
    } catch (error) {
      console.error("Error during login:", error)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("user")

      setToken(null)
      setUser(null)
      setIsLoggedIn(false)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return <AuthContext.Provider value={{ isLoggedIn, user, login, logout, token }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

