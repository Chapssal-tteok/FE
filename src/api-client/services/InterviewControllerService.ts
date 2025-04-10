/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCreateInterviewResultDTO } from '../models/ApiResponseCreateInterviewResultDTO';
import type { ApiResponseInterviewDTO } from '../models/ApiResponseInterviewDTO';
import type { ApiResponseString } from '../models/ApiResponseString';
import type { CreateInterviewDTO } from '../models/CreateInterviewDTO';
import type { UpdateInterviewDTO } from '../models/UpdateInterviewDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InterviewControllerService {
    /**
     * 면접 생성
     * 새로운 면접을 생성합니다.
     * @param requestBody
     * @returns ApiResponseCreateInterviewResultDTO OK
     * @throws ApiError
     */
    public static createInterview(
        requestBody: CreateInterviewDTO,
    ): CancelablePromise<ApiResponseCreateInterviewResultDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/interviews',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 면접 조회
     * 면접 ID를 통해 특정 면접을 조회합니다.
     * @param interviewId
     * @returns ApiResponseInterviewDTO OK
     * @throws ApiError
     */
    public static getInterview(
        interviewId: number,
    ): CancelablePromise<ApiResponseInterviewDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/interviews/{interview_id}',
            path: {
                'interview_id': interviewId,
            },
        });
    }
    /**
     * 면접 삭제
     * 면접 ID를 통해 특정 면접을 삭제합니다.
     * @param interviewId
     * @returns ApiResponseString OK
     * @throws ApiError
     */
    public static deleteInterview(
        interviewId: number,
    ): CancelablePromise<ApiResponseString> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/auth/interviews/{interview_id}',
            path: {
                'interview_id': interviewId,
            },
        });
    }
    /**
     * 면접 수정
     * 면접 ID를 통해 특정 면접을 수정합니다.
     * @param interviewId
     * @param requestBody
     * @returns ApiResponseInterviewDTO OK
     * @throws ApiError
     */
    public static updateInterview(
        interviewId: number,
        requestBody: UpdateInterviewDTO,
    ): CancelablePromise<ApiResponseInterviewDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/interviews/{interview_id}',
            path: {
                'interview_id': interviewId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
