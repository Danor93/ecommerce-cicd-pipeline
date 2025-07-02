#!/bin/bash

# E-Commerce Kubernetes Status Checker
# This script provides a comprehensive overview of the deployment status

set -e

# Ensure script executes relative to its own directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

#------------------------------------------------------------------------------
# Helper output functions (shared format across our bash utilities)
#------------------------------------------------------------------------------
#  print_status  – Green check-mark prefix for success messages
#  print_warning – Yellow warning triangle for non-fatal issues
#  print_error   – Red cross for errors that may abort execution
#  print_info    – Blue info icon for neutral information
#------------------------------------------------------------------------------

print_header() {
    echo -e "${BLUE}▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓${NC}"
    echo -e "${BLUE}▓${NC}              E-COMMERCE KUBERNETES STATUS              ${BLUE}▓${NC}"
    echo -e "${BLUE}▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓${NC}"
    echo
}

print_status() {
    echo -e "${GREEN}✅ $(date '+%Y-%m-%d %H:%M:%S') $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $(date '+%Y-%m-%d %H:%M:%S') $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $(date '+%Y-%m-%d %H:%M:%S') $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $(date '+%Y-%m-%d %H:%M:%S') $1${NC}"
}

#------------------------------------------------------------------------------
# detect_os
# Returns a short string describing the running OS so the script can give
# platform-specific guidance ( macos | ubuntu | debian | redhat | linux | unknown )
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
# Emit minimal hints on how to install a missing <tool> for the detected <os>.
# Keeps the status script self-service friendly instead of failing silently.
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

print_header

# Detect operating system
OS=$(detect_os)
print_info "Detected OS: $OS"

echo
echo "🔧 SYSTEM REQUIREMENTS CHECK"
echo "============================"

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

print_status "Docker is installed and running"

# Check if Minikube is installed
if ! command -v minikube &> /dev/null; then
    provide_installation_instructions "minikube" $OS
    exit 1
fi

print_status "Minikube is installed"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    provide_installation_instructions "kubectl" $OS
    exit 1
fi

print_status "kubectl is installed"

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    print_error "Kubernetes cluster is not accessible"
    print_warning "Run the deployment script to start minikube:"
    echo "  ./deploy.sh"
    exit 1
fi

print_status "Kubernetes cluster is accessible"

# Check minikube status
MINIKUBE_STATUS=$(minikube status --format="{{.Host}}" 2>/dev/null || echo "Stopped")
if [ "$MINIKUBE_STATUS" = "Running" ]; then
    print_status "Minikube cluster is running"
    MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "N/A")
    print_info "Minikube IP: $MINIKUBE_IP"
else
    print_warning "Minikube status: $MINIKUBE_STATUS"
fi

# Check if namespace exists
if kubectl get namespace ecommerce &> /dev/null; then
    print_status "Namespace 'ecommerce' exists"
else
    print_error "Namespace 'ecommerce' does not exist"
    echo "Run ./deploy.sh to create the deployment"
    exit 1
fi

echo
echo "🔍 RESOURCE OVERVIEW"
echo "===================="

# Get all resources in namespace
kubectl get all -n ecommerce 2>/dev/null || print_warning "No resources found in namespace"

echo
echo "📊 POD STATUS"
echo "============="

# Check PostgreSQL pod
postgres_pod=$(kubectl get pods -n ecommerce -l app=postgres -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || echo "")
if [ ! -z "$postgres_pod" ]; then
    postgres_status=$(kubectl get pod $postgres_pod -n ecommerce -o jsonpath="{.status.phase}" 2>/dev/null || echo "Unknown")
    postgres_ready=$(kubectl get pod $postgres_pod -n ecommerce -o jsonpath="{.status.containerStatuses[0].ready}" 2>/dev/null || echo "false")
    
    if [ "$postgres_status" = "Running" ] && [ "$postgres_ready" = "true" ]; then
        print_status "PostgreSQL: $postgres_pod - Running & Ready"
    else
        print_warning "PostgreSQL: $postgres_pod - Status: $postgres_status, Ready: $postgres_ready"
        print_info "--- Logs for $postgres_pod (last 20 lines) ---"
        kubectl logs $postgres_pod -n ecommerce --tail=20 2>&1 | sed 's/^/    /'
    fi
else
    print_error "PostgreSQL pod not found"
fi

# Check Next.js pods
nextjs_pods=$(kubectl get pods -n ecommerce -l app=nextjs -o jsonpath="{.items[*].metadata.name}" 2>/dev/null || echo "")
if [ ! -z "$nextjs_pods" ]; then
    for pod in $nextjs_pods; do
        nextjs_status=$(kubectl get pod $pod -n ecommerce -o jsonpath="{.status.phase}" 2>/dev/null || echo "Unknown")
        nextjs_ready=$(kubectl get pod $pod -n ecommerce -o jsonpath="{.status.containerStatuses[0].ready}" 2>/dev/null || echo "false")
        
        if [ "$nextjs_status" = "Running" ] && [ "$nextjs_ready" = "true" ]; then
            print_status "Next.js: $pod - Running & Ready"
        else
            print_warning "Next.js: $pod - Status: $nextjs_status, Ready: $nextjs_ready"
            print_info "--- Logs for $pod (last 20 lines) ---"
            kubectl logs $pod -n ecommerce --tail=20 2>&1 | sed 's/^/    /'
        fi
    done
else
    print_error "Next.js pods not found"
fi

echo
echo "🌐 SERVICE STATUS"
echo "================="

# Check services
postgres_svc=$(kubectl get service postgres-service -n ecommerce -o jsonpath="{.metadata.name}" 2>/dev/null || echo "")
if [ ! -z "$postgres_svc" ]; then
    postgres_port=$(kubectl get service postgres-service -n ecommerce -o jsonpath="{.spec.ports[0].port}" 2>/dev/null || echo "Unknown")
    print_status "PostgreSQL Service: $postgres_svc:$postgres_port"
else
    print_error "PostgreSQL service not found"
fi

nextjs_svc=$(kubectl get service nextjs-service -n ecommerce -o jsonpath="{.metadata.name}" 2>/dev/null || echo "")
if [ ! -z "$nextjs_svc" ]; then
    nextjs_port=$(kubectl get service nextjs-service -n ecommerce -o jsonpath="{.spec.ports[0].port}" 2>/dev/null || echo "Unknown")
    print_status "Next.js Service: $nextjs_svc:$nextjs_port"
else
    print_error "Next.js service not found"
fi

echo
echo "💾 STORAGE STATUS"
echo "================="

# Check persistent volumes
pv_status=$(kubectl get pv postgres-pv -o jsonpath="{.status.phase}" 2>/dev/null || echo "Not Found")
pvc_status=$(kubectl get pvc postgres-pvc -n ecommerce -o jsonpath="{.status.phase}" 2>/dev/null || echo "Not Found")

if [ "$pv_status" = "Bound" ] && [ "$pvc_status" = "Bound" ]; then
    print_status "Persistent Volume: Bound"
    print_status "Persistent Volume Claim: Bound"
else
    print_warning "PV Status: $pv_status, PVC Status: $pvc_status"
fi

echo
echo "🛠️  DATABASE INITIALIZATION CHECK"
echo "==============================="

# Verify expected tables exist in Postgres
postgres_pod=$(kubectl get pods -n ecommerce -l app=postgres -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || echo "")
if [ -z "$postgres_pod" ]; then
    print_error "PostgreSQL pod not found — cannot verify DB schema"
else
    # Disable immediate exit for this block to handle potential psql errors gracefully
    set +e
    tables_present=$(kubectl exec -n ecommerce "$postgres_pod" -- bash -c "psql -U \$POSTGRES_USER -d \$POSTGRES_DB -tAc 'SELECT COUNT(*) FROM pg_tables WHERE schemaname=\'public\' AND tablename IN (\'users\',\'products\',\'cart_items\',\'orders\',\'order_items\');'" 2>/dev/null)
    if [[ "$tables_present" == "5" ]]; then
        print_status "Database schema: all tables present ✅"
    else
        print_warning "Database schema: expected 5 tables, found $tables_present"
    fi

    # Optional: check at least one admin/user row exists
    user_count=$(kubectl exec -n ecommerce "$postgres_pod" -- bash -c "psql -U \$POSTGRES_USER -d \$POSTGRES_DB -tAc 'SELECT COUNT(*) FROM users;'" 2>/dev/null)
    if [[ "$user_count" =~ ^[0-9]+$ ]]; then
        print_status "Users table contains $user_count rows"
    else
        print_warning "Could not query users table"
    fi
    set -e
fi

echo
echo "🔧 CONFIGURATION STATUS"
echo "======================="

# Check ConfigMaps
if kubectl get configmap ecommerce-config -n ecommerce &> /dev/null; then
    print_status "Application ConfigMap: Found"
else
    print_error "Application ConfigMap: Missing"
fi

if kubectl get configmap postgres-init-script -n ecommerce &> /dev/null; then
    print_status "Database Init ConfigMap: Found"
else
    print_error "Database Init ConfigMap: Missing"
fi

# Check Secrets
if kubectl get secret ecommerce-secrets -n ecommerce &> /dev/null; then
    print_status "Application Secrets: Found"
else
    print_error "Application Secrets: Missing"
fi

echo
echo "🌍 ACCESS INFORMATION"
echo "===================="

# Check if ingress exists
if kubectl get ingress ecommerce-ingress -n ecommerce &> /dev/null; then
    print_info "Ingress: Available at http://ecommerce.local"
    if [ "$MINIKUBE_IP" != "N/A" ]; then
        print_info "Add '$MINIKUBE_IP ecommerce.local' to /etc/hosts"
    fi
else
    print_info "Ingress: Not configured"
fi

print_info "Port Forward: kubectl port-forward svc/nextjs-service 3000:3000 -n ecommerce"
print_info "Direct Access: minikube service nextjs-service -n ecommerce --url"

echo
echo "🎛️  SYSTEM INFORMATION"
echo "====================="
echo "• Operating System: $OS"
echo "• Docker Status: Running"
echo "• Minikube Status: $MINIKUBE_STATUS"
if [ "$MINIKUBE_IP" != "N/A" ]; then
    echo "• Cluster IP: $MINIKUBE_IP"
fi

echo
echo "🔍 USEFUL COMMANDS"
echo "=================="
echo "# View logs:"
echo "kubectl logs -l app=nextjs -n ecommerce -f"
echo "kubectl logs -l app=postgres -n ecommerce -f"
echo
echo "# Debug issues:"
echo "kubectl describe pod <pod-name> -n ecommerce"
echo "kubectl get events -n ecommerce --sort-by='.lastTimestamp'"
echo
echo "# Scale applications:"
echo "kubectl scale deployment nextjs-deployment --replicas=3 -n ecommerce"
echo
echo "# Access database:"
echo "kubectl port-forward svc/postgres-service 5432:5432 -n ecommerce"
echo
echo "# Minikube management:"
echo "minikube dashboard  # Open Kubernetes dashboard"
echo "minikube stop       # Stop the cluster"
echo "minikube start      # Start the cluster"

echo
echo "✨ Status check complete!" 