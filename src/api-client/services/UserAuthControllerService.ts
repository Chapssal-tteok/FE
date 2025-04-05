/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseJwtResponse } from '../models/ApiResponse/ApiResponseJwtResponse';
import type { ApiResponseRegisterResponseDTO } from '../models/ApiResponse/ApiResponseRegisterResponseDTO';
import type { ApiResponseUserInfoDTO } from '../models/ApiResponse/ApiResponseUserInfoDTO';
import type { CreateUserDTO } from '../models/DTO/CreateUserDTO';
import type { LoginRequestDTO } from '../models/DTO/LoginRequestDTO';
import type { RefreshRequestDTO } from '../models/DTO/RefreshRequestDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserAuthControllerService {
    /**
     * 회원 가입
     * 새로운 사용자를 등록합니다.
     * @param requestBody
     * @returns ApiResponseRegisterResponseDTO OK
     * @throws ApiError
     */
    public static register(
        requestBody: CreateUserDTO,
    ): CancelablePromise<ApiResponseRegisterResponseDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 리프레시 토큰을 이용한 토큰 갱신
     * 리프레시 토큰을 통해 새로운 엑세스 토큰을 발급받습니다.
     * @param requestBody
     * @returns ApiResponseJwtResponse OK
     * @throws ApiError
     */
    public static refresh(
        requestBody: RefreshRequestDTO,
    ): CancelablePromise<ApiResponseJwtResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 로그인
     * 사용자가 로그인하여 JWT 토큰을 받습니다.
     * @param requestBody
     * @returns ApiResponseJwtResponse OK
     * @throws ApiError
     */
    public static login(
        requestBody: LoginRequestDTO,
    ): CancelablePromise<ApiResponseJwtResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 사용자 권한 변경
     * 관리자만 사용 가능한 API로, 사용자의 권한을 변경합니다.
     * @param userId
     * @param newRole
     * @returns ApiResponseUserInfoDTO OK
     * @throws ApiError
     */
    public static changeRole(
        userId: number,
        newRole: 'USER' | 'ADMIN',
    ): CancelablePromise<ApiResponseUserInfoDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/{user_id}/role',
            path: {
                'user_id': userId,
            },
            query: {
                'newRole': newRole,
            },
        });
    }
}
