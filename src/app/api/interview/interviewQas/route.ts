// src/app/api/interview/interviewQas/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQasPrompt } from '@/lib/prompt/interviewQasPrompts';
import { getChatResponse } from '@/lib/getChatResponse';

export async function POST(req: NextRequest) {
  const { company, position, resumeContent } = await req.json();
  if (!company || !position || !resumeContent) {
    return NextResponse.json({ message: '필수 입력 누락' }, { status: 400 });
  }

  const pplxContent = `${company} - ${position}`;
  const prompt = generateInterviewQasPrompt(pplxContent, resumeContent);
  const result = await getChatResponse(prompt, 'sonar', 'text');

  if (!result || typeof result !== 'string') {
    return NextResponse.json({ message: '질문 생성 실패' }, { status: 500 });
  }

  const questions = result.split('\n').filter(Boolean);
  return NextResponse.json({ questions });
}
