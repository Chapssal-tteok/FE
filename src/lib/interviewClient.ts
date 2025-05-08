// lib/interviewClient.ts
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function generateInterviewQuestions(company: string, position: string, resumeContent: string): Promise<string[]> {
  const response = await fetch(`${API_URL}/api/interviewQuestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company, position, resumeContent })
  });

  if (!response.ok) {
    throw new Error('면접 질문 생성 실패');
  }

  const data = await response.json();
  return data.questions;
}

export async function analyzeAnswer(question: string, answer: string, resumeContent: string): Promise<string> {
  const response = await fetch(`${API_URL}/interview/analyzeAnswer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, resumeContent}),
  });

  if (!response.ok) {
    throw new Error('답변 분석 실패');
  }

  const data = await response.json();
  return data.analysis;
}

export async function generateFollowUpQuestions(question: string, answer: string): Promise<string[]> {
  const response = await fetch(`${API_URL}/api/interview/followUp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer }),
  });

  if (!response.ok) {
    throw new Error('후속 질문 생성 실패');
  }

  const data = await response.json();
  return data.followUps;
}
