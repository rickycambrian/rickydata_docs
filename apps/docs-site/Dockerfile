# Stage 1: Build the Docusaurus site (run from monorepo root as build context)
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time configuration baked into the static bundle
ARG DOCS_API_URL
ARG AGENT_GATEWAY_URL
ARG PRIVY_APP_ID
ENV DOCS_API_URL=${DOCS_API_URL}
ENV AGENT_GATEWAY_URL=${AGENT_GATEWAY_URL}
ENV PRIVY_APP_ID=${PRIVY_APP_ID}

# Install from the root lockfile so workspace resolution is honored
COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/docs-site/package.json apps/docs-site/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/content-parsers/package.json packages/content-parsers/package.json
RUN npm install --legacy-peer-deps

# Copy remaining source and build only docs-site
COPY . .
RUN npm run build -w apps/docs-site

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine
COPY apps/docs-site/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/docs-site/build /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
