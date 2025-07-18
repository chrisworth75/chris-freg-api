pipeline {
    agent any

    environment {
        IMAGE_NAME = "host.docker.internal:5000/chris-freg-api"
        IMAGE_TAG = "latest"
    }

    stages {
   checkout([
     $class: 'GitSCM',
     branches: [[name: '*/main']],
     userRemoteConfigs: [[
       url: 'https://github.com/chrisworth75/chris-freg-api.git',
       credentialsId: '6205b4c9-56e2-485b-a394-9c28c576a131'
     ]]
   ])


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
