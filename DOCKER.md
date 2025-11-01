# Docker - Guía de uso

Este proyecto incluye dos Dockerfiles para diferentes propósitos:

## 📦 Archivos Docker

- **`Dockerfile`**: Producción (nginx)
- **`Dockerfile.dev`**: Desarrollo (serve con hot reload)
- **`docker-compose.yml`**: Orquestación simplificada
- **`nginx.conf`**: Configuración personalizada de nginx

---

## 🚀 Uso en Producción

### Opción 1: Docker directamente

**Construir la imagen:**

```bash
docker build -t mi-portfolio:prod .
```

**Ejecutar el contenedor:**

```bash
docker run -d -p 80:80 --name portfolio mi-portfolio:prod
```

**Ver logs:**

```bash
docker logs -f portfolio
```

**Detener y eliminar:**

```bash
docker stop portfolio
docker rm portfolio
```

### Opción 2: Docker Compose (Recomendado)

**Iniciar:**

```bash
docker-compose up -d
```

**Ver logs:**

```bash
docker-compose logs -f
```

**Detener:**

```bash
docker-compose down
```

**Reconstruir y reiniciar:**

```bash
docker-compose up -d --build
```

---

## 🛠️ Uso en Desarrollo

**Con Dockerfile.dev:**

```bash
docker build -f Dockerfile.dev -t mi-portfolio:dev .
docker run -d -p 3000:3000 --name portfolio-dev mi-portfolio:dev
```

Acceder en: http://localhost:3000

---

## 🔧 Configuración nginx

El archivo `nginx.conf` incluye:

- ✅ Compresión gzip para mejor performance
- ✅ Cache de assets estáticos (1 año)
- ✅ Manejo correcto de rutas de Astro
- ✅ Página 404 personalizada
- ✅ Security headers (X-Frame-Options, etc.)

---

## 📊 Comparación

| Característica | Producción (nginx) | Desarrollo (serve) |
| -------------- | ------------------ | ------------------ |
| Servidor       | nginx              | serve (Node.js)    |
| Tamaño imagen  | ~25 MB             | ~180 MB            |
| Performance    | ⚡ Muy rápida      | 🐢 Más lenta       |
| Uso memoria    | Bajo (~10 MB)      | Alto (~50 MB)      |
| Puerto         | 80                 | 3000               |
| Uso            | Deploy real        | Testing local      |

---

## 🌐 Deploy en servidores

### AWS EC2 / Azure VM / DigitalOcean

```bash
# En el servidor
git clone <repo-url>
cd mi-portfolio
docker-compose up -d
```

### Kubernetes

Crear `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portfolio
spec:
  replicas: 3
  selector:
    matchLabels:
      app: portfolio
  template:
    metadata:
      labels:
        app: portfolio
    spec:
      containers:
        - name: portfolio
          image: mi-portfolio:prod
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: portfolio
spec:
  type: LoadBalancer
  ports:
    - port: 80
  selector:
    app: portfolio
```

---

## 🔍 Troubleshooting

**El contenedor no inicia:**

```bash
docker logs portfolio
```

**Puertos en uso:**

```bash
# Windows
netstat -ano | findstr :80

# Linux/Mac
lsof -i :80
```

**Limpiar imágenes y contenedores:**

```bash
docker system prune -a
```

---

## 📝 Notas

- El `Dockerfile` de producción usa **multi-stage build** para optimizar el tamaño
- nginx es ~7x más rápido que serve para contenido estático
- La imagen final pesa solo ~25 MB (vs ~180 MB con Node.js)
