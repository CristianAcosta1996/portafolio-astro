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
                script {
                    echo "🔍 Comprobando variables de entorno..."
                    sh '''
                        echo "TOKEN (parcial): $(echo $NETLIFY_TOKEN | cut -c1-5)****"
                        echo "SITE ID: $NETLIFY_SITE_ID"
                    '''
                }
            }
        }

        
        stage('Desplegar en Netlify') {
             steps {
                sh '''
                    echo "🚀 Iniciando despliegue en Netlify..."
                    echo '[build]' > netlify.toml
                    echo '  command = ""' >> netlify.toml
                    echo '  publish = "dist"' >> netlify.toml
                    sudo npm install -g netlify-cli || true
                    npx netlify deploy --dir=dist --prod --auth=$NETLIFY_TOKEN --site=$NETLIFY_SITE_ID
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
