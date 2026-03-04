FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/docs-api/package.json apps/docs-api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/content-parsers/package.json packages/content-parsers/package.json
RUN npm install

COPY . .
RUN npm run build -w packages/shared-types \
 && npm run build -w packages/content-parsers \
 && npm run build -w apps/docs-api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache git
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/docs-api/dist ./apps/docs-api/dist
COPY --from=builder /app/apps/docs-api/sql ./apps/docs-api/sql
COPY --from=builder /app/packages ./packages
CMD ["node", "apps/docs-api/dist/src/index.js"]
