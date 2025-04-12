export const generateFollowUpPrompt = (question: string, answer: string): string => {
  return `
질문: ${question}
답변: ${answer}

위 답변을 바탕으로 추가 질문 2개를 생성해주세요.
답변의 내용을 더 깊이 파악할 수 있는 질문이어야 합니다.
`;
};
