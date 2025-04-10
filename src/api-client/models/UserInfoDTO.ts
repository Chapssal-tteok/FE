/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserInfoDTO = {
    role?: UserInfoDTO.role;
    username?: string;
    name?: string;
    email?: string;
};
export namespace UserInfoDTO {
    export enum role {
        USER = 'USER',
        ADMIN = 'ADMIN',
    }
}

