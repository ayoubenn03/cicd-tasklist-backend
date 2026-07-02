# ---------- deps: install all dependencies (cached layer) ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build: generate Prisma client + compile TypeScript ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build

# ---------- prod-deps: production-only dependencies + generated client ----------
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --omit=peer --omit=optional
COPY prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# ---------- runtime: minimal final image ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=prod-deps --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

USER node
EXPOSE 3001
CMD ["node", "dist/server.js"]
