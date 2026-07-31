FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js ./

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
