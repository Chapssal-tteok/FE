/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseListInterviewDTO } from '../models/ApiResponseListInterviewDTO';
import type { ApiResponseListResumeDTO } from '../models/ApiResponseListResumeDTO';
import type { ApiResponseUserExistenceDTO } from '../models/ApiResponseUserExistenceDTO';
import type { ApiResponseUserInfoDTO } from '../models/ApiResponseUserInfoDTO';
import type { UpdateUserDTO } from '../models/UpdateUserDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserControllerService {
    /**
     * 사용자 정보 조회
     * 현재 로그인된 사용자의 정보를 조회합니다.
     * @returns ApiResponseUserInfoDTO OK
     * @throws ApiError
     */
    public static getUserInfo(): CancelablePromise<ApiResponseUserInfoDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/users/info',
        });
    }
    /**
     * 사용자 정보 수정
     * 현재 로그인된 사용자의 정보를 수정합니다.
     * @param requestBody
     * @returns ApiResponseUserInfoDTO OK
     * @throws ApiError
     */
    public static updateUserInfo(
        requestBody: UpdateUserDTO,
    ): CancelablePromise<ApiResponseUserInfoDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/users/info',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 현재 로그인한 사용자의 자기소개서 목록 조회
     * 현재 로그인한 사용자의 자기소개서 목록을 조회합니다.
     * @returns ApiResponseListResumeDTO OK
     * @throws ApiError
     */
    public static getMyResumes(): CancelablePromise<ApiResponseListResumeDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/users/resumes',
        });
    }
    /**
     * 현재 로그인한 사용자의 면접 목록 조회
     * 현재 로그인한 사용자의 면접 목록을 조회합니다.
     * @returns ApiResponseListInterviewDTO OK
     * @throws ApiError
     */
    public static getMyInterviews(): CancelablePromise<ApiResponseListInterviewDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/users/interviews',
        });
    }
    /**
     * 사용자 아이디 존재 여부 확인
     * 입력한 사용자 아이디가 이미 존재하는지 확인합니다.
     * @param username
     * @returns ApiResponseUserExistenceDTO OK
     * @throws ApiError
     */
    public static checkUserExistence(
        username: string,
    ): CancelablePromise<ApiResponseUserExistenceDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/users/exist',
            query: {
                'username': username,
            },
        });
    }
}
