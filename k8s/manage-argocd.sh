#!/bin/bash

# ArgoCD Management Script for E-commerce CI/CD Pipeline
# This script provides easy management commands for ArgoCD operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

print_help() {
    echo -e "${BLUE}ArgoCD Management Script${NC}"
    echo
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 <command>"
    echo
    echo -e "${YELLOW}Commands:${NC}"
    echo "  install       Install ArgoCD on minikube"
    echo "  bootstrap     Bootstrap App of Apps pattern"
    echo "  ui            Start ArgoCD UI (port-forward)"
    echo "  login         Login to ArgoCD CLI"
    echo "  status        Show ArgoCD applications status"
    echo "  sync          Sync all applications"
    echo "  logs          Show application logs"
    echo "  restart       Restart ArgoCD server"
    echo "  image-updater Install ArgoCD Image Updater"
    echo "  uninstall     Uninstall ArgoCD"
    echo "  password      Get admin password"
    echo "  help          Show this help message"
    echo
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 install    # Install ArgoCD"
    echo "  $0 ui         # Start UI at http://localhost:8090"
    echo "  $0 status     # Check application status"
}

#------------------------------------------------------------------------------
# ArgoCD Operations
#------------------------------------------------------------------------------

install_argocd() {
    print_status "Installing ArgoCD..."
    bash "$SCRIPT_DIR/setup-argocd.sh"
}

bootstrap_apps() {
    print_status "Bootstrapping App of Apps pattern..."
    
    # Apply the project first
    print_status "Creating ecommerce project..."
    kubectl apply -f "$SCRIPT_DIR/argocd/projects/"
    
    # Wait a moment for the project to be created
    sleep 2
    
    # Apply the app-of-apps
    print_status "Creating App of Apps..."
    kubectl apply -f "$SCRIPT_DIR/argocd/bootstrap/"
    
    print_status "Bootstrap completed! ✓"
    print_status "ArgoCD will now automatically manage your applications."
}

start_ui() {
    print_status "Starting ArgoCD UI..."
    print_status "ArgoCD UI will be available at: http://localhost:8090"
    print_status "Press Ctrl+C to stop port-forwarding"
    
    # Get the password before starting port-forward
    get_password
    
    kubectl port-forward svc/argocd-server -n argocd 8090:80
}

login_cli() {
    print_status "Logging into ArgoCD CLI..."
    
    # Check if ArgoCD CLI is installed
    if ! command -v argocd &> /dev/null; then
        print_error "ArgoCD CLI is not installed. Run '$0 install' first."
        exit 1
    fi
    
    # Get the password
    PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
    
    # Login to ArgoCD
    argocd login localhost:8090 --username admin --password "$PASSWORD" --insecure
    
    print_status "Successfully logged into ArgoCD CLI ✓"
}

show_status() {
    print_status "ArgoCD Applications Status:"
    echo
    
    # Check if ArgoCD is installed
    if ! kubectl get namespace argocd &> /dev/null; then
        print_error "ArgoCD is not installed. Run '$0 install' first."
        exit 1
    fi
    
    # Show ArgoCD pods
    echo -e "${BLUE}ArgoCD Pods:${NC}"
    kubectl get pods -n argocd
    echo
    
    # Show applications if any exist
    if kubectl get applications -n argocd &> /dev/null; then
        echo -e "${BLUE}Applications:${NC}"
        kubectl get applications -n argocd
        echo
        
        # Show application status with ArgoCD CLI if available
        if command -v argocd &> /dev/null; then
            echo -e "${BLUE}Application Details:${NC}"
            argocd app list --output wide 2>/dev/null || echo "ArgoCD CLI not logged in"
        fi
    else
        print_warning "No applications found. Run '$0 bootstrap' to create them."
    fi
}

sync_apps() {
    print_status "Syncing all applications..."
    
    if command -v argocd &> /dev/null; then
        argocd app sync --all
        print_status "All applications synced ✓"
    else
        print_error "ArgoCD CLI is not available. Install it first with '$0 install'"
        exit 1
    fi
}

show_logs() {
    print_status "ArgoCD Server logs:"
    kubectl logs -n argocd deployment/argocd-server --tail=50 -f
}

restart_argocd() {
    print_status "Restarting ArgoCD server..."
    kubectl rollout restart deployment/argocd-server -n argocd
    kubectl rollout status deployment/argocd-server -n argocd
    print_status "ArgoCD server restarted ✓"
}

uninstall_argocd() {
    print_warning "This will completely remove ArgoCD and all applications!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Uninstalling ArgoCD..."
        kubectl delete namespace argocd --ignore-not-found=true
        print_status "ArgoCD uninstalled ✓"
    else
        print_status "Uninstall cancelled."
    fi
}

install_image_updater() {
    print_status "Installing ArgoCD Image Updater..."
    
    # Check if ArgoCD is installed
    if ! kubectl get namespace argocd &> /dev/null; then
        print_error "ArgoCD is not installed. Run '$0 install' first."
        exit 1
    fi
    
    # Install ArgoCD Image Updater
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml
    
    # Wait for Image Updater to be ready
    print_status "Waiting for ArgoCD Image Updater to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/argocd-image-updater -n argocd
    
    print_status "ArgoCD Image Updater installation completed ✓"
    print_status "Image Updater will now automatically update Docker images in Git when new versions are pushed!"
}

get_password() {
    if kubectl get secret -n argocd argocd-initial-admin-secret &> /dev/null; then
        PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
        echo -e "${GREEN}ArgoCD Admin Password: ${YELLOW}$PASSWORD${NC}"
        echo -e "${GREEN}Username: ${YELLOW}admin${NC}"
        echo -e "${GREEN}URL: ${YELLOW}http://localhost:8090${NC}"
    else
        print_error "ArgoCD admin secret not found. Is ArgoCD installed?"
    fi
}

#------------------------------------------------------------------------------
# Main Script Logic
#------------------------------------------------------------------------------

case "${1:-}" in
    install)
        install_argocd
        ;;
    bootstrap)
        bootstrap_apps
        ;;
    ui)
        start_ui
        ;;
    login)
        login_cli
        ;;
    status)
        show_status
        ;;
    sync)
        sync_apps
        ;;
    logs)
        show_logs
        ;;
    restart)
        restart_argocd
        ;;
    image-updater)
        install_image_updater
        ;;
    uninstall)
        uninstall_argocd
        ;;
    password)
        get_password
        ;;
    help|--help|-h)
        print_help
        ;;
    *)
        print_error "Unknown command: ${1:-}"
        echo
        print_help
        exit 1
        ;;
esac 