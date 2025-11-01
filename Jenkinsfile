// ============================================================
// Jenkinsfile - Opción 3: Docker con Volumen (Netlify)
// Requiere: Docker instalado en el agente Jenkins
// Flujo: docker run (monta workspace) -> genera dist/ -> netlify deploy
// ============================================================

pipeline {
    agent any

    environment {
        NETLIFY_TOKEN = credentials('NETLIFY_TOKEN')
        NETLIFY_SITE_ID = credentials('NETLIFY_SITE_ID')
    }

    stages {
        stage('Pre-fix permissions') {
            steps {
                echo '🔧 Corrigiendo permisos previos en el workspace...'
                // Asegura que archivos previos creados por root sean reasignados al usuario de Jenkins
                sh """
                    docker run --rm \
                        -v \$(pwd):/app \
                        -w /app \
                        alpine \
                        sh -c 'chown -R \$(id -u):\$(id -g) /app || true'
                """
            }
        }
        stage('Checkout') {
            steps {
                echo '🌀 Clonando repositorio...'
                checkout scm
            }
        }

        stage('Build with Docker (mounted volume)') {
            steps {
                echo '🐳 Construyendo proyecto con Docker...'
                script {
                    // Montar workspace como volumen, build se escribe directamente
                    sh """
                        docker run --rm \
                            --user \$(id -u):\$(id -g) \
                            -e HOME=/tmp \
                            -e ASTRO_TELEMETRY_DISABLED=1 \
                            -v \$(pwd):/app \
                            -w /app \
                            node:20-alpine \
                            sh -c 'yarn install --frozen-lockfile && yarn build'
                    """
                }
            }
        }

        stage('Verify dist') {
            steps {
                echo '🔍 Verificando que dist/ existe...'
                sh '''
                    if [ -d "dist" ]; then
                        echo "✅ Carpeta dist/ generada correctamente"
                        ls -lah dist/
                    else
                        echo "❌ ERROR: dist/ no existe"
                        exit 1
                    fi
                '''
            }
        }

        stage('Deploy to Netlify') {
            steps {
                echo '🚀 Desplegando a Netlify...'
                sh '''
                    npx netlify-cli deploy \
                        --prod \
                        --skip-build \
                        --dir=dist \
                        --auth=$NETLIFY_TOKEN \
                        --site=$NETLIFY_SITE_ID
                '''
            }
        }
    }

    post {
        // Nota: Jenkins ya hace un 'Declarative: Checkout SCM' antes de los stages.
        // Evitamos un segundo checkout para prevenir conflictos de permisos/locks.
        always {
            echo '🧹 Limpiando archivos temporales...'
            // Limpiar usando un contenedor con root para evitar problemas de permisos
            sh """
                docker run --rm \
                    -v \$(pwd):/app \
                    -w /app \
                    alpine \
                    sh -c 'rm -rf node_modules dist .astro || true'
                        sh -c 'chown -R \$(id -u):\$(id -g) /app && chmod -R a+rwX .git || true'
        }
    }
}
