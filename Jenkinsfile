pipeline {
    agent any

    environment {
        IMAGE_NAME      = "host.docker.internal:5000/chris-freg-api"
        IMAGE_TAG       = "latest"
        CONTAINER_NAME  = "chris-freg-api-test"
        DB_CONTAINER    = "chris-freg-db"
        NETWORK_NAME    = "chris-freg-net"
        HOST_PORT       = "5100"
        CONTAINER_PORT  = "8081"
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

        stage('Ensure Network') {
            steps {
                sh '''
                    if ! docker network ls | grep -q ${NETWORK_NAME}; then
                      docker network create ${NETWORK_NAME}
                    fi
                '''
            }
        }

        stage('Ensure Database') {
            steps {
                sh '''
                    if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
                      echo "Starting database container..."
                      docker run -d --name ${DB_CONTAINER}                         --network ${NETWORK_NAME}                         -e POSTGRES_USER=postgres                         -e POSTGRES_PASSWORD=postgres                         -e POSTGRES_DB=fees                         postgres:15
                      sleep 5
                    else
                      echo "Database container already running."
                    fi
                '''
            }
        }

        stage('Run API Container') {
            steps {
                sh '''
                    docker rm -f ${CONTAINER_NAME} || true

                    docker run -d --name ${CONTAINER_NAME}                         --network ${NETWORK_NAME}                         -p ${HOST_PORT}:${CONTAINER_PORT}                         --env-file .env                         ${IMAGE_NAME}:${IMAGE_TAG}

                    sleep 5

                    docker ps --filter "name=${CONTAINER_NAME}"
                    docker logs ${CONTAINER_NAME} | tail -n 20

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