pipeline {
    agent any

    stages {
        stage('Clonar código') {
            steps {
                checkout scm
            }
        }

        stage('Construir imagen Docker') {
            steps {
                echo 'Construyendo la aplicación Astro...'
                sh 'docker build -t astro-app ./app'
            }
        }

        stage('Correr contenedor') {
            steps {
                echo 'Ejecutando contenedor Astro...'
                sh 'docker run -d -p 3000:3000 astro-app || true'
            }
        }
    }

    post {
        success {
            echo '✅ Build y despliegue exitoso'
        }
        failure {
            echo '❌ Error en el pipeline'
        }
    }
}
