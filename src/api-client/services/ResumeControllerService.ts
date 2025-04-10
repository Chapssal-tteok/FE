/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCreateResumeResultDTO } from '../models/ApiResponseCreateResumeResultDTO';
import type { ApiResponseResumeDTO } from '../models/ApiResponseResumeDTO';
import type { ApiResponseString } from '../models/ApiResponseString';
import type { CreateResumeDTO } from '../models/CreateResumeDTO';
import type { UpdateResumeDTO } from '../models/UpdateResumeDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ResumeControllerService {
    /**
     * 자기소개서 생성
     * 새로운 자기소개서를 생성합니다.
     * @param requestBody
     * @returns ApiResponseCreateResumeResultDTO OK
     * @throws ApiError
     */
    public static createResume(
        requestBody: CreateResumeDTO,
    ): CancelablePromise<ApiResponseCreateResumeResultDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/resumes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 자기소개서 조회
     * 자기소개서 ID를 통해 특정 자기소개서를 조회합니다.
     * @param resumeId
     * @returns ApiResponseResumeDTO OK
     * @throws ApiError
     */
    public static getResume(
        resumeId: number,
    ): CancelablePromise<ApiResponseResumeDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/resumes/{resume_id}',
            path: {
                'resume_id': resumeId,
            },
        });
    }
    /**
     * 자기소개서 삭제
     * 자기소개서 ID를 통해 특정 자기소개서를 삭제합니다.
     * @param resumeId
     * @returns ApiResponseString OK
     * @throws ApiError
     */
    public static deleteResume(
        resumeId: number,
    ): CancelablePromise<ApiResponseString> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/auth/resumes/{resume_id}',
            path: {
                'resume_id': resumeId,
            },
        });
    }
    /**
     * 자기소개서 수정
     * 자기소개서 ID를 통해 특정 자기소개서를 수정합니다.
     * @param resumeId
     * @param requestBody
     * @returns ApiResponseResumeDTO OK
     * @throws ApiError
     */
    public static updateResume(
        resumeId: number,
        requestBody: UpdateResumeDTO,
    ): CancelablePromise<ApiResponseResumeDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/resumes/{resume_id}',
            path: {
                'resume_id': resumeId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
