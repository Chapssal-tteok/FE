// src/lib/getChatResponse.ts

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface InterviewFeedback {
  strengths: string[];
  areasForImprovement: string[];
  suggestions: string[];
  score: number;
}

export const getChatResponse = async (
  prompt: string,
  model: string = 'sonar',
  responseType: 'text' | 'json' = 'text'
): Promise<string | InterviewFeedback | string[] | null> => {
  try {
    const messages: Message[] = [
      {
        role: 'system',
        content:
          '당신은 자기소개서를 분석해 피드백을 제공하고, 면접 질문의 답변을 분석하며, 추가 질문을 제공하는 취업 컨설팅 전문가입니다. 구체적이고 실질적인 피드백을 제공해주세요.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.Pplx_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
        ...(responseType === 'json' && { response_format: 'json' }),
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity 응답 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('getChatResponse 에러:', error);
    return null;
  }
};
