# Dockerfile para producción - Astro Portfolio
# Usa nginx para servir el sitio estático de manera eficiente

# Etapa 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json yarn.lock* ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

# Construir el proyecto
RUN yarn build

# Etapa 2: Producción con nginx
FROM nginx:alpine

# Copiar los archivos estáticos compilados
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# nginx se ejecuta en foreground por defecto
CMD ["nginx", "-g", "daemon off;"]
