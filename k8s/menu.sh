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

header() {
  local line="╔══════════════════════════════════════════════════════════════════╗"
  local title="║            🚀  E-COMMERCE KUBERNETES MANAGER  🚀            ║"
  local subtitle="║    Deploy · Status · Cleanup — all from a single interface     ║"

  echo -e "${CYAN}${line}${NC}"
  echo -e "${CYAN}${title}${NC}"
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
  echo -e "  ${RED}0${NC}) Exit"
  echo
  read -rp "Enter choice [0-5]: " choice
}

run_deploy() {
  local build_flag=$1
  echo -e "${GREEN}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} Running deploy.sh $build_flag" && echo
  if [[ "$build_flag" == "--build" ]]; then
    "$SCRIPT_DIR/deploy.sh" --build
  else
    "$SCRIPT_DIR/deploy.sh"
  fi
}

run_status() {
  echo -e "${GREEN}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} Running status.sh" && echo
  "$SCRIPT_DIR/status.sh"
}

run_cleanup() {
  local prune_flag=$1
  echo -e "${GREEN}[INFO] $(date '+%Y-%m-%d %H:%M:%S')${NC} Running cleanup.sh $prune_flag" && echo
  if [[ "$prune_flag" == "--prune" ]]; then
    "$SCRIPT_DIR/cleanup.sh" --prune
  else
    "$SCRIPT_DIR/cleanup.sh"
  fi
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