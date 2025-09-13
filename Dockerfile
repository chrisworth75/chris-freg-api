# Dockerfile for chris-freg-api - ARM64 optimized
FROM --platform=linux/arm64 node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM --platform=linux/arm64 node:18-alpine AS runtime

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S apiuser -u 1001

WORKDIR /app

# Copy dependencies and app
COPY --from=build --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --chown=apiuser:nodejs . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

USER apiuser
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
