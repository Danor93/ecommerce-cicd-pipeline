# CI/CD Pipeline Exercise - Task Description

## 🎯 **Task**

Build a complete CI/CD pipeline for a Next.js e-commerce dashboard using Jenkins, Docker, Kubernetes, and ArgoCD concepts.

---

## 📱 **What need to be Building**

A Next.js e-commerce dashboard with:

- User login/authentication
- Product management (add, edit, delete products)
- Dashboard with charts/analytics
- Health check API endpoint
- Database integration (SQLite or PostgreSQL)

---

## 🏗️ **Phase 1: Build the App**

**Task:** Create a Next.js application with these pages/features:

- `/login` - User authentication page
- `/dashboard` - Main dashboard with product stats
- `/api/auth/login` - Login API endpoint
- `/api/products` - CRUD operations for products
- `/api/health` - Health check endpoint
- Database setup with at least a Users and Products table

**Goal:** Working Next.js app that you can run locally with `npm run dev`

---

## 🐳 **Phase 2: Containerize**

**Task:**

- Write a Dockerfile for your Next.js app
- Create a docker-compose.yml with your app + database
- Make sure your containerized app works locally

**Goal:** Your app runs in Docker containers and you can access it at `http://localhost:3000`

---

## 🔧 **Phase 3: Set Up Jenkins**

**Task:**

- Run Jenkins locally in Docker
- Create a Jenkinsfile that:
  - Checks out your code from Git
  - Runs tests (npm test)
  - Builds Docker image
  - Pushes image to a registry (or saves locally)

**Goal:** Automated pipeline that builds your app when you push to Git

---

## ☸️ **Phase 4: Deploy to Kubernetes**

**Task:**

- Install minikube locally
- Create Kubernetes manifests:
  - Deployment for your app
  - Service to expose your app
  - ConfigMap for environment variables
  - Secret for sensitive data (JWT secret, DB password)
- Deploy your app to the local cluster

**Goal:** Your app running in Kubernetes, accessible via port-forward or ingress

---

## 🚀 **Phase 5: GitOps with ArgoCD**

**Task:**

- Install ArgoCD in your minikube cluster
- Create an ArgoCD application that:
  - Watches your Git repository
  - Automatically deploys changes to Kubernetes
  - Shows deployment status in the ArgoCD UI

**Goal:** When you push changes to Git → Jenkins builds → ArgoCD deploys automatically

## 🛠️ **Required Tools**

Install these on your machine:

- Node.js & npm
- Docker & Docker Compose
- minikube
- kubectl
- Git
- Jenkins (run in Docker)
