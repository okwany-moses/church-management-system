FROM node:26-bullseye

WORKDIR /usr/src/app

# Install build deps so native modules (sqlite3) compile against this image's glibc
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential python3 pkg-config libsqlite3-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --unsafe-perm

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm","run","start"]
