# שלב 1: התקנה והכנה
FROM node:20-alpine AS builder

WORKDIR /app

# העתקת קבצי הפרויקט
COPY backend/package*.json ./backend/
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# התקנת תלויות
WORKDIR /app/backend
RUN npm install --omit=dev

# שלב 2: ריצה
FROM node:20-alpine

WORKDIR /app

# העתקת הקבצים מהשלב הקודם
COPY --from=builder /app /app

WORKDIR /app/backend

# חשיפת פורט
EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# הפעלה
CMD ["node", "server.js"]
