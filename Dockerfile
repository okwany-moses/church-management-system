FROM node:26-bullseye

WORKDIR /usr/src/app

# Install build deps so native modules (sqlite3) compile against this image's glibc
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential python3 pkg-config libsqlite3-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# Force native modules to build from source inside this image (avoid downloading prebuilt binaries)
RUN npm ci --unsafe-perm && \
    npm rebuild sqlite3 --build-from-source --unsafe-perm || true

COPY . .
ENV NODE_ENV=production
ENV PORT=10000
RUN npm run build

EXPOSE 10000
CMD ["npm","run","start"]
