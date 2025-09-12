pipeline {
    agent any

    environment {
        PATH = "/Users/chris/.nvm/versions/node/v18.17.1/bin:$PATH"
        IMAGE_NAME = "host.docker.internal:5000/chris-freg-api"
        IMAGE_TAG = "latest"
        CONTAINER_NAME = "chris-freg-api-test"
        HOST_PORT = "3000"   // host port
        CONTAINER_PORT = "3001" // container port (adjust if your server listens elsewhere)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh "npm install"
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Push to Local Registry') {
            steps {
                sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                    # Stop & remove existing container if running
                    docker rm -f ${CONTAINER_NAME} || true

                    # Start new container (map host:container ports)
                    docker run -d --name ${CONTAINER_NAME}                       -p ${HOST_PORT}:${CONTAINER_PORT}                       ${IMAGE_NAME}:${IMAGE_TAG}

                    # Wait a moment for the server to start
                    sleep 5

                    # Show logs (handy in Jenkins console)
                    docker logs ${CONTAINER_NAME} | tail -n 20

                    # Quick smoke check
                    curl -fsS http://localhost:${HOST_PORT}/fees || echo "API smoke check failed"
                '''
            }
        }
    }
}