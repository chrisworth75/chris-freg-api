
pipeline {
    agent any

    environment {
        PATH = "/Users/chris/.nvm/versions/node/v18.17.1/bin:$PATH"
        IMAGE_NAME = "host.docker.internal:5000/chris-freg-api"
        IMAGE_TAG = "latest"
        CONTAINER_NAME = "chris-freg-api-test"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh "npm install"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Push to Local Registry') {
            steps {
                script {
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }



    }
}
