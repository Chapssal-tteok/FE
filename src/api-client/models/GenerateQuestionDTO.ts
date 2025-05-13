/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GenerateQuestionDTO = {
    /**
     * 회사명
     */
    company: string;
    /**
     * 직무명
     */
    position: string;
    /**
     * 자기소개서 전체 본문 텍스트
     */
    resumeContent: string;
    /**
     * 음성 모드: TEXT or VOICE
     */
    mode?: GenerateQuestionDTO.mode;
};
export namespace GenerateQuestionDTO {
    /**
     * 음성 모드: TEXT or VOICE
     */
    export enum mode {
        TEXT = 'TEXT',
        VOICE = 'VOICE',
    }
}

