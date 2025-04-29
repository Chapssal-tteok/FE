import { useState, useCallback, memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface Resume {
  resumeId: string
  company: string
  position: string
  createdAt: string
}

interface ResumeItemProps {
  resume: Resume
  isSelected: boolean
  onToggle: (id: string) => void
}

const ResumeItem = memo(function ResumeItem({ 
  resume, 
  isSelected, 
  onToggle 
}: ResumeItemProps) {
  return (
    <li 
      className="flex items-center bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
      role="listitem"
    >
      <Checkbox
        id={`resume-${resume.resumeId}`}
        checked={isSelected}
        onCheckedChange={() => onToggle(resume.resumeId)}
        aria-label={`${resume.title} 자기소개서 선택`}
      />
      <div className="flex-1 ml-4">
        <Link 
          href={`/resume/${resume.resumeId}`}
          className="block hover:text-lime-600 transition-colors"
          aria-label={`${resume.title} 자기소개서 상세 보기`}
        >
          <h3 className="font-semibold">{resume.company}</h3>
          <p className="text-sm text-gray-600">{resume.position}</p>
          <p className="text-xs text-gray-500">
            {format(new Date(resume.createdAt), "PPP", { locale: ko })}
            {format(new Date(resume.updatedAt), "PPP", { locale: ko })}
          </p>
        </Link>
      </div>
      <Link 
        href={`/chat/${resume.resumeId}`}
        className="ml-4"
        aria-label={`${resume.title} 자기소개서 피드백 받기`}
      >
        <Button variant="outline" className="text-lime-500 hover:text-lime-600">
          피드백 받기
        </Button>
      </Link>
    </li>
  )
})

interface ResumeListProps {
  resumes: Resume[]
  onDelete: (selectedIds: string[]) => void
}

export function ResumeList({ resumes, onDelete }: ResumeListProps) {
  const [selectedResumes, setSelectedResumes] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelection = useCallback((id: string) => {
    setSelectedResumes(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }, [])

  const handleDelete = useCallback(async () => {
    if (selectedResumes.length === 0) return
    try {
      setIsDeleting(true)
      await onDelete(selectedResumes)
      setSelectedResumes([])
    } catch (error) {
      console.error("Failed to delete resumes:", error)
    } finally {
      setIsDeleting(false)
    }
  }, [selectedResumes, onDelete])

  if (resumes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>나의 자기소개서</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">등록된 자기소개서가 없습니다.</p>
          <div className="text-center">
            <Link href="/writeResume">
              <Button className="shadow bg-white text-lime-500 hover:bg-lime-400 hover:text-white">
                새 자기소개서 작성
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>나의 자기소개서</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2" role="list">
          {resumes.map((resume) => (
            <ResumeItem
              key={resume.resumeId}
              resume={resume}
              isSelected={selectedResumes.includes(resume.resumeId)}
              onToggle={toggleSelection}
            />
          ))}
        </ul>

        <div className="mt-8 flex justify-end gap-2">
          <Link href="/writeResume">
            <Button className="shadow bg-white text-lime-500 hover:bg-lime-400 hover:text-white">
              새 자기소개서 작성
            </Button>
          </Link>
          <Button
            onClick={handleDelete}
            disabled={selectedResumes.length === 0 || isDeleting}
            className={cn(
              "shadow bg-white text-red-600 hover:bg-red-400 hover:text-white",
              (selectedResumes.length === 0 || isDeleting) && "opacity-50 cursor-not-allowed"
            )}
            aria-label={`선택된 ${selectedResumes.length}개의 자기소개서 삭제`}
            aria-busy={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 