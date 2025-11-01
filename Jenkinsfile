// ============================================================
// Jenkinsfile - Netlify deployment using Dockerfile.netlify
// Requiere: Docker instalado en el agente Jenkins
// Flujo: Build image (yarn build inside) -> Run container (netlify deploy inside)
// ============================================================

pipeline {
    agent any

    environment {
        NETLIFY_TOKEN = credentials('NETLIFY_TOKEN')
        NETLIFY_SITE_ID = credentials('NETLIFY_SITE_ID')
    }

    stages {
        stage('Build image') {
            steps {
                echo '🧱 Construyendo imagen (incluye yarn build)...'
                sh 'docker build -f Dockerfile.netlify -t mi-portfolio:netlify .'
            }
        }

        stage('Deploy to Netlify') {
            steps {
                echo '🚀 Desplegando a Netlify desde el contenedor...'
                sh """
                    docker run --rm \
                        -e NETLIFY_AUTH_TOKEN=$NETLIFY_TOKEN \
                        -e NETLIFY_SITE_ID=$NETLIFY_SITE_ID \
                        mi-portfolio:netlify
                """
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
    }
}
