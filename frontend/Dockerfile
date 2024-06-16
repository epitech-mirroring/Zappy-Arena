FROM node:16-alpine AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install-frontend
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
RUN cd /temp/dev && npm install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && npm install --frozen-lockfile --production

FROM base AS prerelease-frontend
COPY --from=install-frontend /temp/dev/node_modules node_modules
COPY . .

RUN npm run build

FROM base AS release-frontend
COPY --from=install-frontend /temp/prod/node_modules node_modules
COPY --from=prerelease-frontend /usr/src/app/.output .output
COPY --from=prerelease-frontend /usr/src/app/package.json .

EXPOSE 3000/tcp
ENTRYPOINT [ "node", ".output/server/index.mjs" ]