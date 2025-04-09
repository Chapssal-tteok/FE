"use client"

import type * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, MessageSquare } from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar"

// 샘플 데이터
const resumeHistory = [
  {
    id: "1",
    title: "Software Engineer Resume",
    date: "2023-04-15",
  },
  {
    id: "2",
    title: "Product Manager Resume with Very Long Title That Should Truncate",
    date: "2023-04-10",
  },
  {
    id: "3",
    title: "Data Scientist Resume",
    date: "2023-04-05",
  },
]

const interviewHistory = [
  {
    id: "4",
    title: "Frontend Developer Interview",
    date: "2023-04-12",
  },
  {
    id: "5",
    title: "Backend Developer Interview with Extra Long Title for Testing Truncation",
    date: "2023-04-08",
  },
  {
    id: "6",
    title: "System Design Interview",
    date: "2023-04-03",
  },
]

// 간소화된 데이터 구조
const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Resume",
      url: "/chat",
      icon: BookOpen,
      isActive: true,
      items: resumeHistory,
    },
    {
      title: "Interview",
      url: "/interview",
      icon: MessageSquare,
      items: interviewHistory,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

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
                className="w-10 h-10 mx-auto flex items-center justify-center rounded-full border-white"
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
