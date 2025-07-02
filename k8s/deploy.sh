#!/bin/bash

# E-Commerce Kubernetes Deployment Script
# This script sets up the complete e-commerce application on Kubernetes

set -e

# Ensure script runs relative to its own directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Script version identifier
SCRIPT_VERSION="1.0.1"

echo "🚀 Starting e-commerce application deployment to Kubernetes..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

#------------------------------------------------------------------------------
# Helper output functions
#------------------------------------------------------------------------------
#  print_status  <msg> – Log a green INFO message (success)
#  print_warning <msg> – Log a yellow WARNING message (non-fatal issues)
#  print_error   <msg> – Log a red ERROR message (fatal/exit conditions)
#  print_info    <msg> – Log a blue INFO message (general information)
#------------------------------------------------------------------------------

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR] $(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

#------------------------------------------------------------------------------
# detect_os
# Returns: a short identifier of the host operating system so we can
#          offer platform-specific instructions ( macos | ubuntu | debian |
#          redhat | linux | unknown ).
#------------------------------------------------------------------------------

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ -f /etc/debian_version ]]; then
        echo "debian"
    elif [[ -f /etc/redhat-release ]]; then
        echo "redhat"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Check for Ubuntu specifically
        if command -v lsb_release &> /dev/null; then
            if lsb_release -si | grep -qi ubuntu; then
                echo "ubuntu"
            else
                echo "linux"
            fi
        else
            echo "linux"
        fi
    else
        echo "unknown"
    fi
}

#------------------------------------------------------------------------------
# provide_installation_instructions <tool> <os>
# Prints minimal installation hints for the requested <tool> depending on
# the detected <os>. The function keeps the script self-contained so that we
# can guide the user instead of failing silently.
#------------------------------------------------------------------------------

# Function to provide installation instructions
provide_installation_instructions() {
    local tool=$1
    local os=$2
    
    echo
    print_error "$tool is not installed on your system"
    echo
    
    case $os in
        "macos")
            case $tool in
                "docker")
                    echo "To install Docker on macOS:"
                    echo "1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop"
                    echo "2. Or using Homebrew:"
                    echo "   brew install --cask docker"
                    ;;
                "minikube")
                    echo "To install Minikube on macOS:"
                    echo "1. Using Homebrew:"
                    echo "   brew install minikube"
                    echo "2. Or download from: https://minikube.sigs.k8s.io/docs/start/"
                    ;;
                "kubectl")
                    echo "To install kubectl on macOS:"
                    echo "1. Using Homebrew:"
                    echo "   brew install kubectl"
                    echo "2. Or download from: https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/"
                    ;;
            esac
            ;;
        "ubuntu"|"debian")
            case $tool in
                "docker")
                    echo "To install Docker on Ubuntu/Debian:"
                    echo "1. Update package index:"
                    echo "   sudo apt-get update"
                    echo "2. Install Docker:"
                    echo "   sudo apt-get install docker.io"
                    echo "3. Add user to docker group:"
                    echo "   sudo usermod -aG docker \$USER"
                    echo "4. Log out and back in, or restart your session"
                    ;;
                "minikube")
                    echo "To install Minikube on Ubuntu/Debian:"
                    echo "1. Download and install:"
                    echo "   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64"
                    echo "   sudo install minikube-linux-amd64 /usr/local/bin/minikube"
                    ;;
                "kubectl")
                    echo "To install kubectl on Ubuntu/Debian:"
                    echo "1. Download kubectl:"
                    echo "   curl -LO \"https://dl.k8s.io/release/\$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl\""
                    echo "2. Install kubectl:"
                    echo "   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl"
                    ;;
            esac
            ;;
        *)
            echo "Please install $tool for your operating system."
            echo "Visit the official documentation for installation instructions."
            ;;
    esac
    echo
}

# Detect operating system
OS=$(detect_os)
print_info "Detected OS: $OS"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    provide_installation_instructions "docker" $OS
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is installed but not running. Please start Docker first."
    case $OS in
        "macos")
            echo "Start Docker Desktop application"
            ;;
        "ubuntu"|"debian")
            echo "Start Docker with: sudo systemctl start docker"
            ;;
    esac
    exit 1
fi

print_status "Docker is installed and running ✓"

# Check if Minikube is installed
if ! command -v minikube &> /dev/null; then
    provide_installation_instructions "minikube" $OS
    exit 1
fi

print_status "Minikube is installed ✓"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    provide_installation_instructions "kubectl" $OS
    exit 1
fi

print_status "kubectl is installed ✓"

# Check if minikube is running, if not start it
if ! kubectl cluster-info &> /dev/null; then
    print_warning "Minikube cluster is not running. Starting minikube with docker driver..."
    
    # Start minikube with docker driver
    print_status "Starting minikube cluster..."
    minikube start --driver=docker --memory=4g --cpus=2
    
    # Enable ingress addon
    print_status "Enabling ingress addon..."
    minikube addons enable ingress
    
    print_status "Minikube cluster started successfully ✓"
else
    print_status "Minikube cluster is already running ✓"
fi

# Verify cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    print_error "Kubernetes cluster is still not accessible after starting minikube"
    exit 1
fi

print_status "Kubernetes cluster is accessible ✓"

# Create namespace first
print_status "Creating namespace..."
kubectl apply -f manifests/namespace.yaml

# Apply all manifests using Kustomize
print_status "Applying Kubernetes manifests via Kustomize..."
kubectl apply -k manifests

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n ecommerce --timeout=300s

# Build and load Docker image for Next.js app (if needed)
if [[ "$1" == "--build" ]]; then
    print_status "Building Docker image for Next.js application..."
    cd ..
    docker build -t ecommerce-nextjs:latest .
    
    # Load image into minikube
    print_status "Loading image into minikube..."
    minikube image load ecommerce-nextjs:latest
    cd k8s
fi

# Update the image name in the deployment
print_status "Updating Next.js deployment configuration..."
# Image reference is already correct in manifest; no replacement needed

# Deploy Next.js application
print_status "Deploying Next.js application..."
kubectl apply -f manifests/nextjs-deployment.yaml

# Wait for Next.js to be ready
print_status "Waiting for Next.js application to be ready..."
kubectl wait --for=condition=ready pod -l app=nextjs -n ecommerce --timeout=300s

# Apply Ingress (optional)
if kubectl get ingressclass nginx &> /dev/null; then
    print_status "Deploying Ingress..."
    kubectl apply -f manifests/ingress.yaml
    
    # Get minikube IP for hosts file update
    MINIKUBE_IP=$(minikube ip)
    print_warning "Add this line to your /etc/hosts file:"
    echo "    $MINIKUBE_IP ecommerce.local"
    print_warning "Then access the application at: http://ecommerce.local"
else
    print_warning "NGINX Ingress controller not found. Skipping ingress deployment."
    print_warning "Enable it with: minikube addons enable ingress"
fi

print_status "Deployment completed! 🎉"

# Build deployment summary BEFORE opening minikube service tunnel

echo
echo "📋 Deployment Summary:" 
echo "======================" 
echo "• OS: $OS" 
echo "• Docker: Running" 
echo "• Minikube: Running with docker driver" 
echo "• Namespace: ecommerce" 
echo "• PostgreSQL: Ready with initialized schema" 
echo "• Next.js App: 2 replicas running" 
echo "• Persistent Storage: 2Gi for database" 

# Show script version
print_info "Script version: $SCRIPT_VERSION" 

echo 
echo "🔍 Useful Commands:" 
echo "===================" 
echo "# View all resources:" 
echo "kubectl get all -n ecommerce" 
echo 
echo "# View logs:" 
echo "kubectl logs -l app=nextjs -n ecommerce" 
echo "kubectl logs -l app=postgres -n ecommerce" 
echo 
echo "# Port forward to access the application:" 
echo "kubectl port-forward svc/nextjs-service 3000:3000 -n ecommerce" 
echo "# Then access: http://localhost:3000" 
echo 
echo "# Access database directly:" 
echo "kubectl port-forward svc/postgres-service 5432:5432 -n ecommerce" 
echo "# Then connect: psql -h localhost -U ecommerce_user -d ecommerce" 
echo 
echo "# Minikube dashboard:" 
echo "minikube dashboard" 

echo 
echo "🧹 To clean up everything:" 
echo "=========================" 
echo "kubectl delete namespace ecommerce" 
echo "minikube stop  # Stop the cluster" 
echo "minikube delete  # Delete the cluster" 

################################################################################
# Expose the service via minikube tunnel with safe Ctrl+C handling
################################################################################

# Try to reuse existing tunnel first
URL=$(minikube service nextjs-service -n ecommerce --url 2>/dev/null | head -n 1)
if [[ -n "$URL" ]] && curl -sfI "$URL" >/dev/null; then
    print_status "Application already accessible at: $URL"
    print_warning "Press Ctrl+C when you are done viewing the app"
    # Idle loop waiting for user interrupt
    while true; do sleep 3600; done & WAIT_PID=$!
    trap 'echo; read -rp "⚠️  Stop exposing the service? (y/N): " yn; if [[ $yn =~ ^[Yy]$ ]]; then kill $WAIT_PID 2>/dev/null; trap - INT; print_status "Service tunnel closed."; exit 0; fi' INT
    wait $WAIT_PID
    trap - INT
else
    print_status "Opening service tunnel (press Ctrl+C to stop)" 
    # Start minikube service in background so we can capture Ctrl+C
    minikube service nextjs-service -n ecommerce &
    SVC_PID=$!
    sleep 2 # give minikube a moment to print URL
    URL=$(minikube service nextjs-service -n ecommerce --url 2>/dev/null | head -n 1)
    if [[ -n "$URL" ]]; then
        print_status "Application exposed at: $URL"
    fi
    trap 'echo; read -rp "⚠️  Stop exposing the service? (y/N): " yn; if [[ $yn =~ ^[Yy]$ ]]; then kill $SVC_PID 2>/dev/null; trap - INT; print_status "Service tunnel closed."; exit 0; fi' INT
    wait $SVC_PID 2>/dev/null
    trap - INT
fi

print_status "Ready to go! 🚀" 