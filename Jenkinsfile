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
                        -p 5437:5432 \\
                        postgres:15-alpine
                    """

                    // Wait for database to be ready
                    sh 'sleep 10'
                    sh 'docker exec ${DB_CONTAINER} pg_isready -U postgres || echo "Database not ready yet"'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "Installing Node.js dependencies..."
                    npm install
                    echo "Dependencies installed successfully"
                '''
            }
        }

        stage('Generate Postman Collection') {
            steps {
                sh '''
                    echo "Generating Postman collection..."
                    npm run build:collection
                    echo "Collection generated successfully"
                    ls -la build/
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        docker build -t ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} .
                        docker tag ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} ${REGISTRY}/${IMAGE_NAME}:latest
                        docker push ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
                        docker push ${REGISTRY}/${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'build/api-collection.json', fingerprint: true, allowEmptyArchive: true
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Kill any process using port 5100
                    sh """
                        echo "Killing any process using port 5100..."
                        lsof -ti:5100 | xargs kill -9 || true
                    """

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

                    sh 'sleep 10'

                    // Initialize database schema and data
                    sh """
                        cat db-init/01-schema.sql | docker exec -i freg-db psql -U postgres -d fees
                        cat db-init/02-data.sql | docker exec -i freg-db psql -U postgres -d fees
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
                    // Wait for API to be healthy with retries
                    sh '''
                        echo "⏳ Waiting for API to be healthy..."
                        for i in {1..30}; do
                            if curl -f -s http://localhost:5100/health > /dev/null 2>&1; then
                                echo "✅ API is healthy after $((i * 10)) seconds"
                                break
                            elif [ $i -eq 30 ]; then
                                echo "❌ API failed to become healthy after 300 seconds"
                                exit 1
                            else
                                echo "⏳ Attempt $i/30: API not ready, waiting 10s..."
                                sleep 10
                            fi
                        done
                    '''
                }
            }
        }

        stage('API Tests') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Use Docker to run Newman tests to avoid Node.js environment issues
                    sh '''
                        echo "🧪 Running API test suite using Docker..."

                        # Run Newman in a Docker container to avoid environment issues
                        docker run --rm \\
                            --network host \\
                            -v "$(pwd)/tests:/tests" \\
                            -v "$(pwd)/package.json:/package.json" \\
                            --workdir / \\
                            node:18-alpine sh -c "
                                npm install -g newman
                                newman run /tests/postman/fees-api.postman_collection.json \\
                                    -e /tests/environments/docker.postman_environment.json \\
                                    --reporters cli,json \\
                                    --reporter-json-export /tests/test-results.json
                            "

                        # Copy results back to workspace
                        cp tests/test-results.json . || echo "No test results file found"
                    '''
                }
            }
            post {
                always {
                    // Archive test results
                    archiveArtifacts artifacts: 'test-results.json', allowEmptyArchive: true
                }
                success {
                    echo '✅ All API tests passed!'
                }
                failure {
                    echo '❌ API tests failed - check test results'
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