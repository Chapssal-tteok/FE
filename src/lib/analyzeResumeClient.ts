// utils/analyzeResumeClient.ts
export async function analyzeResume(resume: string, company: string, position: string): Promise<string[]> {
  try {
    const response = await fetch('http://172.24.112.1:3000/api/analyzeResume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resume, company, position }),
    });

    if (!response.ok) {
      throw new Error('서버 응답 오류');
    }

    const data = await response.json();
    return data.feedback as string[];
  } catch (error) {
    console.error('자기소개서 분석 중 에러:', error);
    throw new Error('자기소개서 분석에 실패했습니다.');
  }
}
