#!/bin/bash

# ============================================================================
#  E-Commerce Kubernetes Management Menu
# -----------------------------------------------------------------------------
#  Provides a single interactive entry point to:
#    • Deploy the application (with or without building the Docker image)
#    • Check deployment status
#    • Clean up resources (basic or deep prune)
# -----------------------------------------------------------------------------
#  All commands are delegated to the companion scripts located in the same
#  directory:
#    deploy.sh   — handles the deployment workflow
#    status.sh   — displays a detailed status report of the cluster
#    cleanup.sh  — tears down the namespace / cluster and optionally prunes
#                   volumes and Docker artefacts
# ============================================================================

set -e

# -----------------------------------------------------------------------------
# Script directory resolution (so we can call the other scripts reliably)
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# -----------------------------------------------------------------------------
# Colour palette
# -----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Colour

# Script version (update when you make significant changes)
SCRIPT_VERSION="1.0.1"

header() {
  local line="╔══════════════════════════════════════════════════════════════════╗"
  local title="║            🚀  E-COMMERCE KUBERNETES MANAGER  🚀            ║"
  local subtitle="║    Deploy · Status · Cleanup — all from a single interface     ║"
  local version_line="║                       Version: $SCRIPT_VERSION                        ║"

  echo -e "${CYAN}${line}${NC}"
  echo -e "${CYAN}${title}${NC}"
  echo -e "${CYAN}${version_line}${NC}"
  echo -e "${CYAN}${subtitle}${NC}"
  echo -e "${CYAN}${line}${NC}"
}

prompt_choice() {
  echo
  echo -e "${BLUE}Select an action:${NC}"
  echo -e "  ${GREEN}1${NC}) Deploy application"
  echo -e "  ${GREEN}2${NC}) Deploy & build Docker image   ${YELLOW}(adds --build)${NC}"
  echo -e "  ${GREEN}3${NC}) Show deployment status"
  echo -e "  ${GREEN}4${NC}) Cleanup resources             ${YELLOW}(basic)${NC}"
  echo -e "  ${GREEN}5${NC}) Cleanup resources             ${YELLOW}(deep prune --prune)${NC}"
  echo -e "  ${GREEN}6${NC}) Open/Expose Next.js app via minikube service"
  echo -e "  ${GREEN}7${NC}) Rollout restart a resource"
  echo -e "  ${GREEN}8${NC}) View pod logs"
  echo -e "  ${GREEN}9${NC}) Describe / debug a pod"
  echo -e "  ${RED}0${NC}) Exit"
  echo
  read -rp "Enter choice [0-9]: " choice
}

#------------------------------------------------------------------------------
# run_deploy [--build]
# Wrapper around deploy.sh. Pass "--build" to trigger a fresh Docker build
# before applying manifests, otherwise performs a standard deploy.
#------------------------------------------------------------------------------
run_deploy() {
  local build_flag=$1
  echo -e "${GREEN}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} Running deploy.sh $build_flag" && echo
  if [[ "$build_flag" == "--build" ]]; then
    "$SCRIPT_DIR/deploy.sh" --build
  else
    "$SCRIPT_DIR/deploy.sh"
  fi
}

#------------------------------------------------------------------------------
# run_status
# Opens the status dashboard script which prints a detailed cluster overview.
#------------------------------------------------------------------------------
run_status() {
  echo -e "${GREEN}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} Running status.sh" && echo
  "$SCRIPT_DIR/status.sh"
}

#------------------------------------------------------------------------------
# run_cleanup [--prune]
# Tidies up the cluster. With --prune it performs a deeper cleanup (PVC/PV +
# Docker prune).
#------------------------------------------------------------------------------
run_cleanup() {
  local prune_flag=$1
  echo -e "${GREEN}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} Running cleanup.sh $prune_flag" && echo
  if [[ "$prune_flag" == "--prune" ]]; then
    "$SCRIPT_DIR/cleanup.sh" --prune
  else
    "$SCRIPT_DIR/cleanup.sh"
  fi
}

#------------------------------------------------------------------------------
# run_open_app
# Uses `minikube service` to expose the Next.js ClusterIP service on a random
# high port (same behaviour as deploy.sh). If the proxy is already running,
# it simply prints the existing URL instead of spawning a new process.
#------------------------------------------------------------------------------
run_open_app() {
  # Ensure minikube is running
  if ! minikube status --format '{{.Host}}' 2>/dev/null | grep -q "Running"; then
    echo -e "${RED}Minikube is not running. Start it with the deploy option first.${NC}"; sleep 2; return
  fi

  # Verify service exists
  if ! kubectl get svc nextjs-service -n ecommerce &>/dev/null; then
    echo -e "${RED}Next.js service not found in namespace 'ecommerce'. Deploy first.${NC}"; sleep 2; return
  fi

  # Attempt to retrieve existing URL (minikube caches port assignments)
  local url
  url=$(minikube service nextjs-service -n ecommerce --url 2>/dev/null | head -n 1)

  if [[ -n "$url" ]] && curl -sfI "$url" >/dev/null; then
    echo -e "${GREEN}✅ Application already accessible at:${NC} $url"
    echo -e "${YELLOW}Press Ctrl+C to stop the tunnel and return to the menu${NC}"
    # Run a lightweight wait loop so Ctrl+C is caught here instead of menu
    while true; do sleep 3600; done & WAIT_PID=$!
    # Confirmation handler
    trap 'echo; read -rp "⚠️  Stop exposing the service? (y/N): " yn; if [[ $yn =~ ^[Yy]$ ]]; then kill $WAIT_PID 2>/dev/null; trap - INT; echo -e "${GREEN}[INFO] Service tunnel closed.${NC}"; return; fi' INT
    wait $WAIT_PID
    trap - INT
    return
  fi

  echo -e "${GREEN}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} Opening minikube service (press Ctrl+C to stop)" && echo
  # Run in background so we can intercept Ctrl+C
  minikube service nextjs-service -n ecommerce &
  SVC_PID=$!

  # Give minikube a moment to print the URL
  sleep 2
  url=$(minikube service nextjs-service -n ecommerce --url 2>/dev/null | head -n 1)
  if [[ -n "$url" ]]; then
    echo -e "${GREEN}✅ Application exposed at:${NC} $url"
  fi

  # Confirmation handler
  trap 'echo; read -rp "⚠️  Stop exposing the service? (y/N): " yn; if [[ $yn =~ ^[Yy]$ ]]; then kill $SVC_PID 2>/dev/null; trap - INT; echo -e "${GREEN}[INFO] Service tunnel closed.${NC}"; return; fi' INT

  wait $SVC_PID 2>/dev/null
  trap - INT
}

#------------------------------------------------------------------------------
# run_rollout
# Lists Deployments & StatefulSets in the 'ecommerce' namespace, lets the user
# choose one and performs `kubectl rollout restart` on it.
#------------------------------------------------------------------------------
run_rollout() {
  local resources
  resources=$(kubectl -n ecommerce get deployments,statefulsets -o jsonpath='{range .items[*]}{.kind}/{.metadata.name}{"\n"}{end}' 2>/dev/null)
  if [[ -z "$resources" ]]; then
    echo -e "${RED}No Deployments or StatefulSets found in namespace 'ecommerce'.${NC}"; sleep 2; return
  fi

  echo -e "${BLUE}Select a resource to rollout-restart:${NC}"
  local i=1
  local arr=()
  while IFS= read -r line; do
    echo -e "  ${GREEN}$i${NC}) $line"
    arr+=("$line")
    ((i++))
  done <<< "$resources"

  read -rp "Enter choice [1-$((${#arr[@]}))]: " idx
  if ! [[ $idx =~ ^[0-9]+$ ]] || (( idx < 1 || idx > ${#arr[@]} )); then
    echo -e "${RED}Invalid selection.${NC}"; sleep 2; return
  fi

  local target=${arr[$((idx-1))]}
  echo -e "${GREEN}[INFO]$(date '+%Y-%m-%d %H:%M:%S')${NC} Rolling out $target ..."
  if kubectl -n ecommerce rollout restart "$target"; then
    echo -e "${GREEN}Rollout triggered successfully.${NC}"
  else
    echo -e "${RED}Failed to rollout $target.${NC}"
  fi
  sleep 2
}

#------------------------------------------------------------------------------
# select_pod_helper
# Utility to list pods in the ecommerce namespace and return the chosen name
# Sets global variable SELECTED_POD or returns 1 on failure.
#------------------------------------------------------------------------------
select_pod_helper() {
  local pods pod_arr idx
  pods=$(kubectl get pods -n ecommerce -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' 2>/dev/null)
  if [[ -z "$pods" ]]; then
    echo -e "${RED}No pods found in namespace 'ecommerce'.${NC}"; return 1
  fi
  local i=1
  pod_arr=()
  echo -e "${BLUE}Select a pod:${NC}"
  while IFS= read -r line; do
    echo -e "  ${GREEN}$i${NC}) $line"
    pod_arr+=("$line")
    ((i++))
  done <<< "$pods"
  read -rp "Enter choice [1-$((${#pod_arr[@]}))]: " idx
  if ! [[ $idx =~ ^[0-9]+$ ]] || (( idx < 1 || idx > ${#pod_arr[@]} )); then
    echo -e "${RED}Invalid selection.${NC}"; return 1
  fi
  SELECTED_POD=${pod_arr[$((idx-1))]}
  return 0
}

#------------------------------------------------------------------------------
# run_view_logs
# Allows the user to tail or follow logs of a selected pod.
#------------------------------------------------------------------------------
run_view_logs() {
  if ! select_pod_helper; then sleep 2; return; fi
  local follow_choice
  read -rp "Follow logs? (y/N): " follow_choice
  echo -e "${GREEN}[INFO] Fetching logs for $SELECTED_POD ...${NC}\n"
  if [[ $follow_choice =~ ^[Yy]$ ]]; then
    kubectl logs -f "$SELECTED_POD" -n ecommerce
  else
    kubectl logs "$SELECTED_POD" -n ecommerce --tail=100
  fi
  echo -e "\n${YELLOW}--- End of logs ---${NC}"
  read -p "Press Enter to return to the menu..." _
}

#------------------------------------------------------------------------------
# run_describe_pod
# Runs `kubectl describe pod` for a selected pod.
#------------------------------------------------------------------------------
run_describe_pod() {
  if ! select_pod_helper; then sleep 2; return; fi
  echo -e "${GREEN}[INFO] Describing pod $SELECTED_POD ...${NC}\n"
  kubectl describe pod "$SELECTED_POD" -n ecommerce | less -R
}

# Main loop (allows multiple operations in one session)
while true; do
  clear
  header
  prompt_choice

  case "$choice" in
    1)
      run_deploy
      ;;
    2)
      run_deploy "--build"
      ;;
    3)
      run_status
      ;;
    4)
      run_cleanup
      ;;
    5)
      run_cleanup "--prune"
      ;;
    6)
      run_open_app
      ;;
    7)
      run_rollout
      ;;
    8)
      run_view_logs
      ;;
    9)
      run_describe_pod
      ;;
    0)
      echo -e "${YELLOW}Goodbye!${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Please try again.${NC}"
      sleep 2
      ;;
  esac

  echo
  read -p "Press Enter to return to the menu..." _
  # Loop back to menu
done 