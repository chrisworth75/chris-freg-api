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
                    // Stop existing containers
                    sh """
                        docker stop ${IMAGE_NAME} || true
                        docker rm ${IMAGE_NAME} || true
                        docker stop postgres-prod || true
                        docker rm postgres-prod || true
                    """

                    // Clean up any existing postgres containers using port 5432
                    sh """
                        docker ps -a --filter "publish=5432" --format "{{.Names}}" | xargs -r docker stop || true
                        docker ps -a --filter "publish=5432" --format "{{.Names}}" | xargs -r docker rm || true
                    """
                    
                    // Start production database
                    sh """
                        docker run -d \\
                        --name postgres-prod \\
                        --platform=linux/arm64 \\
                        -e POSTGRES_PASSWORD=prodpassword \\
                        -e POSTGRES_DB=freg_prod \\
                        -p 5432:5432 \\
                        -v postgres-data:/var/lib/postgresql/data \\
                        postgres:15-alpine
                    """

                    sleep 10

                    // Run API container
                    sh """
                        docker run -d \\
                        --name ${IMAGE_NAME} \\
                        --restart unless-stopped \\
                        -p 3000:3000 \\
                        --link postgres-prod:db \\
                        -e DATABASE_URL="postgresql://postgres:prodpassword@db:5432/freg_prod" \\
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
                    sh 'curl -f http://localhost:3000/health || echo "Health check failed - API may still be starting"'
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