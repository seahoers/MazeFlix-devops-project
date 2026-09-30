# --- build stage ---
FROM oven/bun:1.4.2-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN bun install --frozen-lockfile

# --- runtime stage ---
FROM oven/bun:1.4.2-alpine
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY backend/package.json ./backend/package.json
COPY backend/src ./backend/src
COPY backend/drizzle ./backend/drizzle

WORKDIR /app/backend
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["bun", "run", "src/index.ts"]
