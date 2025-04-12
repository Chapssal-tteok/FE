// lib/interviewClient.ts

export async function generateInterviewQuestions(company: string, position: string, resumeContent: string): Promise<string[]> {
  const response = await fetch('http://172.24.112.1:3000/api/interviewQuestions', {
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

export async function analyzeAnswer(question: string, answer: string, resume: string): Promise<string> {
  const response = await fetch('http://172.24.112.1:3000/api/interview/analyzeAnswer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, resume }),
  });

  if (!response.ok) {
    throw new Error('답변 분석 실패');
  }

  const data = await response.json();
  return data.analysis;
}

export async function generateFollowUpQuestions(question: string, answer: string): Promise<string[]> {
  const response = await fetch('http://172.24.112.1:3000/api/interview/followUp', {
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
