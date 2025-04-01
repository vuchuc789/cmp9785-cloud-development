// This file is auto-generated by @hey-api/openapi-ts

import { z } from 'zod';

export const zAudioAltFile = z.object({
  url: z.string(),
  bit_rate: z.number().int(),
  filesize: z.number().int(),
  filetype: z.string(),
  sample_rate: z.number().int(),
});

export const zAudioCategory = z.enum([
  'audiobook',
  'music',
  'news',
  'podcast',
  'pronunciation',
  'sound_effect',
]);

export const zAudioLength = z.enum(['long', 'medium', 'short', 'shortest']);

export const zAudioSearchItem = z.object({
  id: z.string(),
  title: z.union([z.string(), z.null()]),
  indexed_on: z.string().datetime(),
  foreign_landing_url: z.union([z.string(), z.null()]),
  url: z.union([z.string(), z.null()]),
  creator: z.union([z.string(), z.null()]),
  creator_url: z.union([z.string(), z.null()]),
  license: z.string(),
  license_version: z.union([z.string(), z.null()]),
  license_url: z.union([z.string(), z.null()]),
  provider: z.union([z.string(), z.null()]),
  source: z.union([z.string(), z.null()]),
  category: z.union([z.string(), z.null()]),
  genres: z.union([z.array(z.string()), z.null()]),
  filesize: z.union([z.number().int(), z.null()]),
  filetype: z.union([z.string(), z.null()]),
  tags: z.union([
    z.array(
      z.object({
        accuracy: z.union([z.number(), z.null()]),
        name: z.string(),
        unstable__provider: z.union([z.string(), z.null()]),
      })
    ),
    z.null(),
  ]),
  alt_files: z.union([z.array(zAudioAltFile), z.null()]),
  attribution: z.union([z.string(), z.null()]),
  fields_matched: z.union([z.array(z.string()), z.null()]),
  mature: z.boolean(),
  audio_set: z.union([
    z.object({
      title: z.union([z.string(), z.null()]),
      foreign_landing_url: z.union([z.string(), z.null()]),
      creator: z.union([z.string(), z.null()]),
      creator_url: z.union([z.string(), z.null()]),
      url: z.union([z.string(), z.null()]),
      filesize: z.union([z.number().int(), z.null()]),
      filetype: z.union([z.string(), z.null()]),
    }),
    z.null(),
  ]),
  duration: z.union([z.number().int(), z.null()]),
  bit_rate: z.union([z.number().int(), z.null()]),
  sample_rate: z.union([z.number().int(), z.null()]),
  thumbnail: z.union([z.string(), z.null()]),
  detail_url: z.string(),
  related_url: z.string(),
  waveform: z.string(),
});

export const zAudioSearchResponse = z.object({
  result_count: z.number().int(),
  page_count: z.number().int(),
  page_size: z.number().int(),
  page: z.number().int(),
  results: z.array(zAudioSearchItem),
  warnings: z.union([z.array(z.object({})), z.null()]).optional(),
});

export const zAudioSet = z.object({
  title: z.union([z.string(), z.null()]),
  foreign_landing_url: z.union([z.string(), z.null()]),
  creator: z.union([z.string(), z.null()]),
  creator_url: z.union([z.string(), z.null()]),
  url: z.union([z.string(), z.null()]),
  filesize: z.union([z.number().int(), z.null()]),
  filetype: z.union([z.string(), z.null()]),
});

export const zBodyLoginForAccessTokenUsersLoginPost = z.object({
  grant_type: z.union([z.string().regex(/^password$/), z.null()]).optional(),
  username: z.string(),
  password: z.string(),
  scope: z.string().optional().default(''),
  client_id: z.union([z.string(), z.null()]).optional(),
  client_secret: z.union([z.string(), z.null()]).optional(),
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

export const zImageAspectRatio = z.enum(['square', 'tall', 'wide']);

export const zImageCategory = z.enum([
  'digitized_artwork',
  'illustration',
  'photograph',
]);

export const zImageSearchItem = z.object({
  id: z.string(),
  title: z.union([z.string(), z.null()]),
  indexed_on: z.string().datetime(),
  foreign_landing_url: z.union([z.string(), z.null()]),
  url: z.union([z.string(), z.null()]),
  creator: z.union([z.string(), z.null()]),
  creator_url: z.union([z.string(), z.null()]),
  license: z.string(),
  license_version: z.union([z.string(), z.null()]),
  license_url: z.union([z.string(), z.null()]),
  provider: z.union([z.string(), z.null()]),
  source: z.union([z.string(), z.null()]),
  category: z.union([z.string(), z.null()]),
  filesize: z.union([z.number().int(), z.null()]),
  filetype: z.union([z.string(), z.null()]),
  tags: z.union([
    z.array(
      z.object({
        accuracy: z.union([z.number(), z.null()]),
        name: z.string(),
        unstable__provider: z.union([z.string(), z.null()]),
      })
    ),
    z.null(),
  ]),
  attribution: z.union([z.string(), z.null()]),
  fields_matched: z.union([z.array(z.string()), z.null()]),
  mature: z.boolean(),
  height: z.union([z.number().int(), z.null()]),
  width: z.union([z.number().int(), z.null()]),
  thumbnail: z.string(),
  detail_url: z.string(),
  related_url: z.string(),
});

export const zImageSearchResponse = z.object({
  result_count: z.number().int(),
  page_count: z.number().int(),
  page_size: z.number().int(),
  page: z.number().int(),
  results: z.array(zImageSearchItem),
  warnings: z.union([z.array(z.object({})), z.null()]).optional(),
});

export const zImageSize = z.enum(['large', 'medium', 'small']);

export const zMediaLicense = z.enum([
  'by',
  'by-nc',
  'by-nc-nd',
  'by-nc-sa',
  'by-nd',
  'by-sa',
  'cc0',
  'nc-sampling+',
  'pdm',
  'sampling+',
]);

export const zMediaLicenseType = z.enum([
  'all',
  'all-cc',
  'commercial',
  'modification',
]);

export const zMediaTag = z.object({
  accuracy: z.union([z.number(), z.null()]),
  name: z.string(),
  unstable__provider: z.union([z.string(), z.null()]),
});

export const zMediaType = z.enum(['image', 'audio']);

export const zPasswordResetForm = z.object({
  password: z.string().min(6).max(50),
  password_repeat: z.string().min(6).max(50),
});

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

export const zSearchMediaMediaSearchGetResponse = z.union([
  zImageSearchResponse,
  zAudioSearchResponse,
]);

export const zMediaDetailMediaDetailGetResponse = z.union([
  zImageSearchItem,
  zAudioSearchItem,
]);
