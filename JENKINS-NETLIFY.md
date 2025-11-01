# Jenkins + Netlify (Docker con Volumen)

Guía para desplegar un sitio Astro a Netlify usando Jenkins y Docker. El build se ejecuta en un contenedor que monta el workspace y escribe la carpeta `dist/` directamente en el filesystem del job.

---

## 🚀 Pipeline

Archivo: `Jenkinsfile` (ya configurado en el repo).

### Flujo

```
Checkout → Docker run (monta volumen) → Verify dist → Netlify deploy
   ↓                ↓                       ↓             ↓
  SCM      yarn install && build       ls dist/        npx netlify-cli
```

### 🔧 Cómo funciona

```bash
docker run --rm \
    -v $(pwd):/app \      # Monta workspace en /app
    -w /app \             # Trabaja en /app
    node:20-alpine \      # Imagen base
    sh -c 'yarn install --frozen-lockfile && yarn build'
```

**Resultado:** `dist/` se crea directamente en el workspace de Jenkins, listo para el deploy.

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
# Build con Docker (igual al pipeline)
docker run --rm \
    -v $(pwd):/app \
    -w /app \
    node:20-alpine \
    sh -c 'yarn install --frozen-lockfile && yarn build'

# Verificar que dist/ existe
ls -lah dist/

# Deploy manual a Netlify
npx netlify-cli deploy --prod --dir=dist
```

---

## 🐛 Troubleshooting

### Error: "dist/ not found"

```bash
# Verificar que yarn build genera dist/
ls -lah dist/

# Si no existe, revisar astro.config.mjs
# Debe tener: output: 'static'
```

### Error: "Permission denied" (Docker volume)

```bash
# Cambiar permisos después del build
docker run --rm -v $(pwd):/app -w /app node:20-alpine \
  sh -c 'yarn install --frozen-lockfile && yarn build && chmod -R 777 dist'
```

### Error: "Netlify auth failed"

```bash
# Verificar que el token es correcto
echo $NETLIFY_TOKEN | cut -c1-10  # Debe mostrar primeros 10 chars

# Regenerar token si es necesario en:
# https://app.netlify.com/user/applications
```

### Error: "Site not found"

```bash
# Verificar Site ID
echo $NETLIFY_SITE_ID

# Debe ser formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
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
        sh 'npx netlify-cli deploy --dir=dist'  // Sin --prod = preview
    }
}
```

---

## ✅ Checklist final

- [ ] Credenciales `NETLIFY_TOKEN` y `NETLIFY_SITE_ID` configuradas en Jenkins
- [ ] Docker instalado en el agente Jenkins
- [ ] `Jenkinsfile` actualizado con pipeline de volumen
- [ ] Probado localmente con los comandos de testing
- [ ] Ejecutar build en Jenkins para verificar

---

¿Necesitas ayuda con algún paso específico?
