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
                        --dir=dist \
                        --auth=$NETLIFY_TOKEN \
                        --site=$NETLIFY_SITE_ID
                '''
            }
        }
    }

    post {
        success {
            echo '✅ ¡Despliegue exitoso en Netlify!'
        }
        failure {
            echo '❌ Error durante el pipeline'
        }
        always {
            echo '🧹 Limpiando archivos temporales...'
            sh 'rm -rf node_modules dist .astro || true'
        }
    }
}
