/**
 * Jenkins CI/CD Pipeline for E-commerce Application
 * 
 * This pipeline automates the build, test, and deployment process for a Next.js e-commerce application.
 * 
 * Prerequisites:
 * - Jenkins with Docker Pipeline plugin installed
 * - GitHub credentials configured in Jenkins (ID: 'github-danors')
 * - Docker Hub credentials configured in Jenkins (ID: 'dockerhub-danors')
 * - Jenkins running with Docker socket mounted or Docker-in-Docker enabled
 * 
 * Pipeline Stages:
 * 1. Checkout - Pulls source code from GitHub repository
 * 2. Lint - Runs ESLint to check code quality and standards
 * 3. Build Docker Image - Creates production-ready Docker image
 * 4. Push Docker Image - Pushes built image to Docker Hub registry
 * 
 * Build Artifacts:
 * - Docker image: danors/ecommerce-dashboard:${BUILD_NUMBER}
 * - Pushed to Docker Hub registry for deployment
 */

pipeline {
    // Run on any available Jenkins agent
    agent any

    stages {
        /**
         * STAGE 1: CHECKOUT
         * Purpose: Fetch the latest source code from GitHub repository
         * Branch: feature/phase-3-jenkins-setup
         * Credentials: Uses GitHub Personal Access Token (github-danors)
         */
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    credentialsId: 'github-danors', 
                    url: 'https://github.com/Danor93/ecommerce-cicd-pipeline.git'
            }
        }

        /**
         * STAGE 2: LINT
         * Purpose: Run ESLint to check code quality, formatting, and adherence to coding standards
         * Environment: Uses official Node.js 20 Docker image
         * Actions:
         * - Install npm dependencies
         * - Run ESLint on the entire codebase
         * - Fail build if any linting errors are found
         */
        stage('Lint') {
            agent {
                docker {
                    image 'node:20'
                    // Run as root user to avoid permission issues
                    args '-u 0:0'
                }
            }
            steps {
                // Install all npm dependencies including dev dependencies
                sh 'npm install'
                // Run ESLint to check code quality
                sh 'npm run lint'
            }
        }

        /**
         * STAGE 3: BUILD DOCKER IMAGE
         * Purpose: Create a production-ready Docker image of the Next.js application
         * Image Name: danors/ecommerce-dashboard:${BUILD_NUMBER}
         * Process:
         * - Uses multi-stage Dockerfile for optimized production build
         * - Builds Next.js application in production mode
         * - Creates lightweight image with only runtime dependencies
         */
        stage('Build Docker Image') {
            agent any
            steps {
                script {
                    // Build Docker image with unique tag based on Jenkins build number
                    // Note: Properly declare dockerImage variable to avoid memory leaks
                    def dockerImage = docker.build("danors/ecommerce-dashboard:${env.BUILD_NUMBER}")
                    
                    // Store the image reference for use in subsequent stages
                    env.DOCKER_IMAGE_TAG = "${env.BUILD_NUMBER}"
                }
            }
        }

        /**
         * STAGE 4: PUSH DOCKER IMAGE
         * Purpose: Push the built Docker image to Docker Hub registry
         * Registry: Docker Hub (registry.hub.docker.com)
         * Credentials: Uses Docker Hub credentials (dockerhub-danors)
         * Process:
         * - Authenticate with Docker Hub
         * - Tag image with registry URL
         * - Push image to remote registry for deployment
         */
        stage('Push Docker Image') {
            agent any
            steps {
                script {
                    // Rebuild the dockerImage reference since variables don't persist across stages
                    def dockerImage = docker.image("danors/ecommerce-dashboard:${env.BUILD_NUMBER}")
                    
                    // Push to Docker Hub registry using stored credentials
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-danors') {
                        dockerImage.push()
                        // Also push the 'latest' tag for Kubernetes default pull
                        dockerImage.push('latest')
                    }
                }
            }
        }
    }

    /**
     * POST-BUILD ACTIONS
     * These actions run after all stages complete, regardless of success or failure
     */
    post {
        // Always execute these steps
        always {
            echo 'Pipeline finished.'
            
            // Clean up workspace to free disk space (optional)
            // cleanWs()
        }
        
        // Execute only on successful pipeline completion
        success {
            echo 'Pipeline succeeded!'
            echo "✅ Docker image danors/ecommerce-dashboard:${env.BUILD_NUMBER} successfully built and pushed to Docker Hub"
            
            // Optional: Send success notification
            // emailext (
            //     subject: "✅ Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            //     body: "Pipeline completed successfully. Docker image is ready for deployment.",
            //     to: "team@company.com"
            // )
        }
        
        // Execute only on pipeline failure
        failure {
            echo 'Pipeline failed!'
            echo "❌ Build failed for ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            
            // Optional: Send failure notification
            // emailext (
            //     subject: "❌ Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            //     body: "Pipeline failed. Please check the build logs for details.",
            //     to: "team@company.com"
            // )
        }
    }
}

/**
 * DEPLOYMENT NOTES:
 * 
 * After successful pipeline completion:
 * 1. Docker image is available at: danors/ecommerce-dashboard:${BUILD_NUMBER}
 * 2. Image can be deployed to various environments:
 *    - Development: docker run -p 3000:3000 danors/ecommerce-dashboard:${BUILD_NUMBER}
 *    - Production: Use docker-compose or Kubernetes with the built image
 * 
 * TROUBLESHOOTING:
 * 
 * Common Issues:
 * 1. "No such object: node:20" - Jenkins needs to pull Docker images first
 * 2. "Permission denied" - Check Docker socket permissions in docker-compose.yml
 * 3. "Authentication failed" - Verify GitHub and Docker Hub credentials in Jenkins
 * 4. "Build failed" - Check application code, dependencies, and Dockerfile
 * 
 * SECURITY CONSIDERATIONS:
 * 
 * 1. Use specific Docker image tags instead of 'latest'
 * 2. Scan Docker images for vulnerabilities before deployment
 * 3. Use non-root user in production containers
 * 4. Keep dependencies updated and scan for security issues
 * 5. Use Jenkins credentials store for sensitive information
 * 
 * OPTIMIZATION OPPORTUNITIES:
 * 
 * 1. Add automated testing stages (unit tests, integration tests)
 * 2. Implement parallel stages where possible
 * 3. Add SonarQube for code quality analysis
 * 4. Implement automatic deployment to staging environment
 * 5. Add Docker image vulnerability scanning
 * 6. Cache Docker layers and npm dependencies for faster builds
 */ 