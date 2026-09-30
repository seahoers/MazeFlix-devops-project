# --- build stage ---
FROM oven/bun:1.4.2-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN bun install --frozen-lockfile

COPY frontend ./frontend

ARG VITE_BASE_URL=https://api.tvmaze.com
RUN cd frontend && bun run build

# --- runtime stage ---
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/ || exit 1
