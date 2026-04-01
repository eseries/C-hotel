# Root production image for backend API
FROM node:20-alpine

WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server .

EXPOSE 5000
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start"]
