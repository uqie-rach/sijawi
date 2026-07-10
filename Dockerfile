# ---- Builder Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --no-optional

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# ---- Runner Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

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

CMD ["npm", "run", "start"]