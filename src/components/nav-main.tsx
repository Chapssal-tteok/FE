"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, useSidebar } from "@/components/ui/sidebar"

export function NavMain({
  items,
  onItemClick,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      id: string
      title: string
      date: string
    }[]
  }[]
  onItemClick?: () => void
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // 각 섹션의 열림/닫힘 상태를 관리하는 상태 추가
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    // 초기 상태 설정 - 기본적으로 모든 섹션 닫힘
    items.reduce(
      (acc, item) => {
        acc[item.title] = false // 모든 섹션 기본적으로 닫힘
        return acc
      },
      {} as Record<string, boolean>,
    ),
  )

  // 현재 선택된 아이템 ID (실제로는 URL 파라미터 등에서 가져와야 함)
  const resume_id = "1" // 예시로 첫 번째 아이템을 선택된 상태로 설정

  // 섹션 토글 함수
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

          {/* 아이템 목록 - 열림/닫힘 상태에 따라 표시 */}
          {item.items && openSections[item.title] && !isCollapsed && (
            <SidebarMenuSub>
              <div className="space-y-2 px-2 py-1">
                {item.items.map((history) => (
                  <Link key={history.id} href={`/chat/${resume_id}`}>
                    <div
                      className={`p-3 hover:bg-[#DEFFCF]/40 rounded-lg cursor-pointer ${
                        history.id === resume_id ? "bg-[#DEFFCF] font-bold" : ""
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{history.title}</p>
                      <p className="text-xs text-gray-500">{history.date}</p>
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
