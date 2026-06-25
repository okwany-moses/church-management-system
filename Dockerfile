FROM node:26-bullseye

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
ENV NODE_ENV=production
ENV PORT=10000
RUN npm run build

EXPOSE 10000
CMD ["npm","run","start"]
