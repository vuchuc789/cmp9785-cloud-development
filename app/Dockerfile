# syntax=docker.io/docker/dockerfile:1

# FROM node:22-alpine AS base
FROM mcr.microsoft.com/azure-functions/node:4-node22@sha256:49eebe894584b67878b2364e5a2c1464ce503ed411f8c211cdcd09ccaf0d577a AS base
# FROM mcr.microsoft.com/azure-functions/node:4-node22-appservice AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
WORKDIR /home/site/wwwroot

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* .npmrc* ./

RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /home/site/wwwroot
COPY --from=deps /home/site/wwwroot/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"
ENV NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}"

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /home/site/wwwroot

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
  AzureFunctionsJobHost__Logging__Console__IsEnabled=true

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /home/site/wwwroot/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /home/site/wwwroot/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /home/site/wwwroot/.next/static ./.next/static

USER nextjs

EXPOSE 80

ENV HOSTNAME="0.0.0.0"
ENV PORT=80

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
CMD ["node", "server.js"]
