/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateInterviewQaDTO = {
    /**
     * 질문 텍스트
     */
    question: string;
    /**
     * 질문 음성 URL (선택)
     */
    questionAudio?: string;
    /**
     * 답변 텍스트 (선택)
     */
    answer?: string;
    /**
     * 답변 음성 URL (선택)
     */
    answerAudio?: string;
    /**
     * AI 분석 결과 (선택)
     */
    analysis?: string;
};

