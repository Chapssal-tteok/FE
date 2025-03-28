import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Resume {
  id: string
  company: string
  position: string
  createdAt: string
}

interface ResumeListProps {
  resumes: Resume[]
  onDelete: (selectedIds: string[]) => void
}

export function ResumeList({ resumes, onDelete }: ResumeListProps) {
  const [selectedResumes, setSelectedResumes] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    setSelectedResumes(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>나의 자기소개서</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {resumes.map((resume) => (
            <li key={resume.id} className="flex items-center bg-white p-4 rounded-lg shadow">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedResumes.includes(resume.id)}
                onChange={() => toggleSelection(resume.id)}
              />
              <Link href={`/resume/${resume.id}`} className="flex-1">
                <div>
                  <h3 className="font-semibold">{resume.company}</h3>
                  <p className="text-sm text-gray-600">{resume.position}</p>
                  <p className="text-xs text-gray-500">{resume.createdAt}</p>
                </div>
              </Link>
              <Link href={`/chat/${resume.id}`}>
                <Button variant="outline" className="text-lime-500">피드백 받기</Button>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-right space-x-2">
          <Link href="/writeResume">
            <Button className="shadow bg-white text-lime-500 hover:bg-lime-400 hover:text-white">새 자기소개서 작성</Button>
          </Link>
          <Button className="shadow bg-white text-red-600 hover:bg-red-400 hover:text-white" onClick={() => onDelete(selectedResumes)}>
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 