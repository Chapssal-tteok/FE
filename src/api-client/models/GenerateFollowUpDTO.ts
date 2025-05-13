/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GenerateFollowUpDTO = {
    /**
     * 기존 질문
     */
    question: string;
    /**
     * 기존 답변
     */
    answer: string;
    /**
     * 음성 모드: TEXT or VOICE
     */
    mode?: GenerateFollowUpDTO.mode;
};
export namespace GenerateFollowUpDTO {
    /**
     * 음성 모드: TEXT or VOICE
     */
    export enum mode {
        TEXT = 'TEXT',
        VOICE = 'VOICE',
    }
}

