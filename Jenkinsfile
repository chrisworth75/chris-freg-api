pipeline {
    agent any

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("backend:latest")
                }
            }
        }
    }
}
