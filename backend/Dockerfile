# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо залежності включно з dev dependencies
RUN npm install

# Встановлюємо глобально @nestjs/cli
RUN npm install -g @nestjs/cli

# Копіюємо всі файли проекту
COPY . .

# Очищаємо dist директорію якщо вона існує
RUN rm -rf dist || true

# Білдимо проект
RUN npm run build

# Production stage
FROM node:18-alpine as production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Встановлюємо тільки production залежності
RUN npm install --only=production

EXPOSE 3000

# Запускаємо додаток
CMD ["node", "dist/main.js"]

# Development stage
FROM node:18-alpine as development

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @nestjs/cli ts-node ts-node-dev

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
