FROM ubuntu:latest

# Install bun
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://bun.sh/install | bash

# Copy the project
COPY . .

# Build the project
RUN bun run build

# Expose the port
EXPOSE 3000

ENTRYPOINT ["bun", ".output/server/index.mjs"]