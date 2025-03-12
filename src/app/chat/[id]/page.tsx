"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, FileText, UserCircle2, LogOut, RefreshCw, Send } from "lucide-react"

export default function Chat({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState("")

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r">
        <div className="p-4 border-b">

          <Link href="/" className="text-xl font-bold">
            PreView
          </Link>

        </div>
        <div className="p-4">

          <Link href="/resume">
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </Link>

          {/* 마이페이지에 사용자의 모든 이력서가 보이도록 하면 이 버튼은 필요 없을지도.. 아니면 chatgpt처럼 모든 기록 리스트로 좌측 사이드바에 뜨게 할 수도 있을 듯*/}
          <div className="mt-4">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              My Resume
            </Button>
          </div>

        </div>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="space-y-2">

            <Link href="/mypage">
              <Button variant="ghost" className="w-full justify-start">
                <UserCircle2 className="w-4 h-4 mr-2" />
                My Page
              </Button>
            </Link>
            
            {/*로그아웃을 누르면 로그아웃되고 메인이나 로그인 페이지로 이동하도록 해야 함*/}
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>

          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-green-50 rounded-lg p-6 mb-4">
              {/* AI Message content */}
              <div className="prose">
                <h2>개선점</h2>
                <ol>
                  <li>구체적 비전 부족</li>
                  <li>리더십과 주도성 강조 부족</li>
                </ol>
                <h2>총평</h2>
                <p>
                  지원자의 열정적이고 도전적인 기업 문화에 부합하는 참신한 문제 해결 능력과 도전 정신을 잘 보여주고
                  있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto flex gap-4">
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>

            <div className="flex-1 flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send a message"
                className="min-h-[50px]"
              />
              <Button className="bg-lime-400 hover:bg-lime-500">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}