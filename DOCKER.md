# Docker - Guía de uso

Este proyecto incluye tres Dockerfiles para diferentes propósitos:

## 📦 Archivos Docker

- **`Dockerfile`**: Producción (nginx) - Serve estático con nginx
- **`Dockerfile.dev`**: Desarrollo (serve con hot reload)
- **`Dockerfile.netlify`**: CI/CD (build + deploy a Netlify en un solo contenedor)
- **`docker-compose.yml`**: Orquestación simplificada para producción
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

## 🤖 Uso en CI/CD (Jenkins + Netlify)

**Con Dockerfile.netlify:**

Este Dockerfile se usa en el pipeline de Jenkins para build y deploy automático a Netlify.

```bash
# Build de la imagen (incluye yarn install + yarn build)
docker build -f Dockerfile.netlify -t mi-portfolio:netlify .

# Deploy a Netlify (requiere tokens)
docker run --rm \
    -e NETLIFY_AUTH_TOKEN=tu-token \
    -e NETLIFY_SITE_ID=tu-site-id \
    mi-portfolio:netlify
```

**Características:**

- Build completo dentro del contenedor
- Deploy automático a Netlify al arrancar
- Sin problemas de permisos (nada se escribe en el host)
- Usado en `Jenkinsfile` para CI/CD

Ver más detalles en: [JENKINS-NETLIFY.md](./JENKINS-NETLIFY.md)

---

## 🛠️ Uso en Desarrollo

**Con Dockerfile.dev:**

```bash
docker build -f Dockerfile.dev -t mi-portfolio:dev .
docker run -d -p 3000:3000 --name portfolio-dev mi-portfolio:dev
```

Acceder en: http://localhost:3000

---

## Comparación

| Característica | Producción (nginx) | Desarrollo (serve) | CI/CD (Netlify)      |
| -------------- | ------------------ | ------------------ | -------------------- |
| Dockerfile     | `Dockerfile`       | `Dockerfile.dev`   | `Dockerfile.netlify` |
| Servidor       | nginx              | serve (Node.js)    | Netlify CDN          |
| Tamaño imagen  | ~25 MB             | ~180 MB            | ~250 MB              |
| Performance    | ⚡ Muy rápida      | 🐢 Más lenta       | ⚡ CDN global        |
| Uso memoria    | Bajo (~10 MB)      | Alto (~50 MB)      | N/A (efímero)        |
| Puerto         | 80                 | 3000               | N/A                  |
| Uso            | Deploy self-hosted | Testing local      | CI/CD pipeline       |

---

## 🔧 Configuración nginx

El archivo `nginx.conf` incluye:

- ✅ Compresión gzip para mejor performance
- ✅ Cache de assets estáticos (1 año)
- ✅ Manejo correcto de rutas de Astro
- ✅ Página 404 personalizada
- ✅ Security headers (X-Frame-Options, etc.)

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
