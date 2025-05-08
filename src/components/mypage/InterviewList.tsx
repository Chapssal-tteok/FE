import { useState, useCallback, memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface Interview {
  interviewId: string
  title: string
  company: string
  position: string
  createdAt: string
  updatedAt: string
}

interface InterviewItemProps {
  interview: Interview
  isSelected: boolean
  onToggle: (id: string) => void
}

const InterviewItem = memo(function InterviewItem({ 
  interview, 
  isSelected, 
  onToggle 
}: InterviewItemProps) {
  return (
    <li 
      className="flex items-center bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
      role="listitem"
    >
      <Checkbox
        id={`interview-${interview.interviewId}`}
        checked={isSelected}
        onCheckedChange={() => onToggle(interview.interviewId)}
        aria-label={`${interview.title} 면접 선택`}
      />
      <Link 
        href={`/interview/${interview.interviewId}`} 
        className="flex-1 ml-4 hover:text-lime-600 transition-colors"
        aria-label={`${interview.title} 면접 상세 보기`}
      >
        <div>
          <h3 className="font-semibold">{interview.title}</h3>
          <p className="text-sm text-gray-600">{interview.company} {interview.position}</p>
          <p className="text-xs text-gray-500">
            생성일: {format(new Date(interview.createdAt), "PPP", { locale: ko })}
          </p>
          <p className="text-xs text-gray-500">
            최근 수정일: {format(new Date(interview.updatedAt), "PPP", { locale: ko })}
          </p>
        </div>
      </Link>
    </li>
  )
})

interface InterviewListProps {
  interviews: Interview[]
  onDelete: (selectedIds: string[]) => void
}

export function InterviewList({ interviews, onDelete }: InterviewListProps) {
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([])

  const toggleSelection = useCallback((id: string) => {
    setSelectedInterviews(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }, [])

  const handleDelete = useCallback(() => {
    if (selectedInterviews.length === 0) return
    onDelete(selectedInterviews)
    setSelectedInterviews([])
  }, [selectedInterviews, onDelete])

  if (interviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>나의 면접 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">등록된 면접 기록이 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>나의 면접 기록</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2" role="list">
          {interviews.map((interview) => (
            <InterviewItem
              key={interview.interviewId}
              interview={interview}
              isSelected={selectedInterviews.includes(interview.interviewId)}
              onToggle={toggleSelection}
            />
          ))}
        </ul>

        <div className="mt-8 text-right">
          <Button
            onClick={handleDelete}
            disabled={selectedInterviews.length === 0}
            className={cn(
              "shadow bg-white text-red-600 hover:bg-red-400 hover:text-white",
              selectedInterviews.length === 0 && "opacity-50 cursor-not-allowed"
            )}
            aria-label={`선택된 ${selectedInterviews.length}개의 면접 기록 삭제`}
          >
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 