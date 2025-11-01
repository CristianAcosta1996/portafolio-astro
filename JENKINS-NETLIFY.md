# Jenkins + Netlify (Dockerfile.netlify)

Guía para desplegar un sitio Astro a Netlify usando Jenkins y Docker. Todo el build y deploy ocurre dentro de un contenedor usando `Dockerfile.netlify`.

---

## 🚀 Pipeline

Archivo: `Jenkinsfile` (ya configurado en el repo).

### Flujo

```
Build image → Run container (build + deploy inside)
     ↓                    ↓
docker build      yarn build + netlify deploy
(Dockerfile.netlify)    (todo dentro del contenedor)
```

### 🔧 Cómo funciona

**Stage 1: Build image**

```bash
docker build -f Dockerfile.netlify -t mi-portfolio:netlify .
```

- Instala Yarn 1 y Netlify CLI
- Ejecuta `yarn install --frozen-lockfile`
- Ejecuta `yarn build` (genera dist/)
- Todo queda en la imagen

**Stage 2: Deploy to Netlify**

```bash
docker run --rm \
    -e NETLIFY_AUTH_TOKEN=$NETLIFY_TOKEN \
    -e NETLIFY_SITE_ID=$NETLIFY_SITE_ID \
    mi-portfolio:netlify
```

- El contenedor arranca con el CMD del Dockerfile
- Ejecuta `netlify deploy --prod --dir=dist`
- Usa las credenciales que le pasó Jenkins
- Termina y se elimina (--rm)

**Resultado:** Todo ocurre dentro del contenedor. Sin writes en el host, sin problemas de permisos.

---

## 🔐 Configuración de credenciales en Jenkins

### Paso 1: Obtener tokens de Netlify

1. **NETLIFY_AUTH_TOKEN:**

   - Ve a: https://app.netlify.com/user/applications
   - Click en "New access token"
   - Nombre: "Jenkins CI/CD"
   - Copia el token (solo se muestra una vez)

2. **NETLIFY_SITE_ID:**
   - Ve a tu sitio en Netlify
   - Site settings → General → Site details
   - Copia el "Site ID" (ej: f1234567-abcd-1234-5678-abcdef123456)

### Paso 2: Agregar credenciales en Jenkins

1. **Dashboard → Manage Jenkins → Credentials**
2. Click en **(global)** o tu dominio
3. Click **Add Credentials**

**Para NETLIFY_TOKEN:**

```
Kind: Secret text
Scope: Global
Secret: [pega tu token de Netlify]
ID: NETLIFY_TOKEN
Description: Netlify Auth Token
```

**Para NETLIFY_SITE_ID:**

```
Kind: Secret text
Scope: Global
Secret: [pega tu site ID]
ID: NETLIFY_SITE_ID
Description: Netlify Site ID
```

### Paso 3: Verificar en Jenkinsfile

Las credenciales se inyectan así:

```groovy
environment {
    NETLIFY_TOKEN = credentials('NETLIFY_TOKEN')
    NETLIFY_SITE_ID = credentials('NETLIFY_SITE_ID')
}
```

Jenkins automáticamente:

- Lee el valor de las credenciales
- Las pone como variables de entorno `$NETLIFY_TOKEN` y `$NETLIFY_SITE_ID`
- Las enmascara en los logs (no se muestran completas)

---

## 🧪 Testing local (antes de Jenkins)

```bash
# Build de la imagen (igual que Jenkins)
docker build -f Dockerfile.netlify -t mi-portfolio:netlify .

# Deploy manual (con tus tokens locales)
docker run --rm \
    -e NETLIFY_AUTH_TOKEN=tu-token-aqui \
    -e NETLIFY_SITE_ID=tu-site-id-aqui \
    mi-portfolio:netlify
```

---

## 🐛 Troubleshooting

### Error: "dist/ not found" dentro del contenedor

```bash
# Revisar que yarn build genera dist/
docker run --rm mi-portfolio:netlify sh -lc 'ls -lah dist/'

# Si no existe, revisar astro.config.mjs
# Debe tener: output: 'static'
```

### Error: "Netlify auth failed"

```bash
# Verificar que las credenciales están en Jenkins
# Dashboard → Credentials → Verificar NETLIFY_TOKEN y NETLIFY_SITE_ID

# Regenerar token si es necesario:
# https://app.netlify.com/user/applications
```

### Error: "Site not found"

```bash
# Verificar Site ID en Netlify:
# Site settings → General → Site ID
# Formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Error en el build de la imagen

```bash
# Ver logs completos del build
docker build -f Dockerfile.netlify -t mi-portfolio:netlify . --progress=plain

# Limpiar cache si es necesario
docker build --no-cache -f Dockerfile.netlify -t mi-portfolio:netlify .
```

---

## 📈 Mejoras adicionales

### Notificaciones de Slack/Email

```groovy
post {
    success {
        slackSend(color: 'good', message: "✅ Deploy exitoso: ${env.BUILD_URL}")
    }
    failure {
        slackSend(color: 'danger', message: "❌ Deploy falló: ${env.BUILD_URL}")
    }
}
```

### Deploy preview en PRs

```groovy
stage('Deploy Preview') {
    when {
        changeRequest()  // Solo en Pull Requests
    }
    steps {
        sh """
            docker run --rm \
                -e NETLIFY_AUTH_TOKEN=$NETLIFY_TOKEN \
                -e NETLIFY_SITE_ID=$NETLIFY_SITE_ID \
                mi-portfolio:netlify \
                sh -lc 'netlify deploy --dir=dist --auth=\"\$NETLIFY_AUTH_TOKEN\" --site=\"\$NETLIFY_SITE_ID\"'
        """
    }
}
```

(sin `--prod` = deploy preview)

---

## ✅ Checklist final

- [ ] Credenciales `NETLIFY_TOKEN` y `NETLIFY_SITE_ID` configuradas en Jenkins
- [ ] Docker instalado en el agente Jenkins
- [ ] `Dockerfile.netlify` en el repo
- [ ] `Jenkinsfile` actualizado
- [ ] Probado localmente con docker build + docker run
- [ ] Ejecutar build en Jenkins para verificar

---

¿Necesitas ayuda con algún paso específico?
