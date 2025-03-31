import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

interface Message {
  role: string;
  content: string;
}

// 개발 환경 감지
const isDevelopment = process.env.NODE_ENV === 'development'

// OpenAI 클라이언트 초기화 (개발 환경에서는 사용하지 않음)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// })

// 자기소개서 분석
export async function analyzeResume(resume: string, company: string, position: string) {
  if (isDevelopment) {
    return `[개발 환경 샘플 응답]
      
이 부분은 좋아요!
1. 자기소개서의 전반적인 구조가 잘 잡혀있어요.
2. 지원 직무와 관련된 경험을 잘 설명했어요.
      
이 부분은 아쉬워요!
1. 구체적인 수치나 성과가 부족해요.
2. 문제 해결 과정에 대한 설명이 더 필요해요.
      
개선된 문장 예시
"[프로젝트 성공으로 성장한 개발자]
저는 ${company}의 ${position} 직무에 적합한 개발자입니다. 
캡스톤 디자인 프로젝트에서 프론트엔드 개발을 담당하여 사용자 경험을 30% 개선했고, 팀원들과 협업하여 프로젝트를 성공적으로 완료했습니다."`
  }

  try {
    // const prompt = `
    //   다음은 ${company}의 ${position} 직무에 지원한 자기소개서입니다.
    //   ... (기존 프롬프트 내용)
    // `

    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [
    //     {
    //       role: "system",
    //       content: "당신은 자기소개서 분석 전문가입니다. 구체적이고 실질적인 피드백을 제공해주세요."
    //     },
    //     {
    //       role: "user",
    //       content: prompt
    //     }
    //   ],
    //   temperature: 0.7,
    //   max_tokens: 2048
    // })

    // return completion.choices[0].message.content;
    return "실제 API 호출은 개발 환경에서 비활성화되어 있습니다."
  } catch (error) {
    console.error('OpenAI API 에러:', error);
    throw new Error('자기소개서 분석 중 오류가 발생했습니다.');
  }
}

// 채팅 응답
export async function getChatResponse(message: string, conversationHistory: Message[], resume: string) {
  if (isDevelopment) {
    return `[개발 환경 샘플 응답]
      
안녕하세요! 자기소개서 분석을 도와드리겠습니다.
      
현재 자기소개서를 검토해보니 다음과 같은 부분들을 개선하면 좋을 것 같습니다:
      
1. 구체적인 성과와 수치를 추가하면 좋을 것 같아요.
2. 문제 해결 과정을 더 자세히 설명해주세요.
3. 지원 직무와의 연관성을 더 강조해주세요.
      
추가적인 질문이 있으시다면 언제든 물어보세요!`
  }

  try {
    // const messages: ChatCompletionMessageParam[] = [
    //   {
    //     role: "system",
    //     content: `당신은 자기소개서 분석 전문가입니다. 다음 자기소개서에 대해 답변해주세요:
    //     ${resume}`
    //   },
    //   ...conversationHistory.map(msg => ({
    //     role: msg.role.toLowerCase() as "user" | "assistant",
    //     content: msg.content
    //   })),
    //   {
    //     role: "user",
    //     content: message
    //   }
    // ]

    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages,
    //   temperature: 0.7,
    //   max_tokens: 2048
    // })

    // return completion.choices[0].message.content;
    return "실제 API 호출은 개발 환경에서 비활성화되어 있습니다."
  } catch (error) {
    console.error('OpenAI API 에러:', error);
    throw new Error('채팅 응답 생성 중 오류가 발생했습니다.');
  }
} 