FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=development && npm cache clean --force

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]