// src/app/api/analyzeResume/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateResumeAnalysisPrompt } from '@/lib/prompt/resumeAnalyzePrompts';
import { getChatResponse } from '@/lib/getChatResponse';

export async function POST(req: NextRequest) {
  const { resume, company, position } = await req.json();

  if (!resume || !company || !position) {
    return NextResponse.json({ message: '필수 데이터 누락' }, { status: 400 });
  }

  const prompt = generateResumeAnalysisPrompt(resume, company, position);

  const response = await getChatResponse(prompt, 'sonar', 'text');

  if (!response || typeof response !== 'string') {
    return NextResponse.json({ message: '분석 실패' }, { status: 500 });
  }

  const feedback = response.split('\n').filter(Boolean);

  return NextResponse.json({ feedback });
}