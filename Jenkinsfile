pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'feature/phase-3-jenkins-setup', credentialsId: 'github-danors', url: 'https://github.com/danors/ecommerce-cicd-pipeline.git'
            }
        }
        stage('Lint') {
            agent {
                docker {
                    image 'node:20'
                    args '-u 0:0'
                }
            }
            steps {
                sh 'npm install'
                sh 'npm run lint'
            }
        }
        stage('Build Docker Image') {
            agent any
            steps {
                script {
                    // Use Docker in Docker or host's Docker daemon via mounted socket
                    // The 'privileged: true' and 'volumes' in docker-compose.yml should enable this
                    dockerImage = docker.build("danors/ecommerce-dashboard:${env.BUILD_NUMBER}")
                }
            }
        }
        stage('Push Docker Image') {
            agent any
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