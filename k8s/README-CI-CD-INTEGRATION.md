# 🔄 Jenkins CI + ArgoCD GitOps Integration

This document explains how to integrate your Jenkins CI pipeline with ArgoCD GitOps for automated deployments.

## 🎯 Overview

**Current Workflow:**

```Developer → Git Push → Jenkins CI → Docker Hub → ArgoCD → Kubernetes

```

1. **Developer** commits code changes to Git
2. **Jenkins** builds and pushes Docker images (`danors/ecommerce-dashboard:${BUILD_NUMBER}`)
3. **ArgoCD Image Updater** detects new Docker images
4. **Automatically updates** Git repository with new image tags
5. **ArgoCD** syncs and deploys the updated application

## 🚀 Setup Instructions

### Step 1: Install ArgoCD Image Updater

From the unified menu:

```bash
cd k8s
./menu.sh
# Choose option 14: Install Image Updater
```

Or manually:

```bash
./manage-argocd.sh image-updater
```

### Step 2: Verify Configuration

The NextJS deployment is already configured with Image Updater annotations:

```yaml
metadata:
  annotations:
    # ArgoCD Image Updater configuration
    argocd-image-updater.argoproj.io/image-list: ecommerce=danors/ecommerce-dashboard
    argocd-image-updater.argoproj.io/write-back-method: git
    argocd-image-updater.argoproj.io/git-branch: feature/argocd-implementation
```

### Step 3: Test the Integration

1. **Make a code change** in your application
2. **Commit and push** to trigger Jenkins
3. **Jenkins will build** a new Docker image (e.g., `danors/ecommerce-dashboard:45`)
4. **Image Updater detects** the new image within 2 minutes
5. **Automatically commits** the updated image tag to Git
6. **ArgoCD syncs** the new version to Kubernetes

## 🔧 How It Works

### Jenkins CI Pipeline

Your current `Jenkinsfile` builds images with tags:

- `danors/ecommerce-dashboard:${BUILD_NUMBER}` (e.g., `:45`)
- `danors/ecommerce-dashboard:latest`

### ArgoCD Image Updater

The Image Updater component:

- **Polls Docker Hub** every 2 minutes for new image tags
- **Detects semantic versioning** or latest tags
- **Updates the Git repository** automatically
- **Commits changes** with a standardized message

### GitOps Sync

When the Git repository is updated:

- **ArgoCD detects** the manifest changes
- **Automatically syncs** if auto-sync is enabled
- **Deploys** the new version with zero downtime

## 📊 Monitoring & Verification

### Check Image Updater Status

```bash
# View Image Updater logs
kubectl logs -n argocd deployment/argocd-image-updater -f

# Check Image Updater pods
kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-image-updater
```

### Verify Application Status

```bash
# Check ArgoCD applications
./manage-argocd.sh status

# Or use the menu
./menu.sh  # Option 13: Show ArgoCD status
```

### View Git Commits

Image Updater will create commits like:

```
build: automatic update of ecommerce

Updates image danors/ecommerce-dashboard:45 -> danors/ecommerce-dashboard:46
```

## 🔄 Alternative Approaches

If you prefer different approaches, here are alternatives:

### Option A: Jenkins Updates Git (Push-based)

Add a stage to your Jenkinsfile:

```groovy
stage('Update Kubernetes Manifests') {
    steps {
        script {
            // Update the deployment YAML with new image tag
            sh """
                sed -i 's|danors/ecommerce-dashboard:.*|danors/ecommerce-dashboard:${BUILD_NUMBER}|' k8s/manifests/nextjs-deployment.yaml
                git add k8s/manifests/nextjs-deployment.yaml
                git commit -m "Update image to build ${BUILD_NUMBER}"
                git push origin main
            """
        }
    }
}
```

### Option B: Webhook Trigger

Configure Jenkins to call ArgoCD webhook after image push:

```groovy
stage('Trigger ArgoCD Sync') {
    steps {
        script {
            sh """
                curl -X POST http://argocd-server:80/api/v1/applications/ecommerce-app/sync \
                     -H "Authorization: Bearer \${ARGOCD_TOKEN}"
            """
        }
    }
}
```

### Option C: Image Pull Policy Always

Update deployment to always pull latest:

```yaml
spec:
  template:
    spec:
      containers:
        - name: nextjs
          image: danors/ecommerce-dashboard:latest
          imagePullPolicy: Always
```

## 🔐 Security Considerations

### Git Access

Image Updater needs write access to your Git repository. For private repos:

1. **Create a Personal Access Token** in GitHub
2. **Create a secret** in Kubernetes:

```bash
kubectl create secret generic git-creds \
  --from-literal=username=your-username \
  --from-literal=password=your-token \
  -n argocd
```

3. **Update Image Updater config** to use the secret

### Image Registry

For private Docker registries, configure registry credentials:

```bash
kubectl create secret docker-registry docker-creds \
  --docker-server=registry.hub.docker.com \
  --docker-username=your-username \
  --docker-password=your-password \
  -n argocd
```

## 🚨 Troubleshooting

### Image Updater Not Working

1. **Check logs:**

```bash
kubectl logs -n argocd deployment/argocd-image-updater
```

2. **Verify annotations:**

```bash
kubectl get deployment nextjs-deployment -n ecommerce -o yaml | grep argocd-image-updater
```

3. **Check image registry connectivity:**

```bash
kubectl exec -n argocd deployment/argocd-image-updater -- curl -I https://registry.hub.docker.com/v2/
```

### ArgoCD Not Syncing

1. **Check application status:**

```bash
./manage-argocd.sh status
```

2. **Manual sync:**

```bash
./manage-argocd.sh sync
```

3. **Check ArgoCD server logs:**

```bash
./manage-argocd.sh logs
```

### Common Issues

1. **"Permission denied" for Git:** Set up proper Git credentials
2. **"Image not found":** Verify Docker Hub image exists and is public
3. **"Sync failed":** Check Kubernetes manifests are valid

## 📈 Benefits

✅ **Fully Automated** - Zero manual intervention required  
✅ **GitOps Compliant** - All changes tracked in Git  
✅ **Zero Downtime** - Rolling updates with health checks  
✅ **Audit Trail** - Complete history of deployments  
✅ **Rollback Capable** - Easy rollback via Git history  
✅ **Scalable** - Works with multiple applications and environments

## 🎉 Next Steps

1. **Test the complete workflow** by making a code change
2. **Set up branch policies** to deploy different branches to different environments
3. **Add monitoring and alerting** for failed deployments
4. **Implement proper tagging strategies** (semantic versioning)
5. **Set up staging environments** for testing before production

---

**🔗 Related Documentation:**

- [ArgoCD Setup Guide](./README-ARGOCD.md)
- [Kubernetes Deployment Guide](./README.md)
- [Main Project Documentation](../README.md)
