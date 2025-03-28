import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Interview {
  id: string
  company: string
  position: string
  createdAt: string
}

interface InterviewListProps {
  interviews: Interview[]
  onDelete: (selectedIds: string[]) => void
}

export function InterviewList({ interviews, onDelete }: InterviewListProps) {
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    setSelectedInterviews(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>나의 면접 기록</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {interviews.map((interview) => (
            <li key={interview.id} className="flex items-center bg-white p-4 rounded-lg shadow">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedInterviews.includes(interview.id)}
                onChange={() => toggleSelection(interview.id)}
              />
              <Link href={`/interview/${interview.id}`} className="flex-1">
                <div>
                  <h3 className="font-semibold">{interview.company}</h3>
                  <p className="text-sm text-gray-600">{interview.position}</p>
                  <p className="text-xs text-gray-500">{interview.createdAt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-right">
          <Button className="shadow bg-white text-red-600 hover:bg-red-400 hover:text-white" onClick={() => onDelete(selectedInterviews)}>
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 