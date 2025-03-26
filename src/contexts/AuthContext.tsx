"use client"

import React, { createContext, useState, useContext, useEffect, type ReactNode } from "react"

interface User{
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (token && storedUser) {
        setIsLoggedIn(true)
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  const login = (token: string, user: User) => {
    try {
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
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
      setUser(null)
      setIsLoggedIn(false)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

