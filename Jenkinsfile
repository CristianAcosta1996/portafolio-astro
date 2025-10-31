pipeline {
    agent any

    environment {
        NETLIFY_TOKEN = credentials('NETLIFY_TOKEN')
        NETLIFY_SITE_ID = credentials('NETLIFY_SITE_ID')
    }

    stages {
        stage('Clonar código') {
            steps {
                echo '🌀 Clonando repositorio desde GitHub...'
                checkout scm
            }
        }

        stage('Construir imagen Docker') {
            steps {
                echo '🐳 Construyendo imagen Docker del proyecto Astro...'
                sh 'docker build -t astro-app .'
            }
        }

        stage('Ejecutar contenedor') {
            steps {
                echo '🚀 Iniciando contenedor Astro...'
                sh '''
                docker stop astro-app-container || true
                docker rm astro-app-container || true
                docker run -d --name astro-app-container -p 3000:3000 astro-app
                '''
            }
        }

        stage('Compilar sitio Astro') {
            steps {
                echo '🧱 Compilando el sitio Astro...'
                sh '''
                npm install
                npm run build
                '''
            }
        }

        stage('Desplegar en Netlify') {
            steps {
                echo '🌍 Desplegando en Netlify...'
                sh '''
                npm install -g netlify-cli
                netlify deploy --dir=dist --site=$NETLIFY_SITE_ID --auth=$NETLIFY_TOKEN --prod
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Build y despliegue completados con éxito.'
        }
        failure {
            echo '❌ Error durante el pipeline.'
        }
    }
}
