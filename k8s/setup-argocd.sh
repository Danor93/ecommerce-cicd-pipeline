#!/bin/bash

# ArgoCD Setup Script for E-commerce CI/CD Pipeline
# This script sets up ArgoCD on minikube following GitOps best practices

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up ArgoCD for E-commerce CI/CD Pipeline${NC}"

#------------------------------------------------------------------------------
# Helper Functions
#------------------------------------------------------------------------------

print_status() {
    echo -e "${GREEN}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR] $(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

#------------------------------------------------------------------------------
# Prerequisites Check
#------------------------------------------------------------------------------

check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if minikube is running
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Minikube cluster is not running. Please start it first:"
        echo "  minikube start"
        exit 1
    fi
    
    # Check if kubectl is configured
    if ! kubectl get nodes &> /dev/null; then
        print_error "kubectl is not properly configured"
        exit 1
    fi
    
    print_status "Prerequisites check passed ✓"
}

#------------------------------------------------------------------------------
# ArgoCD Installation
#------------------------------------------------------------------------------

install_argocd() {
    print_status "Installing ArgoCD..."
    
    # Create ArgoCD namespace
    print_status "Creating argocd namespace..."
    kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
    
    # Install ArgoCD
    print_status "Applying ArgoCD manifests..."
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    
    # Wait for ArgoCD pods to be ready
    print_status "Waiting for ArgoCD pods to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
    kubectl wait --for=condition=available --timeout=300s deployment/argocd-repo-server -n argocd
    kubectl wait --for=condition=available --timeout=300s deployment/argocd-dex-server -n argocd
    
    print_status "ArgoCD installation completed ✓"
}

#------------------------------------------------------------------------------
# ArgoCD Configuration
#------------------------------------------------------------------------------

configure_argocd() {
    print_status "Configuring ArgoCD..."
    
    # Patch ArgoCD server to be insecure (for local development)
    print_status "Configuring ArgoCD server for local development..."
    kubectl patch deployment argocd-server -n argocd --patch='
    spec:
      template:
        spec:
          containers:
          - name: argocd-server
            command:
            - argocd-server
            - --insecure
    '
    
    # Wait for the deployment to be ready
    kubectl rollout status deployment/argocd-server -n argocd
    
    print_status "ArgoCD configuration completed ✓"
}

#------------------------------------------------------------------------------
# ArgoCD Access Setup
#------------------------------------------------------------------------------

setup_access() {
    print_status "Setting up ArgoCD access..."
    
    # Get initial admin password
    ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
    
    print_status "ArgoCD credentials:"
    echo -e "  ${GREEN}Username: admin${NC}"
    echo -e "  ${GREEN}Password: $ARGOCD_PASSWORD${NC}"
    echo -e "  ${GREEN}URL: http://localhost:8080${NC}"
    
    # Save credentials to file for later use
    cat > argocd-credentials.txt << EOF
ArgoCD Access Information
========================
Username: admin
Password: $ARGOCD_PASSWORD
URL: http://localhost:8080

To access ArgoCD:
1. Run: kubectl port-forward svc/argocd-server -n argocd 8080:80
2. Open: http://localhost:8080
3. Login with the credentials above
EOF
    
    print_status "Credentials saved to argocd-credentials.txt ✓"
}

#------------------------------------------------------------------------------
# ArgoCD CLI Installation
#------------------------------------------------------------------------------

install_argocd_cli() {
    print_status "Installing ArgoCD CLI..."
    
    # Check if ArgoCD CLI is already installed
    if command -v argocd &> /dev/null; then
        print_warning "ArgoCD CLI is already installed"
        argocd version --client
        return
    fi
    
    # Detect OS and install ArgoCD CLI
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    
    if [[ "$ARCH" == "x86_64" ]]; then
        ARCH="amd64"
    elif [[ "$ARCH" == "aarch64" ]]; then
        ARCH="arm64"
    fi
    
    VERSION=$(curl -L -s https://raw.githubusercontent.com/argoproj/argo-cd/stable/VERSION)
    
    print_status "Downloading ArgoCD CLI v$VERSION for $OS/$ARCH..."
    curl -sSL -o argocd "https://github.com/argoproj/argo-cd/releases/download/v$VERSION/argocd-$OS-$ARCH"
    
    chmod +x argocd
    sudo mv argocd /usr/local/bin/argocd
    
    print_status "ArgoCD CLI installation completed ✓"
    argocd version --client
}

#------------------------------------------------------------------------------
# Repository Setup
#------------------------------------------------------------------------------

setup_repository() {
    print_status "Setting up repository configuration..."
    
    # Create repository secret for current repo
    cat > repository-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: ecommerce-repo
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  type: git
  url: https://github.com/Danor93/ecommerce-cicd-pipeline.git
EOF
    
    kubectl apply -f repository-secret.yaml
    
    print_status "Repository configuration completed ✓"
}

#------------------------------------------------------------------------------
# Main Execution
#------------------------------------------------------------------------------

main() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}   ArgoCD Setup for E-commerce App   ${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo
    
    check_prerequisites
    install_argocd
    configure_argocd
    setup_access
    install_argocd_cli
    setup_repository
    
    echo
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}   ArgoCD Setup Completed!          ${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Start port-forward: ${BLUE}kubectl port-forward svc/argocd-server -n argocd 8080:80${NC}"
    echo -e "2. Open ArgoCD UI: ${BLUE}http://localhost:8080${NC}"
    echo -e "3. Create applications using the ArgoCD UI or CLI"
    echo -e "4. Check credentials in: ${BLUE}argocd-credentials.txt${NC}"
    echo
}

# Run main function
main "$@" 