/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCreateInterviewQaResultDTO } from '../models/ApiResponse/ApiResponseCreateInterviewQaResultDTO';
import type { ApiResponseInterviewQaDTO } from '../models/ApiResponse/ApiResponseInterviewQaDTO';
import type { ApiResponseString } from '../models/ApiResponse/ApiResponseString';
import type { CreateInterviewQaDTO } from '../models/DTO/CreateInterviewQaDTO';
import type { UpdateInterviewQaDTO } from '../models/DTO/UpdateInterviewQaDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InterviewQaControllerService {
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
    /**
     * 면접 질문 및 답변 수정
     * 면접 문답 ID를 통해 특정 면접 질문 및 답변을 수정합니다.
     * @param interviewId
     * @param qaId
     * @param requestBody
     * @returns ApiResponseInterviewQaDTO OK
     * @throws ApiError
     */
    public static updateInterviewQa(
        interviewId: number,
        qaId: number,
        requestBody: UpdateInterviewQaDTO,
    ): CancelablePromise<ApiResponseInterviewQaDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/interviews/{interview_id}/qas/{qa_id}',
            path: {
                'interview_id': interviewId,
                'qa_id': qaId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
