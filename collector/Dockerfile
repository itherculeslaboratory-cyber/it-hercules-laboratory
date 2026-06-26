FROM node:22-alpine

WORKDIR /app
COPY package.json ./
COPY switchbot-local-collector.mjs ./

ENV NODE_ENV=production
CMD ["npm", "start"]
