FROM node:20-slim as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# https://github.com/nodejs/corepack
RUN corepack enable
WORKDIR /app

FROM base as build
COPY package.json pnpm-lock.yaml tsup.config.ts ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -r --offline --frozen-lockfile
COPY src ./src
RUN pnpm build

FROM base as production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -r --prod

CMD ["node", "dist/index.js"]