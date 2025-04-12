// src/app/api/interview/followUp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/getChatResponse';
import { generateFollowUpPrompt } from '@/lib/prompt/followUpPrompts';

export async function POST(req: NextRequest) {
  const { question, answer } = await req.json();

  if (!question || !answer) {
    return NextResponse.json({ message: '필수 값 누락' }, { status: 400 });
  }

  const prompt = generateFollowUpPrompt(question, answer);
  const response = await getChatResponse(prompt, 'sonar', 'text');

  if (!response || typeof response !== 'string') {
    return NextResponse.json({ message: '후속 질문 생성 실패' }, { status: 500 });
  }

  const followUps = response.split('\n').filter(Boolean);
  return NextResponse.json({ followUps });
}
