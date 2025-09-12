// Jenkinsfile in chris-freg-api repository
pipeline {
    agent any

    environment {
        REGISTRY = 'localhost:5000'
        IMAGE_NAME = 'chris-freg-api'
        NODE_VERSION = '18'
        DB_CONTAINER = 'postgres-test'
    }

    tools {
        nodejs "${NODE_VERSION}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
                    sh 'docker exec ${DB_CONTAINER} pg_isready -U postgres'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Quality Checks') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Security Audit') {
                    steps {
                        sh 'npm audit --audit-level moderate'
                    }
                }
                stage('Unit Tests') {
                    steps {
                        sh '''
                            export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/test_db"
                            npm test
                        '''
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'test-results.xml'
                        }
                    }
                }
                stage('Integration Tests') {
                    steps {
                        sh '''
                            export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/test_db"
                            npm run test:integration
                        '''
                    }
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

        stage('Container Security Scan') {
            steps {
                script {
                    // Use trivy for container scanning (install via brew on Mac)
                    sh """
                        trivy image --exit-code 0 --severity HIGH,CRITICAL \\
                        ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
                    """
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
                    sh 'curl -f http://localhost:3000/health || exit 1'
                }
            }
        }
    }

    post {
        always {
            // Cleanup test database
            sh """
                docker stop ${DB_CONTAINER} || true
                docker rm ${DB_CONTAINER} || true
            """
            cleanWs()
        }
    }
}
