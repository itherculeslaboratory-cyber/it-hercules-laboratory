#!/usr/bin/env bash
# IHL Docker dev helper — Unix / Git Bash / WSL
# Usage: ./scripts/docker-dev.sh [build|up|down|test|logs|shell]

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ACTION="${1:-up}"
case "$ACTION" in
  build) docker compose build ;;
  up)    docker compose up search ;;
  down)  docker compose down ;;
  test)  docker compose --profile test run --rm test ;;
  logs)  docker compose logs -f search ;;
  shell) docker compose run --rm search bash ;;
  *)
    echo "Usage: $0 [build|up|down|test|logs|shell]" >&2
    exit 1
    ;;
esac
