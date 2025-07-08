# E-Commerce Application - Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the e-commerce Next.js application with PostgreSQL database using 2025 best practices.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                      │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Ingress    │    │   Next.js    │    │ PostgreSQL   │ │
│  │   Gateway    │────│   Service    │────│   Service    │ │
│  │              │    │  (2 replicas)│    │ (1 replica)  │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│                             │                      │       │
│                             │                      │       │
│                       ┌─────────────┐    ┌──────────────┐ │
│                       │ ConfigMaps  │    │   PV/PVC     │ │
│                       │ & Secrets   │    │ (Database)   │ │
│                       └─────────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 🔥 Easiest Way — Unified Management Menu

```bash
cd k8s
./menu.sh
```

Use the interactive menu to:

1. Deploy the stack (with optional image build)
2. View live status of all resources
3. Clean up the namespace / cluster (basic or deep-prune)
4. Run **Full ArgoCD setup** (option 15) – install, bootstrap, and open the UI
5. Expose **Prometheus monitoring** (option 16) and open the dashboard

> Note: the ArgoCD UI is forwarded to **http://localhost:8090**.

---

### Prerequisites

1. **Minikube** installed and running:

   ```bash
   # Install minikube (macOS with Homebrew)
   brew install minikube

   # Start minikube
   minikube start

   # Verify cluster is running
   kubectl cluster-info
   ```

2. **Docker** installed for building images

3. **Optional**: NGINX Ingress Controller
   ```bash
   minikube addons enable ingress
   ```

### Deploy Everything with One Command

```bash
# Navigate to k8s directory
cd k8s

# Deploy with auto-building Docker image
./deploy.sh --build

# Or deploy without rebuilding (if image exists)
./deploy.sh
```

### Manual Deployment Steps

If you prefer to deploy step by step:

```bash
# 1. Create namespace
kubectl apply -f manifests/namespace.yaml

# 2. Apply all application resources via Kustomize (everything except Ingress)
kubectl apply -k manifests

# 3. Wait for database to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n ecommerce --timeout=300s

# 4. Build and load Next.js image
docker build -t ecommerce-nextjs:latest ..
minikube image load ecommerce-nextjs:latest

# 5. Optional: Deploy ingress (after NGINX-ingress addon is ready)
kubectl apply -f manifests/ingress.yaml
```

## 📁 File Structure

```
k8s/
├── manifests/
│   ├── kustomization.yaml             # Declarative list of core resources (no Ingress)
│   ├── namespace.yaml                 # Creates ecommerce namespace
│   ├── configmap.yaml                 # App configuration & secrets
│   ├── database-init-configmap.yaml   # SQL initialization script
│   ├── persistent-volume.yaml         # Storage for PostgreSQL
│   ├── postgres-deployment.yaml       # PostgreSQL database & service
│   ├── nextjs-deployment.yaml         # Next.js app & service
│   └── ingress.yaml                   # External access (applied separately)
├── deploy.sh                          # Deploy resources & (optional) build image
├── status.sh                          # Detailed status report of cluster
├── cleanup.sh                         # Tear-down namespace / cluster
├── menu.sh                            # Interactive menu (deploy · status · cleanup)
└── README.md                          # This file
```

## 🎯 Key Features

### 🔧 Configuration Management

- **Database credentials** stored in Kubernetes Secrets (base64 encoded)
- **Application settings** in ConfigMaps for easy environment management
- **Database initialization** via ConfigMap mounting to `/docker-entrypoint-initdb.d/`

### 📊 Resource Allocation

| Component  | CPU Request | CPU Limit | Memory Request | Memory Limit |
| ---------- | ----------- | --------- | -------------- | ------------ |
| PostgreSQL | 250m        | 500m      | 256Mi          | 512Mi        |
| Next.js    | 250m        | 500m      | 256Mi          | 512Mi        |

### 🔍 Health Monitoring

Both applications include:

- **Liveness probes**: Restart containers if unhealthy
- **Readiness probes**: Remove from service if not ready to serve traffic

## 🌐 Accessing the Application

### Option 1: Port Forwarding (Recommended for Development)

```bash
# Forward Next.js application
kubectl port-forward svc/nextjs-service 3000:3000 -n ecommerce

# Access at: http://localhost:3000
```

### Option 2: Ingress (If NGINX Ingress is enabled)

```bash
# Get minikube IP
minikube ip

# Add to /etc/hosts
echo "$(minikube ip) ecommerce.local" | sudo tee -a /etc/hosts

# Access at: http://ecommerce.local
```

### Option 3: Direct Service Access

```bash
# Get service URL
minikube service nextjs-service -n ecommerce --url
```

## 🗄️ Database Access

### Via Port Forwarding

```

```
