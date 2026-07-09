# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Build Next.js app
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts

# Make startup script executable
COPY --from=builder /app/scripts/startup.sh ./scripts/startup.sh
RUN chmod +x ./scripts/startup.sh

# Install mongoose for healthcheck/seed script
RUN npm install mongoose tsx --legacy-peer-deps

# Expose port
EXPOSE 3000

# Use startup script
CMD ["/bin/sh", "./scripts/startup.sh"]