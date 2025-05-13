/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AnalyzeAnswerDTO } from '../models/AnalyzeAnswerDTO';
import type { ApiResponseCreateInterviewQaResultDTO } from '../models/ApiResponseCreateInterviewQaResultDTO';
import type { ApiResponseInterviewQaDTO } from '../models/ApiResponseInterviewQaDTO';
import type { ApiResponseListInterviewQaDTO } from '../models/ApiResponseListInterviewQaDTO';
import type { ApiResponseString } from '../models/ApiResponseString';
import type { CreateInterviewQaDTO } from '../models/CreateInterviewQaDTO';
import type { GenerateFollowUpDTO } from '../models/GenerateFollowUpDTO';
import type { GenerateQuestionDTO } from '../models/GenerateQuestionDTO';
import type { UpdateAnalysisDTO } from '../models/UpdateAnalysisDTO';
import type { UpdateAnswerDTO } from '../models/UpdateAnswerDTO';
import type { UpdateQuestionDTO } from '../models/UpdateQuestionDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InterviewQaControllerService {
    /**
     * 면접의 모든 문답 조회
     * 해당 면접 ID에 속한 모든 문답을 순서대로 반환합니다.
     * @param interviewId
     * @returns ApiResponseListInterviewQaDTO OK
     * @throws ApiError
     */
    public static getInterviewQasByInterviewId(
        interviewId: number,
    ): CancelablePromise<ApiResponseListInterviewQaDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/interviews/{interview_id}/qas',
            path: {
                'interview_id': interviewId,
            },
        });
    }
    /**
     * 면접 질문 및 답변 생성
     * 새로운 면접 질문 및 답변을 생성합니다.
     * @param interviewId
     * @param requestBody
     * @returns ApiResponseCreateInterviewQaResultDTO OK
     * @throws ApiError
     */
    public static createInterviewQa(
        interviewId: number,
        requestBody: CreateInterviewQaDTO,
    ): CancelablePromise<ApiResponseCreateInterviewQaResultDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/interviews/{interview_id}/qas',
            path: {
                'interview_id': interviewId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * AI 면접 답변 분석
     * 질문, 답변, 자기소개서를 기반으로 AI가 분석 결과를 반환합니다.
     * @param interviewId
     * @param qaId
     * @param requestBody
     * @returns ApiResponseInterviewQaDTO OK
     * @throws ApiError
     */
    public static analyzeAnswer(
        interviewId: number,
        qaId: number,
        requestBody: AnalyzeAnswerDTO,
    ): CancelablePromise<ApiResponseInterviewQaDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/interviews/{interview_id}/qas/{qa_id}/analyze',
            path: {
                'interview_id': interviewId,
                'qa_id': qaId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * AI 면접 질문 생성
     * 자기소개서와 회사/직무 정보를 바탕으로 AI가 면접 질문을 생성합니다.
     * @param interviewId
     * @param requestBody
     * @returns ApiResponseCreateInterviewQaResultDTO OK
     * @throws ApiError
     */
    public static generateInterviewQuestion(
        interviewId: number,
        requestBody: GenerateQuestionDTO,
    ): CancelablePromise<ApiResponseCreateInterviewQaResultDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/interviews/{interview_id}/qas/generate',
            path: {
                'interview_id': interviewId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * AI 추가 면접 질문 생성
     * 기존 문답을 기반으로 follow-up 질문을 AI가 생성하고 저장합니다.
     * @param interviewId
     * @param requestBody
     * @returns ApiResponseCreateInterviewQaResultDTO OK
     * @throws ApiError
     */
    public static generateFollowUp(
        interviewId: number,
        requestBody: GenerateFollowUpDTO,
    ): CancelablePromise<ApiResponseCreateInterviewQaResultDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/interviews/{interview_id}/qas/follow-up',
            path: {
                'interview_id': interviewId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 면접 질문 수정
     * 면접 문답 ID를 통해 질문을 수정하고, 답변과 분석 내용을 초기화합니다.
     * @param interviewId
     * @param qaId
     * @param requestBody
     * @returns ApiResponseInterviewQaDTO OK
     * @throws ApiError
     */
    public static updateQuestion(
        interviewId: number,
        qaId: number,
        requestBody: UpdateQuestionDTO,
    ): CancelablePromise<ApiResponseInterviewQaDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/interviews/{interview_id}/qas/{qa_id}/question',
            path: {
                'interview_id': interviewId,
                'qa_id': qaId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 면접 답변 수정
     * 면접 문답 ID를 통해 답변을 수정하고, 분석 내용을 초기화합니다.
     * @param interviewId
     * @param qaId
     * @param requestBody
     * @returns ApiResponseInterviewQaDTO OK
     * @throws ApiError
     */
    public static updateAnswer(
        interviewId: number,
        qaId: number,
        requestBody: UpdateAnswerDTO,
    ): CancelablePromise<ApiResponseInterviewQaDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/interviews/{interview_id}/qas/{qa_id}/answer',
            path: {
                'interview_id': interviewId,
                'qa_id': qaId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 면접 분석 수정
     * 면접 문답 ID를 통해 분석 내용을 수정합니다.
     * @param interviewId
     * @param qaId
     * @param requestBody
     * @returns ApiResponseInterviewQaDTO OK
     * @throws ApiError
     */
    public static updateAnalysis(
        interviewId: number,
        qaId: number,
        requestBody: UpdateAnalysisDTO,
    ): CancelablePromise<ApiResponseInterviewQaDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/interviews/{interview_id}/qas/{qa_id}/analysis',
            path: {
                'interview_id': interviewId,
                'qa_id': qaId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 면접 질문 및 답변 삭제
     * 면접 문답 ID를 통해 특정 면접 질문 및 답변을 삭제합니다.
     * @param interviewId
     * @param qaId
     * @returns ApiResponseString OK
     * @throws ApiError
     */
    public static deleteInterviewQa(
        interviewId: number,
        qaId: number,
    ): CancelablePromise<ApiResponseString> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/auth/interviews/{interview_id}/qas/{qa_id}',
            path: {
                'interview_id': interviewId,
                'qa_id': qaId,
            },
        });
    }
}
