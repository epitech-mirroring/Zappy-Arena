FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install-backend
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile

FROM base AS prerelease-backend
COPY --from=install-backend /temp/dev/node_modules node_modules
COPY . .
# Expose environment variables
ENV DATABASE_URL=""
ENV JWT_SECRET=""
ENV JWT_EXPIRATION="90d"
ENV POSTHOG_API_KEY=""

RUN bun run build

FROM base AS release-backend
COPY --from=install-backend /temp/prod/node_modules node_modules
COPY --from=prerelease-backend /usr/src/app/.output .output
COPY --from=prerelease-backend /usr/src/app/package.json .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", ".output/server/index.mjs" ]