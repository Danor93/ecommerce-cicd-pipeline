# ArgoCD Implementation for E-commerce CI/CD Pipeline

This document provides a comprehensive guide for the ArgoCD implementation that completes Phase 5 of the CI/CD pipeline project.

## 🎯 Overview

This implementation follows GitOps best practices with:

- **App of Apps Pattern** for declarative application management
- **Environment-based directory structure**
- **Local minikube development** with proper tooling
- **Integration with existing Jenkins CI pipeline**
- **Automated sync policies** with self-healing capabilities

## 📁 Directory Structure

```
k8s/
├── argocd/
│   ├── bootstrap/
│   │   └── app-of-apps.yaml          # Main App of Apps application
│   ├── applications/
│   │   └── ecommerce-app.yaml        # E-commerce application definition
│   ├── projects/
│   │   └── ecommerce-project.yaml    # ArgoCD project for RBAC
│   └── kustomization.yaml            # Kustomize resources
├── manifests/                        # Existing Kubernetes manifests
├── setup-argocd.sh                   # ArgoCD installation script
├── manage-argocd.sh                  # ArgoCD management script
└── README-ARGOCD.md                  # This documentation
```

## 🚀 Quick Start

### Step 1: Install ArgoCD

```bash
# Ensure minikube is running
minikube start

# Install ArgoCD
cd k8s
./manage-argocd.sh install
```

### Step 2: Bootstrap Applications

```bash
# Bootstrap the App of Apps pattern
./manage-argocd.sh bootstrap
```

### Step 3: Access ArgoCD UI

```bash
# Start the UI (runs port-forward)
./manage-argocd.sh ui
```

Open your browser to: http://localhost:8090

Tip: from the unified `k8s/menu.sh` you can now choose:
• Option **15** – _Full ArgoCD Setup_ (install → bootstrap → UI)
• Option **16** – _Open/Expose Prometheus_ from the new **monitoring** application

Login credentials will be displayed in the terminal.

## 🔧 Management Commands

The `manage-argocd.sh` script provides easy management:

```bash
# Basic commands
./manage-argocd.sh install      # Install ArgoCD
./manage-argocd.sh bootstrap    # Setup App of Apps
./manage-argocd.sh ui           # Start UI
./manage-argocd.sh status       # Check status
./manage-argocd.sh sync         # Sync all apps
./manage-argocd.sh password     # Get admin password

# Advanced commands
./manage-argocd.sh login        # Login to CLI
./manage-argocd.sh logs         # View logs
./manage-argocd.sh restart      # Restart server
./manage-argocd.sh uninstall    # Remove ArgoCD
```

## 🏗️ Architecture

### GitOps Workflow

```
Developer → Git Push → Jenkins CI → Docker Hub → ArgoCD → Kubernetes
```

1. **Developer** commits code changes
2. **Jenkins** builds and pushes Docker images
3. **ArgoCD** detects Git changes and deploys to Kubernetes
4. **Kubernetes** runs the updated application

### App of Apps Pattern

```
app-of-apps (ArgoCD Application)
├── ecommerce-project (ArgoCD Project)
└── ecommerce-app (ArgoCD Application)
    ├── nextjs-deployment
    ├── postgres-deployment
    ├── configmap
    └── services
```

## 🔐 Security Features

### RBAC Configuration

The `ecommerce-project` includes role-based access control:

- **Admin Role**: Full access to applications and repositories
- **Developer Role**: Read and sync access only

### Sync Windows

Automated deployments are:

- **Allowed**: 6 AM - 6 PM (12 hours)
- **Denied**: 10 PM - 4 AM (6 hours) for maintenance

### Secret Management

- Repository credentials stored as Kubernetes secrets
- Admin passwords auto-generated and base64 encoded
- Integration with existing ConfigMap/Secret structure

## 🔄 Integration with Jenkins

The existing Jenkins pipeline continues to work with ArgoCD:

### Current CI Flow

```
Jenkins Pipeline:
1. Checkout code
2. Run lint tests
3. Build Docker image
4. Push to Docker Hub (danors/ecommerce-dashboard:latest)
```

### GitOps CD Flow

```
ArgoCD:
1. Monitors Git repository for changes
2. Detects manifest updates
3. Syncs to Kubernetes cluster
4. Ensures desired state matches actual state
```

### Automatic Deployment

When Jenkins pushes a new image with the `latest` tag, ArgoCD will:

1. Detect the image update
2. Automatically sync the deployment
3. Apply rolling updates with zero downtime
4. Self-heal if configurations drift

## 📊 Monitoring and Observability

### Application Status

```bash
# Check all applications
./manage-argocd.sh status

# Via ArgoCD CLI
argocd app list
argocd app get ecommerce-app
```

### Health Checks

ArgoCD provides built-in health checks for:

- Deployment readiness
- Pod status
- Service availability
- Database connectivity

### Sync Status

- **Synced**: Application matches Git state
- **OutOfSync**: Git changes detected
- **Unknown**: Unable to determine state

## 🛠️ Troubleshooting

### Common Issues

1. **ArgoCD UI not accessible**

   ```bash
   # Check if port-forward is running
   ./manage-argocd.sh ui
   ```

2. **Application stuck in "Progressing"**

   ```bash
   # Check pod status
   kubectl get pods -n ecommerce

   # Check ArgoCD logs
   ./manage-argocd.sh logs
   ```

3. **Sync failures**

   ```bash
   # Manual sync
   ./manage-argocd.sh sync

   # Check application details
   argocd app get ecommerce-app
   ```

### Debug Commands

```bash
# Check ArgoCD pods
kubectl get pods -n argocd

# Check application events
kubectl describe application ecommerce-app -n argocd

# View application logs
kubectl logs -n ecommerce deployment/nextjs-deployment
```

## 🔄 Updates and Maintenance

### Updating Applications

1. **Code Changes**: Commit to Git → Jenkins builds → Manual sync if needed
2. **Configuration Changes**: Update manifests → Git push → Auto sync
3. **Infrastructure Changes**: Update ArgoCD applications → Git push → Auto sync

### ArgoCD Updates

```bash
# Update ArgoCD itself
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Restart ArgoCD
./manage-argocd.sh restart
```

### Backup and Recovery

```bash
# Backup ArgoCD configuration
kubectl get applications -n argocd -o yaml > argocd-backup.yaml

# Restore applications
kubectl apply -f argocd-backup.yaml
```

## 🚀 Production Considerations

### Multi-Environment Setup

For production use, consider:

1. **Separate Git branches** for environments (dev/staging/prod)
2. **Environment-specific ArgoCD instances**
3. **External secret management** (HashiCorp Vault, AWS Secrets Manager)
4. **Image scanning and security policies**

### Scaling

- Use **ApplicationSets** for managing multiple similar applications
- Implement **progressive delivery** with Argo Rollouts
- Set up **monitoring and alerting** with Prometheus/Grafana

### High Availability

- Run ArgoCD in HA mode with multiple replicas
- Use external Redis for session storage
- Implement proper backup strategies

## 📚 Additional Resources

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitOps Principles](https://www.gitops.tech/)
- [App of Apps Pattern](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/)
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)

## 🎉 Conclusion

This ArgoCD implementation completes your CI/CD pipeline with:

✅ **Automated deployments** from Git  
✅ **GitOps best practices** with App of Apps  
✅ **Local development** with minikube  
✅ **Integration** with existing Jenkins CI  
✅ **Security** with RBAC and sync windows  
✅ **Monitoring** and observability  
✅ **Self-healing** capabilities

Your e-commerce application now has a complete, production-ready CI/CD pipeline!
