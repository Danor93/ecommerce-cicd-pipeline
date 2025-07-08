# 🚀 Installation & Setup Guide

This guide provides comprehensive instructions for setting up the E-Commerce Admin Dashboard with Jenkins CI/CD pipeline and ArgoCD GitOps integration.

## 🎯 Setup Options

Choose your preferred setup method:

- **🚀 Option 1: Complete GitOps Setup** (Recommended) - One-click deployment with ArgoCD automation
- **🐳 Option 2: Traditional Docker Compose** - Manual deployment for learning or testing
- **⚙️ Option 3: Kubernetes + Manual ArgoCD** - Step-by-step GitOps configuration

## 📋 Prerequisites

### For All Setup Options:

- **Docker** (version 20.10 or higher)
- **Git** (for repository management)
- **Node.js 18.x or higher** (for local development, optional)

### For GitOps Setup (Option 1 & 3):

- **Kubernetes cluster** (minikube, kind, k3s, or cloud provider)
- **kubectl** (version 1.20 or higher)
- **Docker Compose** (version 2.0 or higher) - for Jenkins CI/CD

### For Traditional Setup (Option 2):

- **Docker Compose** (version 2.0 or higher)

### System Requirements

- **Operating System**: macOS, Linux, or Windows with WSL2
- **RAM**: Minimum 6GB (8GB+ recommended for Kubernetes)
- **Storage**: At least 10GB free space
- **Network**: Internet connection for downloading Docker images and dependencies

### Quick Kubernetes Setup

If you don't have Kubernetes running:

```bash
# Install minikube (recommended for local development)
# macOS
brew install minikube

# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start Kubernetes cluster
minikube start --memory=4096 --cpus=4
```

## 🚀 Option 1: Complete GitOps Setup (Recommended)

This is the fastest way to get everything running with full automation.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Danor93/ecommerce-cicd-pipeline.git
cd ecommerce-cicd-pipeline
```

### Step 2: One-Click Setup

```bash
cd k8s && ./menu.sh
# Choose option 17: Deploy Everything + GitOps
```

This will automatically:

1. ✅ Deploy the e-commerce application (Next.js + PostgreSQL)
2. ✅ Install ArgoCD GitOps engine
3. ✅ Install ArgoCD Image Updater for automatic deployments
4. ✅ Bootstrap applications via GitOps
5. ✅ Open ArgoCD UI for monitoring

### Step 3: Access Your Applications

After setup completes:

```bash
# Access the application
kubectl port-forward -n ecommerce svc/nextjs-service 3000:3000
# → http://localhost:3000

# ArgoCD UI (automatically opened by setup)
# → http://localhost:8090

# Setup Jenkins for CI/CD (see Jenkins section below)
```

### Step 4: Verify GitOps Workflow

1. **Check ArgoCD Apps**: Go to http://localhost:8090
2. **Default login**: `admin` / Get password with:
   ```bash
   kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
   ```

**That's it!** Your complete GitOps environment is ready. Jump to the [Jenkins CI/CD Setup](#-jenkins-cicd-pipeline-setup) section to enable automatic builds.

## ⚙️ Option 3: Manual ArgoCD Setup

For learning or custom configuration:

### Step 1: Deploy Application First

```bash
cd k8s && ./menu.sh
# Choose option 1: Deploy application
```

### Step 2: Install ArgoCD

```bash
cd k8s && ./menu.sh
# Choose option 10: Install ArgoCD
```

### Step 3: Install Image Updater

```bash
cd k8s && ./menu.sh
# Choose option 14: Install Image Updater
```

### Step 4: Bootstrap Applications

```bash
cd k8s && ./menu.sh
# Choose option 11: Bootstrap ArgoCD Apps
```

### Step 5: Access ArgoCD UI

```bash
cd k8s && ./menu.sh
# Choose option 12: Open ArgoCD UI
```

## 🐳 Option 2: Traditional Docker Compose Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Danor93/ecommerce-cicd-pipeline.git
cd ecommerce-cicd-pipeline
```

### Step 2: Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

**Default Environment Variables** (suitable for local development):

```env
# Database Configuration
POSTGRES_DB=ecommerce_db
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=ecommerce_password
DATABASE_URL=postgresql://ecommerce_user:ecommerce_password@db:5432/ecommerce_db

# Application Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Step 3: Launch the Application

**Start all services** (PostgreSQL database, Next.js app, and Jenkins):

```bash
docker-compose up --build -d
```

This command will:

- Build the Next.js application Docker image
- Start PostgreSQL database container
- Initialize database schema from `db/init.sql`
- Start Jenkins container for CI/CD
- Create necessary Docker networks

### Step 4: Verify Installation

1. **Application**: Open [http://localhost:3000](http://localhost:3000)
2. **Jenkins**: Open [http://localhost:8080](http://localhost:8080)
3. **Database**: PostgreSQL runs on `localhost:5432`

## 🔄 GitOps Workflow Overview

Once you have ArgoCD set up (via Option 1 or 3), your development workflow becomes:

```
Developer → Git Push → Jenkins CI → Docker Hub → ArgoCD → Kubernetes
```

### How It Works:

1. **Code Changes**: Make changes and push to Git repository
2. **Jenkins Builds**: Automatically triggered, builds Docker image `danors/ecommerce-dashboard:BUILD_NUMBER`
3. **Image Registry**: Jenkins pushes image to Docker Hub
4. **ArgoCD Detects**: Image Updater polls Docker Hub every 2 minutes for new images
5. **Git Update**: ArgoCD automatically commits updated image tag to Git
6. **Deployment**: ArgoCD syncs changes and deploys to Kubernetes

### Monitoring GitOps:

```bash
# Check ArgoCD application status
cd k8s && ./menu.sh  # Option 13: Show ArgoCD status

# View ArgoCD UI
cd k8s && ./menu.sh  # Option 12: Open ArgoCD UI

# Check Image Updater logs
kubectl logs -n argocd deployment/argocd-image-updater -f
```

## 🔧 Jenkins CI/CD Pipeline Setup

**Note**: If you used Option 1 (Complete GitOps Setup), you still need to configure Jenkins for CI/CD integration. The ArgoCD setup enables automatic deployments, but Jenkins handles the build process.

### Step 1: Initial Jenkins Configuration

1. **Access Jenkins**: Navigate to [http://localhost:8080](http://localhost:8080)

2. **Get Initial Admin Password**:

   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```

3. **Complete Setup Wizard**:
   - Use the password from step 2
   - Select "Install suggested plugins"
   - Create an admin user account
   - Keep default Jenkins URL: `http://localhost:8080`

### Step 2: Install Required Plugins

Navigate to **Manage Jenkins → Plugins → Available Plugins** and install:

#### Essential Plugins:

- **Docker Pipeline** - For building and pushing Docker images
- **GitHub Integration** - For GitHub webhook integration
- **Credentials Binding** - For secure credential management
- **Pipeline: Stage View** - Enhanced pipeline visualization
- **Blue Ocean** (optional) - Modern Jenkins UI

#### Installation Commands:

```bash
# Alternative: Install via Jenkins CLI
docker exec jenkins jenkins-plugin-cli --plugins docker-workflow github credentials-binding pipeline-stage-view
```

### Step 3: Configure GitHub Credentials

1. **Generate GitHub Personal Access Token**:

   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Set expiration and select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `admin:repo_hook` (Write repository hooks)
   - Copy the generated token

2. **Add Credentials to Jenkins**:
   - Navigate to **Manage Jenkins → Credentials → System → Global credentials**
   - Click "Add Credentials"
   - Select "Username with password"
   - **Username**: Your GitHub username
   - **Password**: The Personal Access Token from step 1
   - **ID**: `github-danors` (must match Jenkinsfile)
   - **Description**: `GitHub PAT for CI/CD pipeline`

### Step 4: Configure Docker Hub Credentials

1. **Create Docker Hub Account** (if you don't have one):

   - Sign up at [https://hub.docker.com](https://hub.docker.com)
   - Create a repository: `your-username/ecommerce-dashboard`

2. **Generate Docker Hub Access Token**:

   - Go to Docker Hub → Account Settings → Security → Access Tokens
   - Click "New Access Token"
   - Name: `Jenkins CI/CD`
   - Permissions: `Read, Write, Delete`
   - Copy the generated token

3. **Add Docker Hub Credentials to Jenkins**:
   - Navigate to **Manage Jenkins → Credentials → System → Global credentials**
   - Click "Add Credentials"
   - Select "Username with password"
   - **Username**: Your Docker Hub username
   - **Password**: The Access Token from step 2
   - **ID**: `dockerhub-danors` (must match Jenkinsfile)
   - **Description**: `Docker Hub credentials for image registry`

### Step 5: Create Jenkins Pipeline Job

1. **Create New Job**:

   - From Jenkins dashboard, click "New Item"
   - Enter name: `ecommerce-cicd-pipeline`
   - Select "Pipeline" project type
   - Click "OK"

2. **Configure Pipeline**:

   - **General Section**:

     - ✅ GitHub project
     - Project URL: `https://github.com/Danor93/ecommerce-cicd-pipeline`

   - **Build Triggers**:

     - ✅ GitHub hook trigger for GITScm polling

   - **Pipeline Section**:
     - Definition: `Pipeline script from SCM`
     - SCM: `Git`
     - Repository URL: `https://github.com/Danor93/ecommerce-cicd-pipeline.git`
     - Credentials: Select `github-danors`
     - Branch: `*/main` (or your target branch)
     - Script Path: `Jenkinsfile`

3. **Save Configuration**

### Step 6: Configure GitHub Webhook (Optional)

For automatic builds on code changes:

1. **Go to GitHub Repository Settings**:

   - Navigate to your repository → Settings → Webhooks
   - Click "Add webhook"

2. **Webhook Configuration**:
   - **Payload URL**: `http://your-jenkins-url:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events**: `Just the push event`
   - ✅ Active

> **Note**: For local Jenkins (localhost:8080), webhooks won't work. Use manual builds or polling.

## 🚀 Running Your First Build

### Step 1: Commit Changes

Ensure your latest changes are committed and pushed:

```bash
git add .
git commit -m "Setup Jenkins CI/CD pipeline"
git push origin main
```

### Step 2: Trigger Build

1. **Manual Trigger**:

   - Go to Jenkins → `ecommerce-cicd-pipeline` job
   - Click "Build Now"

2. **Monitor Progress**:
   - Click on the build number (e.g., `#1`)
   - View "Console Output" for real-time logs

### Step 3: Expected Pipeline Stages

Your pipeline will execute these stages:

1. **Checkout** ✅ - Pulls code from GitHub
2. **Lint** ✅ - Runs ESLint code quality checks
3. **Build Docker Image** ✅ - Creates production Docker image
4. **Push Docker Image** ✅ - Pushes to Docker Hub registry

## 🔄 Testing Complete GitOps Workflow

If you set up ArgoCD (Option 1 or 3), test the end-to-end automation:

### Step 1: Make a Code Change

```bash
# Make a small change to trigger the workflow
echo "// GitOps test" >> src/app/page.tsx
git add .
git commit -m "Test GitOps workflow"
git push origin main
```

### Step 2: Monitor the Process

1. **Jenkins Build**: Watch build progress at http://localhost:8080
2. **Docker Hub**: Verify new image pushed with build number tag
3. **ArgoCD UI**: Monitor at http://localhost:8090
   - Check Image Updater logs
   - Watch application sync status
   - Verify new deployment

### Step 3: Verify Deployment

```bash
# Check if new pods are running with updated image
kubectl get pods -n ecommerce
kubectl describe pod <pod-name> -n ecommerce | grep Image

# Check ArgoCD application status
cd k8s && ./menu.sh  # Option 13: Show ArgoCD status
```

### Expected Timeline:

- **Jenkins Build**: 2-5 minutes
- **Image Detection**: Up to 2 minutes (ArgoCD Image Updater polling)
- **Git Update**: 30 seconds
- **ArgoCD Sync**: 30 seconds - 2 minutes
- **Pod Deployment**: 1-3 minutes

**Total**: 5-12 minutes for complete automation from code commit to running deployment.

## 🗄️ Database Information

### PostgreSQL Configuration

The database is automatically configured with:

- **Container Name**: `ecommerce-cicd-pipeline-db-1`
- **Port**: `5432`
- **Database**: `ecommerce_db`
- **Username**: `ecommerce_user`
- **Password**: `ecommerce_password`

### Initial Data

The system auto-seeds with:

| Email             | Password | Role  |
| ----------------- | -------- | ----- |
| admin@example.com | admin123 | admin |
| john@example.com  | john123  | user  |

### Database Access

**Connect via Docker**:

```bash
docker exec -it ecommerce-cicd-pipeline-db-1 psql -U ecommerce_user -d ecommerce_db
```

**External Connection**:

- Host: `localhost`
- Port: `5432`
- Database: `ecommerce_db`
- Username: `ecommerce_user`
- Password: `ecommerce_password`

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. Jenkins Container Won't Start

```bash
# Check logs
docker logs jenkins

# Restart Jenkins
docker-compose restart jenkins
```

#### 2. Database Connection Issues

```bash
# Check database logs
docker logs ecommerce-cicd-pipeline-db-1

# Restart database
docker-compose restart db
```

#### 3. ArgoCD Applications Not Syncing

```bash
# Check ArgoCD status
kubectl get applications -n argocd

# Check ArgoCD logs
kubectl logs -n argocd deployment/argocd-application-controller -f

# Force sync application
kubectl patch application ecommerce-app -n argocd -p '{"operation":{"sync":{}}}' --type=merge
```

#### 4. Image Updater Not Working

```bash
# Check Image Updater status
kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-image-updater

# Check Image Updater logs
kubectl logs -n argocd deployment/argocd-image-updater -f

# Common issues:
# - Docker Hub rate limiting
# - Invalid image annotations
# - Network connectivity
```

#### 5. Kubernetes Resources Stuck

```bash
# Check pod status
kubectl get pods -n ecommerce

# Describe problematic pods
kubectl describe pod <pod-name> -n ecommerce

# Check events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

#### 6. Build Fails - Docker Permission Issues

```bash
# Ensure Docker socket is properly mounted
# Check docker-compose.yml volumes configuration
```

#### 7. GitHub Authentication Failed

- Verify GitHub Personal Access Token is valid
- Check token has correct permissions (repo, admin:repo_hook)
- Ensure credentials ID in Jenkins matches Jenkinsfile

#### 8. Docker Hub Push Failed

- Verify Docker Hub credentials in Jenkins
- Check Docker Hub repository exists
- Ensure access token has write permissions

#### 9. Node.js Dependencies Installation Failed

```bash
# Clear npm cache in container
docker exec jenkins npm cache clean --force

# Or rebuild with no cache
docker-compose build --no-cache
```

### Logs and Debugging

**Docker Compose services**:

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f jenkins
docker-compose logs -f db
docker-compose logs -f next-app
```

**Kubernetes/ArgoCD logs**:

```bash
# ArgoCD application controller
kubectl logs -n argocd deployment/argocd-application-controller -f

# ArgoCD Image Updater
kubectl logs -n argocd deployment/argocd-image-updater -f

# Application pods
kubectl logs -n ecommerce deployment/nextjs-deployment -f
kubectl logs -n ecommerce deployment/postgres-deployment -f

# All ArgoCD components
kubectl logs -n argocd --all-containers=true -f
```

**Jenkins build logs**:

- Access via Jenkins UI → Job → Build Number → Console Output

**Menu script debugging**:

```bash
# Enable verbose output in menu script
cd k8s && DEBUG=1 ./menu.sh
```

## 🔐 Security Considerations

### Production Deployment

When deploying to production:

1. **Change Default Passwords**:

   - Update database credentials in `.env`
   - Change Jenkins admin password
   - Rotate GitHub and Docker Hub tokens

2. **Network Security**:

   - Use HTTPS for Jenkins
   - Restrict network access to services
   - Use Docker secrets for sensitive data

3. **Backup Strategy**:
   - Regular database backups
   - Jenkins configuration backup
   - Code repository backup

### Environment Variables

Never commit sensitive data to version control:

- Add `.env` to `.gitignore`
- Use Jenkins credentials store
- Consider using external secret management

## 📞 Support

If you encounter issues:

1. **Check Logs**: Always start with Docker and Jenkins logs
2. **Verify Credentials**: Ensure all tokens and passwords are correct
3. **Network Connectivity**: Verify Docker can access external services
4. **Resource Limits**: Ensure sufficient RAM and disk space

For additional help, refer to:

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎉 Next Steps

After successful installation:

### For GitOps Setup (Option 1 & 3):

1. **Explore ArgoCD UI**: Monitor applications at http://localhost:8090
2. **Test GitOps Workflow**: Make code changes and watch automatic deployments
3. **Monitor Image Updates**: Check ArgoCD Image Updater for new builds
4. **Use Menu Commands**: `cd k8s && ./menu.sh` for all operations

### For All Setups:

1. **Explore the Application**: Login with admin credentials
2. **Test CI/CD Pipeline**: Configure Jenkins and trigger builds
3. **Customize Configuration**: Adapt to your specific requirements
4. **Deploy to Production**: Follow production deployment guidelines

### Quick Reference Commands:

```bash
# Complete deployment and monitoring
cd k8s && ./menu.sh  # Option 17: Deploy Everything + GitOps

# Check status of all components
cd k8s && ./menu.sh  # Option 13: Show ArgoCD status

# Access services
cd k8s && ./menu.sh  # Option 12: Open ArgoCD UI
```

Your E-Commerce CI/CD pipeline with GitOps automation is now ready! 🚀

**Pro Tip**: Use the menu script (`./menu.sh`) for all operations - it provides guided workflows for deployment, monitoring, and troubleshooting.
