# Etapa 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Etapa 2: Servir contenido estático
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN yarn global add serve
EXPOSE 3000
CMD ["serve", "dist"]
