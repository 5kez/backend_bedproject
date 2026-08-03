# syntax=docker/dockerfile:1

################################################################################
# 1) deps: install *all* dependencies (dev included) - needed to compile TS
################################################################################
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

################################################################################
# 2) build: compile TypeScript -> dist/
################################################################################
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

################################################################################
# 3) prod-deps: install *only* production dependencies (smaller, no dev tools)
################################################################################
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

################################################################################
# 4) runner: minimal runtime image
################################################################################
FROM node:22-alpine AS runner

# su-exec lets the entrypoint drop from root to the unprivileged "node" user
# after fixing permissions on the mounted uploads volume.
RUN apk add --no-cache su-exec

WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p uploads \
    && chown -R node:node /app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get({host:'127.0.0.1',port:process.env.PORT||3000,path:'/'},(r)=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

# Container starts as root only long enough for the entrypoint to chown the
# (volume-mounted) uploads dir, then it execs the app as the "node" user.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
