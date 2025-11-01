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
