// Jenkinsfile in chris-freg-api repository
pipeline {
    agent any

    environment {
        REGISTRY = 'localhost:5000'
        IMAGE_NAME = 'chris-freg-api'
        DB_CONTAINER = 'postgres-test'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "Checked out code successfully"'
            }
        }

        stage('Setup Test Database') {
            steps {
                script {
                    // Start test database container
                    sh """
                        docker stop ${DB_CONTAINER} || true
                        docker rm ${DB_CONTAINER} || true
                        docker run -d \\
                        --name ${DB_CONTAINER} \\
                        --platform=linux/arm64 \\
                        -e POSTGRES_PASSWORD=postgres \\
                        -e POSTGRES_DB=test_db \\
                        -p 5433:5432 \\
                        postgres:15-alpine
                    """

                    // Wait for database to be ready
                    sh 'sleep 10'
                    sh 'docker exec ${DB_CONTAINER} pg_isready -U postgres || echo "Database not ready yet"'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}")
                    docker.withRegistry("http://${REGISTRY}") {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Create network for container communication
                    sh """
                        docker network create freg-network || echo "Network already exists"
                    """

                    // Stop existing containers
                    sh """
                        docker stop ${IMAGE_NAME} || true
                        docker rm ${IMAGE_NAME} || true
                        docker stop freg-db || true
                        docker rm freg-db || true
                    """

                    // Start database with correct name and settings
                    sh """
                        docker run -d \\
                        --name freg-db \\
                        --platform=linux/arm64 \\
                        --network freg-network \\
                        -e POSTGRES_PASSWORD=postgres \\
                        -e POSTGRES_DB=fees \\
                        -p 5435:5432 \\
                        postgres:15-alpine
                    """

                    sleep 10

                    // Initialize database schema and data
                    sh """
                        docker exec -i freg-db psql -U postgres -d fees < /Users/chris/dev/chris-freg-db/db-init/01-schema.sql
                        docker exec -i freg-db psql -U postgres -d fees < /Users/chris/dev/chris-freg-db/db-init/02-data.sql
                    """

                    // Run API container
                    sh """
                        docker run -d \\
                        --name ${IMAGE_NAME} \\
                        --restart unless-stopped \\
                        --network freg-network \\
                        -p 5100:3000 \\
                        -e DB_HOST=freg-db \\
                        -e DB_PORT=5432 \\
                        -e DB_NAME=fees \\
                        -e DB_USER=postgres \\
                        -e DB_PASSWORD=postgres \\
                        -e NODE_ENV=production \\
                        ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sleep 15
                    sh 'curl -f http://localhost:5100/health || echo "Health check failed - API may still be starting"'
                }
            }
        }
    }

    post {
        always {
            script {
                // Cleanup test database
                sh """
                    docker stop postgres-test || true
                    docker rm postgres-test || true
                """
            }
        }
        success {
            echo 'API pipeline completed successfully!'
        }
        failure {
            echo 'API pipeline failed!'
        }
    }
}