# ---- Builder Stage ----
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build Next.js
RUN pnpm run build

# ---- Runner Stage ----
FROM node:20-alpine AS runner

# Install pnpm for runner too (needed for pnpm run start)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy built output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy scripts and models untuk seed (opsional)
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/src/models ./src/models
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Environment default
ENV NODE_ENV production
ENV PORT 3000

EXPOSE 3000

CMD ["pnpm", "run", "start"]
