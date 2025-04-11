// components/sidebar/nav-main.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from "@/components/ui/sidebar"

export interface ResumeHistory {
  id: string
  title: string
  date: string
}

export interface InterviewHistory {
  id: string
  title: string
  date: string
}

export function NavMain({
  items,
  onItemClick,
}: {
  items: {
    title: string
    icon?: LucideIcon
    isActive?: boolean
    items: ResumeHistory[] | InterviewHistory[]
  }[]
  onItemClick?: () => void
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const pathname = usePathname()
  const resume_id = pathname.includes("/chat/") ? pathname.split("/chat/")[1] : null
  const interview_id = pathname.includes("/interview/") ? pathname.split("/interview/")[1] : null

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    items.reduce((acc, item) => {
      acc[item.title] = false
      return acc
    }, {} as Record<string, boolean>)
  )

  const toggleSection = (title: string) => {
    if (onItemClick && isCollapsed) {
      onItemClick()
    }

    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title} className="mb-4">
          <SidebarMenuButton
            tooltip={item.title}
            onClick={() => toggleSection(item.title)}
            className="flex items-center h-10 px-3"
          >
            {item.icon && (
              <div className={`${isCollapsed ? "mx-auto" : "mr-3"} w-5 flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-5 h-5" />
              </div>
            )}
            {!isCollapsed && (
              <>
                <span className="truncate">{item.title}</span>
                <ChevronRight
                  className={`ml-auto transition-transform duration-200 ${openSections[item.title] ? "rotate-90" : ""}`}
                />
              </>
            )}
          </SidebarMenuButton>

          {!isCollapsed && openSections[item.title] && (
            <SidebarMenuSub>
              <div className="space-y-2 px-2 py-1">
                {item.title === "Resume" &&
                  item.items.map((resume) => (
                    <Link key={resume.id} href={`/chat/${resume.id}`}>
                      <div
                        className={`p-3 hover:bg-[#DEFFCF]/40 rounded-lg cursor-pointer ${
                          resume.id === resume_id ? "bg-[#DEFFCF] font-bold" : ""
                        }`}
                      >
                        <p className="font-medium text-sm truncate">{resume.title}</p>
                        <p className="text-xs text-gray-500">{resume.date}</p>
                      </div>
                    </Link>
                  ))}

                {item.title === "Interview" &&
                  item.items.map((interview) => (
                    <Link key={interview.id} href={`/interview/${interview.id}`}>
                      <div
                        className={`p-3 hover:bg-[#DEFFCF]/40 rounded-lg cursor-pointer ${
                          interview.id === interview_id ? "bg-[#DEFFCF] font-bold" : ""
                        }`}
                      >
                        <p className="font-medium text-sm truncate">{interview.title}</p>
                        <p className="text-xs text-gray-500">{interview.date}</p>
                      </div>
                    </Link>
                  ))}
              </div>
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
