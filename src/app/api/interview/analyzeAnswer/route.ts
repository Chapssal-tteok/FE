//src/app/api/interview/analyzeAnswer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/getChatResponse';
import { analyzeAnswerPrompt } from '@/lib/prompt/analyzeAnswerPrompts';

export async function POST(req: NextRequest) {
  const { question, answer, resume } = await req.json();

  if (!question || !answer || !resume) {
    return NextResponse.json({ message: '필수 값 누락' }, { status: 400 });
  }

  const prompt = analyzeAnswerPrompt(question, answer, resume);
  const response = await getChatResponse(prompt, 'sonar', 'text');

  if (!response || typeof response !== 'string') {
    return NextResponse.json({ message: '답변 분석 실패' }, { status: 500 });
  }

  return NextResponse.json({ analysis: response });
}
