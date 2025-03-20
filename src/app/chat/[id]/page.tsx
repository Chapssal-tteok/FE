"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { MessageCircle, UserCircle2, LogOut, RefreshCw, Send } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Chat({ resumes }: { resumes: { id: string } }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Chat messages fetch
    const fetchInitialMessages = async () => {
      try {
        const API_URL = process.env.PUBLIC_API_URL
        const response = await fetch(`${API_URL}/resumes/${resumes.id}`)
        
        if(!response.ok) {
          throw new Error("Failed to fetch resume data")
        }

        const data = await response.json()
        setMessages([{ role: "AI", content: data.feedback }])
      } catch (error) {
        console.error("Error fetching feedback", error)
      }
    }

    fetchInitialMessages()
  }, [resumes.id])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSendMessage = async () => {
    if(!message.trim()) return

    const userMessage = { role: "user", content: message }
    setMessages((prev) => [...prev, userMessage])
    setMessage("")

    try {
      const API_URL = process.env.PUBLIC_API_URL
      const response = await fetch(`${API_URL}/resumes/${resumes.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ id: resumes, message }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "ai", content: data.reply }])
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4">

      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r">
        <div className="p-4 border-b">
          <Link href="/" className="text-xl font-bold">PreView</Link>
        </div>
        <div className="p-4">
          <Link href="/resume">
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="space-y-2">
            <Link href="/mypage">
              <Button variant="ghost" className="w-full justify-start">
                <UserCircle2 className="w-4 h-4 mr-2" />
                My Page
              </Button>
            </Link>
            
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <h1 className="text-3xl font-bold mb-6">Resume Feedback</h1>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-x-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={'p-4 rounded-lg ${msg.role === "ai" ? "bg-lime-100" : "bg-gray-100"}'}>
                <p className="text-sm font-medium">{msg.role === "ai" ? "AI" : "You"}</p>
                <p className="mt-1">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto flex gap-4">
            <Button variant="outline" size="icon" onClick={() => setMessages([])}>
              <RefreshCw className="w-4 h-4" />
            </Button>

            <div className="flex-1 flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send a message"
                className="min-h-[50px]"
              />
              <Button className="bg-lime-400 hover:bg-lime-500" onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}