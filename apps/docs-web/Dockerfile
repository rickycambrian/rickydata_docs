FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_DOCS_API_URL
ARG VITE_VIDEO_QUICKSTART_DEMO_URL
ARG VITE_VIDEO_MCP_RUNTIME_URL
ARG VITE_VIDEO_INIT_WIZARD_URL
ARG VITE_VIDEO_CLAUDE_CHAT_CONNECTOR_URL
ENV VITE_DOCS_API_URL=$VITE_DOCS_API_URL
ENV VITE_VIDEO_QUICKSTART_DEMO_URL=$VITE_VIDEO_QUICKSTART_DEMO_URL
ENV VITE_VIDEO_MCP_RUNTIME_URL=$VITE_VIDEO_MCP_RUNTIME_URL
ENV VITE_VIDEO_INIT_WIZARD_URL=$VITE_VIDEO_INIT_WIZARD_URL
ENV VITE_VIDEO_CLAUDE_CHAT_CONNECTOR_URL=$VITE_VIDEO_CLAUDE_CHAT_CONNECTOR_URL
COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/docs-web/package.json apps/docs-web/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm install

COPY . .
RUN npm run build -w packages/shared-types \
 && npm run build -w apps/docs-web

FROM nginx:1.27-alpine AS runner
ARG VITE_DOCS_API_URL
COPY apps/docs-web/nginx.conf /tmp/default.conf.template
RUN rm -f /etc/nginx/templates/*.template \
 && API_URL="${VITE_DOCS_API_URL%/}" \
 && test -n "$API_URL" \
 && sed "s|__DOCS_API_URL__|$API_URL|g" /tmp/default.conf.template > /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/docs-web/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
