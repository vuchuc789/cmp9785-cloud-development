// This file is auto-generated by @hey-api/openapi-ts

import { z } from 'zod';

export const zBodyLoginForAccessTokenUsersLoginPost = z.object({
  grant_type: z.union([z.string().regex(/^password$/), z.null()]).optional(),
  username: z.string(),
  password: z.string(),
  scope: z.string().optional().default(''),
  client_id: z.union([z.string(), z.null()]).optional(),
  client_secret: z.union([z.string(), z.null()]).optional(),
});

export const zBodyUploadFileFilesUploadPost = z.object({
  file: z.string(),
});

export const zCreateUserForm = z.object({
  username: z.string().min(6).max(50),
  email: z.union([z.string().email(), z.null()]).optional(),
  full_name: z.union([z.string(), z.null()]).optional(),
  password: z.string().min(6).max(50),
  password_repeat: z.string().min(6).max(50),
});

export const zEmailRequest = z.object({
  email: z.string().email(),
});

export const zEmailVerificationStatus = z.enum([
  'verified',
  'verifying',
  'none',
]);

export const zFileProcessingStatus = z.enum([
  'pending',
  'queuing',
  'processing',
  'success',
  'failed',
  'cancelled',
  'unknown',
]);

export const zFileResponse = z.object({
  id: z.number().int(),
  filename: z.string(),
  status: zFileProcessingStatus,
  size: z.number().int(),
  type: z.string(),
  url: z.string(),
  created_at: z.string().datetime(),
  description: z.union([z.string(), z.null()]),
});

export const zHttpValidationError = z.object({
  detail: z
    .array(
      z.object({
        loc: z.array(z.unknown()),
        msg: z.string(),
        type: z.string(),
      })
    )
    .optional(),
});

export const zListFilesResponse = z.object({
  result_count: z.number().int(),
  page_count: z.number().int(),
  page_size: z.number().int(),
  page: z.number().int(),
  credit: z.number().int(),
  credit_count: z.number().int(),
  credit_timestamp: z.union([z.string().datetime(), z.null()]),
  results: z.array(zFileResponse),
});

export const zPasswordResetForm = z.object({
  password: z.string().min(6).max(50),
  password_repeat: z.string().min(6).max(50),
});

export const zSortBy = z.enum(['created_at', 'name', 'status']);

export const zSortOrder = z.enum(['asc', 'desc']);

export const zToken = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export const zUpdateUserForm = z.object({
  username: z.string().min(6).max(50),
  email: z.union([z.string().email(), z.null()]).optional(),
  full_name: z.union([z.string(), z.null()]).optional(),
  password: z.union([z.string().min(6).max(50), z.null()]).optional(),
  password_repeat: z.union([z.string().min(6).max(50), z.null()]).optional(),
});

export const zUserResponse = z.object({
  username: z.string().min(6).max(50),
  email: z.union([z.string().email(), z.null()]).optional(),
  full_name: z.union([z.string(), z.null()]).optional(),
  email_verification_status: zEmailVerificationStatus,
});

export const zValidationError = z.object({
  loc: z.array(z.unknown()),
  msg: z.string(),
  type: z.string(),
});

export const zRegisterNewUserUsersRegisterPostResponse = zUserResponse;

export const zLoginForAccessTokenUsersLoginPostResponse = zToken;

export const zRefreshAccessTokenUsersRefreshPostResponse = zToken;

export const zGetCurrentUserInfoUsersInfoGetResponse = zUserResponse;

export const zUpdateUserInfoUsersUpdatePatchResponse = zUserResponse;

export const zVerifyEmailUsersVerifyEmailGetResponse = zUserResponse;

export const zSendVerificationEmailUsersVerifyEmailPostResponse = zUserResponse;

export const zResetPasswosdUsersResetPasswordPatchResponse = zUserResponse;

export const zUploadFileFilesUploadPostResponse = zFileResponse;

export const zListFilesFilesGetResponse = zListFilesResponse;

export const zRetryFileFilesFileIdRetryPatchResponse = zFileResponse;

export const zCancelFileFilesFileIdCancelPatchResponse = zFileResponse;
