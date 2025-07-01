pipeline {
    agent any

    tools {
        // Assuming Node.js is installed on the Jenkins agent
        // If not, you might need a custom Docker agent image with Node.js
        nodejs 'nodejs'
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/danors/ecommerce-cicd-pipeline.git', branch: 'feature/phase-3-jenkins-setup'
            }
        }
        stage('Lint') {
            steps {
                sh 'npm install'
                sh 'npm run lint'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    // Use Docker in Docker or host's Docker daemon via mounted socket
                    // The 'privileged: true' and 'volumes' in docker-compose.yml should enable this
                    dockerImage = docker.build("danors/ecommerce-dashboard:${env.BUILD_NUMBER}")
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    // Replace 'dockerhub-credentials' with the actual ID of your Docker Hub credentials in Jenkins
                    // You need to configure this in Jenkins UI: Manage Jenkins -> Credentials
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-danors') {
                        dockerImage.push()
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
} 