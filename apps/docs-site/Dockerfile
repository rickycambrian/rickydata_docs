# Stage 1: Build the Docusaurus site
FROM node:20-alpine AS builder

# Accept build arguments for runtime configuration
ARG DOCS_API_URL
ARG AGENT_GATEWAY_URL
ARG PRIVY_APP_ID

# Set as environment variables for Docusaurus build
ENV DOCS_API_URL=${DOCS_API_URL}
ENV AGENT_GATEWAY_URL=${AGENT_GATEWAY_URL}
ENV PRIVY_APP_ID=${PRIVY_APP_ID}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source files
COPY . .

# Build the static site (outputs to build/)
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Cloud Run expects port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
