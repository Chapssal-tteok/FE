export const analyzeAnswerPrompt = (question: string, answer: string, resumeContent: string): string => {
  return `
질문: ${question}
답변: ${answer}
자기소개서 내용: ${resumeContent}

위 정보를 바탕으로 다음을 분석해주세요:
1. 답변의 강점
2. 개선이 필요한 부분
3. 구체적인 개선 제안
4. 100점 만점 기준 점수
`;
};
