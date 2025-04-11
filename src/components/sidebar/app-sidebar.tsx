// conponents/sidebar/app-sidebar.tsx
"use client"

import type * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, MessageSquare } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { UserControllerService } from "@/api-client"
import type { ResumeHistory, InterviewHistory } from "./nav-main"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar"

// 샘플 데이터
// const resumeHistory = [
//   {
//     id: "1",
//     title: "Software Engineer Resume",
//     date: "2023-04-15",
//   },
//   {
//     id: "2",
//     title: "Product Manager Resume with Very Long Title That Should Truncate",
//     date: "2023-04-10",
//   },
//   {
//     id: "3",
//     title: "Data Scientist Resume",
//     date: "2023-04-05",
//   },
// ]

// const interviewHistory = [
//   {
//     id: "4",
//     title: "Frontend Developer Interview",
//     date: "2023-04-12",
//   },
//   {
//     id: "5",
//     title: "Backend Developer Interview with Extra Long Title for Testing Truncation",
//     date: "2023-04-08",
//   },
//   {
//     id: "6",
//     title: "System Design Interview",
//     date: "2023-04-03",
//   },
// ]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen, toggleSidebar } = useSidebar()
  const { data: session } = useSession()
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
      name: session?.user?.name || "Guest",
      email: session?.user?.email || "guest@example.com",
      avatar: session?.user?.image || "/avatars/default.jpg",
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
