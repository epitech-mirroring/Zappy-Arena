FROM node:16-alpine AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install-backend
RUN mkdir -p /temp/dev
COPY package.json package-lock.json /temp/dev/
RUN cd /temp/dev && npm install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json package-lock.json /temp/prod/
RUN cd /temp/prod && npm install --frozen-lockfile

FROM base AS prerelease-backend
COPY --from=install-backend /temp/dev/node_modules node_modules
COPY . .
# Expose environment variables
ENV DATABASE_URL=""
ENV JWT_EXPIRATION="90d"
ENV POSTHOG_API_KEY=""
ENV JWT_PUBLIC_KEY=""
ENV JWT_PRIVATE_KEY=""

RUN bun run build

FROM base AS release-backend
COPY --from=install-backend /temp/prod/node_modules node_modules
COPY --from=prerelease-backend /usr/src/app/.output .output
COPY --from=prerelease-backend /usr/src/app/package.json .

EXPOSE 3000/tcp
ENTRYPOINT [ "node", ".output/server/index.mjs" ]