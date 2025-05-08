// conponents/sidebar/app-sidebar.tsx
"use client"

import type * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, MessageSquare } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { UserControllerService } from "@/api-client"
import type { ResumeHistory, InterviewHistory } from "./nav-main"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen } = useSidebar()
  const { user } = useAuth()
  const isCollapsed = state === "collapsed"
  const [resumeHistory, setResumeHistory] = useState<ResumeHistory[]>([])
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistory[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumeRes = await UserControllerService.getMyResumes()
        const interviewRes = await UserControllerService.getMyInterviews()

        setResumeHistory(
          (resumeRes.result || []).map((item) => ({
            id: String(item.resumeId),
            title: item.title || `${item.company}/${item.position}`,
            date: new Date(item.createdAt ?? "").toLocaleDateString(),
          }))
        )

        setInterviewHistory(
          (interviewRes.result || []).map((item) => ({
            id: String(item.interviewId),
            title: item.title || `${item.company}/${item.position}`,
            date: new Date(item.createdAt ?? "").toLocaleDateString(),
          }))
        )
      } catch (error) {
        console.error("Error fetching sidebar data", error)
      }
    }

    fetchData()
  }, [])

  const data = {
    user: {
      id: user?.username || "Guest",
      email: user?.email || "guest@example.com",
    },
    navMain: [
      {
        title: "Resume",
        icon: BookOpen,
        isActive: true,
        items: resumeHistory,
      },
      {
        title: "Interview",
        icon: MessageSquare,
        items: interviewHistory,
      },
    ],
  }

  // 사이드바를 확장하는 함수
  const expandSidebar = () => {
    if (isCollapsed) {
      setOpen(true) // 사이드바 열기
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4">
        <div className="px-3 mb-2">
          <Link href="/writeResume" className="w-full block">
            {isCollapsed ? (
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 mx-auto flex items-center justify-center rounded-full border-white hover:bg-light-green/20"
              >
                <Plus className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="default"
                className="w-full flex items-center justify-start gap-3 h-10 px-4"
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                <span>New Resume</span>
              </Button>
            )}
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} onItemClick={expandSidebar} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
