FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY . .
COPY .env.production.local .env.production.local

RUN npm install
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./

RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
