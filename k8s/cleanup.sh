#!/bin/bash

# E-Commerce Kubernetes Cleanup Script
# Safely tears down the Kubernetes namespace and Minikube cluster used by this project

set -e

# Ensure script runs relative to its own directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
  echo -e "${GREEN}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING] $(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR] $(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

###############################
# 1. Kill active port-forwards
###############################
print_status "Checking for active kubectl port-forward processes..."
PORT_FORWARD_PIDS=$(pgrep -f "kubectl port-forward" || true)
if [[ -n "$PORT_FORWARD_PIDS" ]]; then
  print_warning "Found active port-forward processes: $PORT_FORWARD_PIDS — terminating..."
  kill $PORT_FORWARD_PIDS || true
  sleep 2
else
  print_status "No port-forward processes found."
fi

########################################
# 2. Delete namespace and wait for tear-down
########################################
if kubectl get namespace ecommerce &> /dev/null; then
  print_status "Deleting namespace 'ecommerce' and all contained resources..."
  kubectl delete namespace ecommerce --wait --timeout=300s
  print_status "Namespace deleted."
else
  print_status "Namespace 'ecommerce' does not exist — skipping."
fi

# Parse flags
#-------------------------------------------------------------------------------
# Flag parsing
#  --prune / --deep / --all : perform a deep cleanup (delete PVs, Docker prune)
#-------------------------------------------------------------------------------
DEEP_PRUNE=false
for arg in "$@"; do
  case $arg in
    --prune|--deep|--all)
      DEEP_PRUNE=true
      shift ;;
  esac
done

###############################
# 3. Optional: delete PVs bound to namespace
###############################
if $DEEP_PRUNE; then
  print_status "Deleting any PersistentVolumes previously bound to namespace..."
  PVs=$(kubectl get pv -o jsonpath='{range .items[?(@.spec.claimRef.namespace=="ecommerce")]}{.metadata.name}{"\n"}{end}' 2>/dev/null || true)
  if [[ -n "$PVs" ]]; then
    echo "$PVs" | xargs -r kubectl delete pv
  else
    print_status "No PVs to delete."
  fi
fi

###############################
# 3. Stop (and optionally delete) Minikube
###############################
if command -v minikube &> /dev/null; then
  if minikube status --format '{{.Host}}' 2>/dev/null | grep -q "Running"; then
    print_status "Stopping Minikube cluster..."
    minikube stop
  else
    print_status "Minikube is not running."
  fi

  # Remove profile directory completely
  print_status "Deleting Minikube profile & data..."
  minikube delete --all --purge
else
  print_error "Minikube is not installed — nothing to stop."
fi

# Deep prune of Docker artifacts
if $DEEP_PRUNE; then
  print_status "Performing Docker system prune ... (this may reclaim a lot of space)"
  docker system prune -af --volumes
  docker builder prune -af
fi

#------------------------------------------------------------------------------
# detect_os
# Simple utility to return the current operating system so we can tailor
# messages to the user at the end of the script.
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
      echo "linux"
  else
      echo "unknown"
  fi
}

# Detect OS and print
OS=$(detect_os)
print_status "Detected OS: $OS"

print_status "Cleanup complete! \u2705" 