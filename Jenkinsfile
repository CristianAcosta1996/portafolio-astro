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

        stage('Debug Netlify vars') {
            steps {
                sh '''
                        echo "TOKEN (parcial): ${NETLIFY_TOKEN:0:5}****"
                        echo "SITE ID: $NETLIFY_SITE_ID"
                    '''
                }
        }
        
        stage('Desplegar en Netlify') {
            steps {
                echo '🌐 Desplegando en Netlify...'
                sh '''
                    npm install netlify-cli
                    npx netlify deploy --dir=dist --prod \
                    --auth=$NETLIFY_AUTH_TOKEN \
                    --site=$NETLIFY_SITE_ID
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
