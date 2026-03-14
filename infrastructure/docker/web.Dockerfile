FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts

RUN npm install

EXPOSE 3000
