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

# 2. Apply configurations
kubectl apply -f manifests/configmap.yaml
kubectl apply -f manifests/database-init-configmap.yaml

# 3. Set up storage
kubectl apply -f manifests/persistent-volume.yaml

# 4. Deploy database
kubectl apply -f manifests/postgres-deployment.yaml

# 5. Wait for database to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n ecommerce --timeout=300s

# 6. Build and load Next.js image
docker build -t ecommerce-nextjs:latest ..
minikube image load ecommerce-nextjs:latest

# 7. Deploy Next.js application
kubectl apply -f manifests/nextjs-deployment.yaml

# 8. Optional: Deploy ingress
kubectl apply -f manifests/ingress.yaml
```

## 📁 File Structure

```
k8s/
├── manifests/
│   ├── namespace.yaml                 # Creates ecommerce namespace
│   ├── configmap.yaml                 # App configuration & secrets
│   ├── database-init-configmap.yaml   # SQL initialization script
│   ├── persistent-volume.yaml         # Storage for PostgreSQL
│   ├── postgres-deployment.yaml       # PostgreSQL database & service
│   ├── nextjs-deployment.yaml         # Next.js app & service
│   └── ingress.yaml                   # External access (optional)
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

```bash
# Forward PostgreSQL port
kubectl port-forward svc/postgres-service 5432:5432 -n ecommerce

# Connect with psql
psql -h localhost -U ecommerce_user -d ecommerce
# Password: ecommerce_password
```

### Via Pod Shell Access

```bash
# Get PostgreSQL pod name
kubectl get pods -n ecommerce -l app=postgres

# Access pod shell
kubectl exec -it <postgres-pod-name> -n ecommerce -- psql -U ecommerce_user -d ecommerce
```

## 📊 Monitoring and Debugging

### View All Resources

```bash
kubectl get all -n ecommerce
```

### Check Pod Status

```bash
# All pods in namespace
kubectl get pods -n ecommerce

# Detailed pod information
kubectl describe pod <pod-name> -n ecommerce
```

### View Logs

```bash
# Next.js application logs
kubectl logs -l app=nextjs -n ecommerce -f

# PostgreSQL logs
kubectl logs -l app=postgres -n ecommerce -f

# Logs from specific pod
kubectl logs <pod-name> -n ecommerce -f
```

### Debug Networking

```bash
# Test service connectivity
kubectl run debug --image=busybox --rm -it --restart=Never -n ecommerce -- sh

# Inside the debug pod:
nslookup postgres-service
nslookup nextjs-service
```

## 🔧 Configuration Customization

### Update Database Password

```bash
# Generate new base64 encoded password
echo -n "your_new_password" | base64

# Edit the secret
kubectl edit secret ecommerce-secrets -n ecommerce

# Restart PostgreSQL to pick up changes
kubectl rollout restart deployment/postgres-deployment -n ecommerce
```

### Scale Applications

```bash
# Scale Next.js application
kubectl scale deployment nextjs-deployment --replicas=3 -n ecommerce

# Verify scaling
kubectl get pods -n ecommerce -l app=nextjs
```

### Update Environment Variables

```bash
# Edit ConfigMap
kubectl edit configmap ecommerce-config -n ecommerce

# Restart deployments to pick up changes
kubectl rollout restart deployment/nextjs-deployment -n ecommerce
```

## 🧹 Cleanup

### Remove Everything

```bash
# Delete entire namespace (removes all resources)
kubectl delete namespace ecommerce

# Clean up persistent volumes (if needed)
kubectl delete pv postgres-pv
```

### Selective Cleanup

```bash
# Remove specific deployments
kubectl delete deployment nextjs-deployment -n ecommerce
kubectl delete deployment postgres-deployment -n ecommerce

# Remove services
kubectl delete service nextjs-service postgres-service -n ecommerce
```

## 🐛 Troubleshooting

### Common Issues

1. **Pod stuck in Pending state**

   ```bash
   kubectl describe pod <pod-name> -n ecommerce
   # Check events section for issues
   ```

2. **Database connection errors**

   ```bash
   # Check if PostgreSQL is ready
   kubectl get pods -n ecommerce -l app=postgres

   # Verify service exists
   kubectl get svc postgres-service -n ecommerce
   ```

3. **Image pull errors**

   ```bash
   # Verify image exists in minikube
   minikube image ls | grep ecommerce

   # Rebuild and reload if needed
   docker build -t ecommerce-nextjs:latest ..
   minikube image load ecommerce-nextjs:latest
   ```

4. **Storage issues**

   ```bash
   # Check persistent volume status
   kubectl get pv,pvc -n ecommerce

   # Verify mount permissions
   kubectl exec -it <postgres-pod> -n ecommerce -- ls -la /var/lib/postgresql/data
   ```

### Resource Constraints

If running on limited resources:

```bash
# Reduce resource requests in deployments
# Edit manifests and reduce CPU/memory requests

# Use single replica for development
kubectl scale deployment nextjs-deployment --replicas=1 -n ecommerce
```

## 🚀 Production Considerations

While this setup is optimized for local development with minikube, for production consider:

- **External databases** (managed PostgreSQL)
- **Horizontal Pod Autoscaling** (HPA)
- **Network policies** for security
- **Monitoring and logging** (Prometheus, Grafana, ELK stack)
- **Secrets management** (Vault, AWS Secrets Manager)
- **Image registry** (Docker Hub, AWS ECR, GCR)
- **Ingress with TLS** termination
- **Resource quotas** and limits per namespace

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [PostgreSQL on Kubernetes](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

---

🎉 **Happy Kubernetes deployment!** For any issues or questions, check the troubleshooting section above or refer to the official Kubernetes documentation.

## 🛠️ CI/CD with Jenkins

The application's automated pipeline continues to run from the root–level **`docker-compose.yml`**.  
Start (or restart) Jenkins alongside your Kubernetes cluster with:

```bash
# From the project root
docker compose up -d jenkins
```

Key points:

1. The Jenkins container talks to the host Docker daemon via `/var/run/docker.sock`, so images it builds are immediately visible to Minikube (when using the default **docker driver**).
2. After the image is built, the pipeline can either:
   - Load it straight into the cluster: `minikube image load <image>:<tag>` (local only), or
   - Push to a registry and let Kubernetes pull it.
3. Deployment stages in your `Jenkinsfile` should execute `kubectl apply …` commands (or Helm) using a mounted kube-config (e.g., mount `~/.kube` into the Jenkins container).

If you prefer an all-in-cluster approach, you can deploy Jenkins to Kubernetes later (Helm chart recommended), but keeping it in Docker-Compose is perfectly fine for local development.
