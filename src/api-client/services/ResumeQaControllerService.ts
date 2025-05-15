/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AnalyzeResumeQaDTO } from '../models/AnalyzeResumeQaDTO';
import type { ApiResponseCreateResumeQaResultDTO } from '../models/ApiResponseCreateResumeQaResultDTO';
import type { ApiResponseListResumeQaDTO } from '../models/ApiResponseListResumeQaDTO';
import type { ApiResponseResumeQaDTO } from '../models/ApiResponseResumeQaDTO';
import type { ApiResponseString } from '../models/ApiResponseString';
import type { CreateResumeQaDTO } from '../models/CreateResumeQaDTO';
import type { UpdateResumeQaDTO } from '../models/UpdateResumeQaDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ResumeQaControllerService {
    /**
     * 자기소개서의 모든 문답 조회
     * 해당 자기소개서 ID에 속한 모든 문답을 순서대로 반환합니다.
     * @param resumeId
     * @returns ApiResponseListResumeQaDTO OK
     * @throws ApiError
     */
    public static getResumeQasByResumeId(
        resumeId: number,
    ): CancelablePromise<ApiResponseListResumeQaDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/resumes/{resume_id}/qas',
            path: {
                'resume_id': resumeId,
            },
        });
    }
    /**
     * 자기소개서 문항 및 답변 생성
     * 새로운 자기소개서 문항 및 답변을 생성합니다.
     * @param resumeId
     * @param requestBody
     * @returns ApiResponseCreateResumeQaResultDTO OK
     * @throws ApiError
     */
    public static createResumeQa(
        resumeId: number,
        requestBody: CreateResumeQaDTO,
    ): CancelablePromise<ApiResponseCreateResumeQaResultDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/resumes/{resume_id}/qas',
            path: {
                'resume_id': resumeId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 자기소개서 문항 및 답변 분석
     * 자기소개서 문항 및 답변을 기반으로 AI가 분석 결과를 반환합니다.
     * @param resumeId
     * @param qaId
     * @param requestBody
     * @returns ApiResponseResumeQaDTO OK
     * @throws ApiError
     */
    public static analyzeResumeQa(
        resumeId: number,
        qaId: number,
        requestBody: AnalyzeResumeQaDTO,
    ): CancelablePromise<ApiResponseResumeQaDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/resumes/{resume_id}/qas/{qa_id}/analyze',
            path: {
                'resume_id': resumeId,
                'qa_id': qaId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 자기소개서 문항 및 답변 삭제
     * 자기소개서 문답 ID를 통해 특정 자기소개서의 문항 및 답변을 삭제합니다.
     * @param resumeId
     * @param qaId
     * @returns ApiResponseString OK
     * @throws ApiError
     */
    public static deleteResumeQa(
        resumeId: number,
        qaId: number,
    ): CancelablePromise<ApiResponseString> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/auth/resumes/{resume_id}/qas/{qa_id}',
            path: {
                'resume_id': resumeId,
                'qa_id': qaId,
            },
        });
    }
    /**
     * 자기소개서 문항 및 답변 수정
     * 자기소개서 문답 ID를 통해 특정 자기소개서의 문항 및 답변을 수정합니다.
     * @param resumeId
     * @param qaId
     * @param requestBody
     * @returns ApiResponseResumeQaDTO OK
     * @throws ApiError
     */
    public static updateResumeQa(
        resumeId: number,
        qaId: number,
        requestBody: UpdateResumeQaDTO,
    ): CancelablePromise<ApiResponseResumeQaDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/resumes/{resume_id}/qas/{qa_id}',
            path: {
                'resume_id': resumeId,
                'qa_id': qaId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
