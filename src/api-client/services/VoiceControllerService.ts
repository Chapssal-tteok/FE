/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseMapStringString } from '../models/ApiResponseMapStringString';
import type { ApiResponseString } from '../models/ApiResponseString';
import type { TtsRequest } from '../models/TtsRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VoiceControllerService {
    /**
     * 텍스트를 음성으로 변환 (TTS)
     * 입력된 텍스트를 한국어 음성(MP3)으로 변환하여 반환합니다.
     * @param requestBody
     * @returns ApiResponseString OK
     * @throws ApiError
     */
    public static textToSpeech(
        requestBody: TtsRequest,
    ): CancelablePromise<ApiResponseString> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/voice/tts',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 음성을 텍스트로 변환 (STT)
     * 업로드된 한국어 음성 파일을 텍스트로 변환합니다.
     * @param formData
     * @returns ApiResponseMapStringString OK
     * @throws ApiError
     */
    public static speechToText(
        formData?: {
            file: Blob;
        },
    ): CancelablePromise<ApiResponseMapStringString> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/voice/stt',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
