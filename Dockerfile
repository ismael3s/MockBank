FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS final
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json .


EXPOSE 3000


CMD ["node", "dist/main"]
