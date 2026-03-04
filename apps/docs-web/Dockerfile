FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_DOCS_API_URL
ENV VITE_DOCS_API_URL=$VITE_DOCS_API_URL
COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/docs-web/package.json apps/docs-web/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm install

COPY . .
RUN npm run build -w packages/shared-types \
 && npm run build -w apps/docs-web

FROM nginx:1.27-alpine AS runner
COPY apps/docs-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/docs-web/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
