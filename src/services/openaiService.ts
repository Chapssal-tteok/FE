// src/services/openaiService.ts
/* import OpenAI from 'openai'

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface InterviewFeedback {
  strengths: string[]
  areasForImprovement: string[]
  suggestions: string[]
  score: number
}

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// 자기소개서 분석
export async function analyzeResume(resume: string, company: string, position: string) {

  try {
    const prompt = `
      다음은 ${company}의 ${position} 직무에 지원한 자기소개서입니다.

      ${resume}

      **사용자가 제출한 자기소개서의 문항과 답변을 분석하여, 지원한 기업과 직무에 적합하도록 개선할 수 있는 구체적인 피드백을 제시하세요.**

      - 기업의 채용공고를 분석하여 사용자의 답변에 필요한 요소가 포함되었는지 확인하고, 부족한 부분을 보완할 방안을 제안합니다.
      - 답변의 좋은 점과 아쉬운 점을 구분하여 평가하고, 아쉬운 점에 대해서는 개선 이유와 구체적인 수정 예문을 제공합니다.
      - 피드백은 긍정적이고 친절한 어투로 작성하며, 모든 문장의 끝맺음을 "~요"로 맞춥니다.
      - 검토 대상은 논리적인 흐름, 구체적인 사례와 경험, 표현의 명확성과 전문성, 문법 및 어휘의 네 가지 영역으로 나눕니다.
      - 피드백을 통해 지원자가 자기소개서를 발전시킬 수 있도록 도움을 주세요.

    **Output Format**

    1. 답변의 좋은 점
        - 사용자가 잘 작성한 부분들을 구체적으로 언급하고, 이를 강조하여 어떻게 유지하거나 더 활용할 수 있을지 설명해주세요.
    2. 답변의 아쉬운 점
        - 아쉬운 부분들을 넘버링해서 구체적으로 지적하고, 각각 부분의 개선이 필요한 이유와 함께 수정된 문장 예시를 제시하세요.
    3. 제안 및 구체적인 수정 예문
        - 필요 시 더 나은 표현이나 구조를 적용한 예문을 제공합니다.

    **Steps**

    1. 논리적인 흐름 검토
        - 답변이 자연스럽고 설득력 있게 이어지는지 확인하고, 논리의 비약이 발생하는 부분을 알려주세요.
    2. 구체적인 사례 추가 제안
        - 답변에 구체적인 경험과 사례가 부족할 경우, 어떤 내용을 추가하면 좋을지 제안해주세요.
    3. 표현력 및 전문성 강화
        - 사용자의 답변이 직무와 기업 요구사항에 적합하도록 표현을 다듬고, 더 전문적인 용어 사용을 권장해주세요.
    4. 문법과 어휘 검토
        - 맞춤법 오류나 문장의 자연스러운 흐름을 방해하는 부분을 수정하여 제안해주고, 추상적인 표현을 구체적인 언어로 수정해주세요.
    5. 체크리스트 평가
        - 자기소개서가 다음의 항목을 충족하고 있는지 평가하고 피드백해주세요.
          1. '질문에 대한 답'을 하고 있는가?
          2. 결론이 '근거'를 가지고 있는가? (숫자, 객관적 평가, 결과물)
          3. 소제목 또는 첫 줄이 [HOW+RESULT]을 요약/압축하고 있는가?
          4. 말하고자 하는 바가 '서두'에 배치되어 있는가?
          5. 근거가 직무/산업/직장과 '연결'되어 있는가?
          6. 한 개의 사례에서 '한 개의 메세지'를 말하고 있는가?
          7. 문장이 최대한 '짧은 형식'을 취하고 있는가?

    **Examples**
          
    - Input:
        회사명: 삼성전자
        지원 직무: SW개발
        문항: "본인의 장점에 대해 작성해주세요."
        답변: "[책임감으로 팀원들을 이끌다] 저는 책임감이 강한 사람입니다. 다양한 팀 프로젝트에서 주어진 역할을 충실히 수행했으며, 다른 사람들과 조화를 이루는 것을 중요하게 생각합니다."
          
    - Output:    
        이 부분은 좋아요!        
            1. "책임감"이라는 키워드와 "팀 프로젝트"라는 구체적인 상황을 제시한 점이 좋아요. 이는 협업을 중시하는 기업 문화와 잘 맞아 보이네요.    
        이 부분은 아쉬워요!        
            1. "다른 사람들과 조화를 이루는 것을 중요하게 생각합니다"라는 문장이 다소 일반적이에요. 구체적인 사례를 추가하면 더 설득력이 있을 것 같아요.        
            2. "팀 프로젝트에서 주어진 역할을 충실히 수행"했다는 문장을 더 구체적으로 어떤 역할을 수행했는지, 프로젝트에 얼마나 기여했는지 구체적인 수치와 함께 제시하면 전문성을 높일 수 있어요.        
            3. "다양한 팀 프로젝트"와 같이 애매한 표현 대신 구체적인 근거나 수치를 사용하면 좋아요.         
            4. "[책임감으로 팀원들을 이끌다]"라는 소제목은 다소 모호해보여요.    
        개선된 문장 예시    
            "[팀 리더로 프로젝트 성공을 이끌다] 
            저는 책임감이 강한 사람입니다. 예를 들어, 대학 시절 진행한 캡스톤 디자인 팀 프로젝트에서 팀 리더 역할을 맡아 프로젝트 일정 관리와 팀원 간 조율을 성공적으로 수행했습니다. 
            그 결과, 프로젝트를 계획보다 2주 앞당겨 완성하고, 우수 팀으로 선정된 경험이 있습니다. 또한, 팀원 간 의견 충돌이 발생했을 때, 중재자로서 문제를 해결하며 원활한 협업 분위기를 유지한 경험도 있습니다. 
            이러한 경험은 협업과 책임감을 중시하는 저의 강점을 잘 보여준다고 생각합니다."
          
    **Notes**

    - 사용자가 기업과 직무에 적합한 자기소개서를 작성하도록, 피드백을 통해 긍정적인 변화를 유도하세요.
    - 각 답변에 대해 구체적으로 수정이 필요한 이유를 명확히 설명하고, 이를 보완할 수 있는 방법을 제안하세요.
    - "사용자가 친절하다고 느낄 수 있는 어투"를 유지하며, 피드백의 긍정적인 요소를 강조해주세요.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "당신은 자기소개서 분석 전문가입니다. 구체적이고 실질적인 피드백을 제공해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API 에러:', error);
    throw new Error('자기소개서 분석 중 오류가 발생했습니다.');
  }
}

// 채팅 응답
export const getChatResponse = async (
  prompt: string,
  model: string = 'gpt-4',
  responseType: 'text' | 'json' = 'text'
): Promise<string | InterviewFeedback | string[] | null> => {
  try {
    const messages: Message[] = [
      {
        role: 'system',
        content: '당신은 자기소개서를 분석해 피드백을 제공하고, 면접 질문의 답변을 분석하며, 추가 질문을 제공하는 취업 컨설팅 전문가입니다. 구체적이고 실질적인 피드백을 제공해주세요.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: responseType },
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting chat response:', error);
    return null;
  }
}; */