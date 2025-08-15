
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

stage('Run Container from Image') {
    steps {
        script {
            sh """
                # Stop & remove if already running
                docker rm -f ${CONTAINER_NAME} || true

                # Run detached, mapping host:3000 to container:3001
                docker run -d --name ${CONTAINER_NAME} -p 8080:8080 ${IMAGE_NAME}:${IMAGE_TAG}

                # Wait for the app to start
                sleep 5

                # Show container logs
                docker logs ${CONTAINER_NAME}

                # Test endpoint
                curl -f http://localhost:8080/fees || (echo 'API check failed' && exit 1)
            """
        }
    }
}

    }
}
