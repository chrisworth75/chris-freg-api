pipeline {
    agent any

    environment {
        IMAGE_NAME      = "host.docker.internal:5000/chris-freg-api"
        IMAGE_TAG       = "latest"
        CONTAINER_NAME  = "chris-freg-api-test"
        HOST_PORT       = "5100"
        CONTAINER_PORT  = "8081"
        DB_CONTAINER    = "freg-db"
        DB_NAME         = "fees"
        DB_USER         = "postgres"
        DB_PASSWORD     = "postgres"
        DB_PORT         = "5432"
        NETWORK_NAME    = "freg-network"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
                    if ! docker network ls --format '{{.Name}}' | grep -w ${NETWORK_NAME}; then
                        docker network create ${NETWORK_NAME}
                    fi
                '''
            }
        }

        stage('Ensure Database') {
            steps {
                sh '''
                    if ! docker ps --format '{{.Names}}' | grep -w ${DB_CONTAINER}; then
                        echo "Database container not running — starting one..."
                        docker run -d                             --name ${DB_CONTAINER}                             --network ${NETWORK_NAME}                             -e POSTGRES_DB=${DB_NAME}                             -e POSTGRES_USER=${DB_USER}                             -e POSTGRES_PASSWORD=${DB_PASSWORD}                             -p ${DB_PORT}:${DB_PORT}                             postgres:15
                        sleep 10
                    fi
                '''
            }
        }

        stage('Run API Container') {
            steps {
                sh '''
                    # Stop & remove old container if exists
                    docker rm -f ${CONTAINER_NAME} || true

                    # Run fresh container linked to db
                    docker run -d --name ${CONTAINER_NAME}                         --network ${NETWORK_NAME}                         -p ${HOST_PORT}:${CONTAINER_PORT}                         -e DB_HOST=${DB_CONTAINER}                         -e DB_PORT=${DB_PORT}                         -e DB_USER=${DB_USER}                         -e DB_PASSWORD=${DB_PASSWORD}                         -e DB_NAME=${DB_NAME}                         ${IMAGE_NAME}:${IMAGE_TAG}

                    # Wait for app to start
                    sleep 5

                    # Show container status + logs
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
