export const analyzeAnswerPrompt = (question: string, answer: string, resumeContent: string): string => {
  return `
질문: ${question}
답변: ${answer}
자기소개서: ${resumeContent}

위 정보를 바탕으로 다음을 분석해주세요:
1. 답변의 강점
2. 개선이 필요한 부분
3. 구체적인 개선 제안
4. 100점 만점 기준 점수

답변의 형식은 각 항목을 넘버링하고 항목마다 줄바꿈을 해주세요.
#은 사용하지 말고, 부가설명 없이 각 항목만을 출력해주세요.
점수 항목은 음성으로 입력헸을 시 어, 그, 음 등 추임새가 없을수록, 발음이 정확할수록, 문장의 완성도가 높을수록, 질문과 연관성이 높을수록, 질문에 대한 이해도가 높을수록, 개선해야 할 부분이 적을수록 더 높은 점수를 부여해주세요. 
`;
};
