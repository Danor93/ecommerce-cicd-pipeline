# 🚀 Installation & Setup Guide

This guide provides comprehensive instructions for setting up the E-Commerce Admin Dashboard with Jenkins CI/CD pipeline integration.

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for repository management)
- **Node.js 18.x or higher** (for local development, optional)
- **npm or yarn** package manager (optional for local development)

### System Requirements

- **Operating System**: macOS, Linux, or Windows with WSL2
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 5GB free space
- **Network**: Internet connection for downloading Docker images and dependencies

## 🐳 Docker & Application Setup

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

## 🔧 Jenkins CI/CD Pipeline Setup

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
     - Branch: `*/feature/phase-3-jenkins-setup`
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
git push origin feature/phase-3-jenkins-setup
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

#### 3. Build Fails - Docker Permission Issues

```bash
# Ensure Docker socket is properly mounted
# Check docker-compose.yml volumes configuration
```

#### 4. GitHub Authentication Failed

- Verify GitHub Personal Access Token is valid
- Check token has correct permissions (repo, admin:repo_hook)
- Ensure credentials ID in Jenkins matches Jenkinsfile

#### 5. Docker Hub Push Failed

- Verify Docker Hub credentials in Jenkins
- Check Docker Hub repository exists
- Ensure access token has write permissions

#### 6. Node.js Dependencies Installation Failed

```bash
# Clear npm cache in container
docker exec jenkins npm cache clean --force

# Or rebuild with no cache
docker-compose build --no-cache
```

### Logs and Debugging

**View all service logs**:

```bash
docker-compose logs -f
```

**View specific service logs**:

```bash
docker-compose logs -f jenkins
docker-compose logs -f db
docker-compose logs -f next-app
```

**Jenkins build logs**:

- Access via Jenkins UI → Job → Build Number → Console Output

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

1. **Explore the Application**: Login with admin credentials
2. **Test CI/CD Pipeline**: Make code changes and trigger builds
3. **Customize Configuration**: Adapt to your specific requirements
4. **Deploy to Production**: Follow production deployment guidelines

Your E-Commerce CI/CD pipeline is now ready for development! 🚀

> 🆕 **Alternative Local Kubernetes Setup**
> If you prefer running the stack in a local Kubernetes cluster instead of Docker-Compose, jump to `k8s/menu.sh`:
>
> ```bash
> cd k8s && ./menu.sh
> ```
>
> The interactive menu lets you deploy, monitor, and clean up the cluster effortlessly.
