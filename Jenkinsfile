pipeline {
    agent any

    environment {
        PATH = "/Users/chris/.nvm/versions/node/v18.17.1/bin:$PATH"
        IMAGE_NAME = "host.docker.internal:5000/chris-freg-api"
        IMAGE_TAG = "latest"
        CONTAINER_NAME = "chris-freg-api-test"
        HOST_PORT = "5000"   // Backend API standard range
        CONTAINER_PORT = "8081"
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
                    # Stop & remove old container if exists
                    docker rm -f ${CONTAINER_NAME} || true

                    # Run fresh container with proper port mapping
                    docker run -d --name ${CONTAINER_NAME}                         -p ${HOST_PORT}:${CONTAINER_PORT}                         ${IMAGE_NAME}:${IMAGE_TAG}

                    # Wait a moment for the server to start
                    sleep 5

                    # Show status + recent logs
                    docker ps --filter "name=${CONTAINER_NAME}"
                    docker logs ${CONTAINER_NAME} | tail -n 20

                    # Smoke check on /fees
                    if curl -fsS http://localhost:${HOST_PORT}/fees >/dev/null; then
                      echo "Smoke check OK"
                    else
                      echo "Smoke check FAILED"
                      exit 1
                    fi
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline finished for ${CONTAINER_NAME}"
        }
    }
}