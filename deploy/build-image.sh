#!/usr/bin/env bash
set -euo pipefail

# Resolve repository root (parent of this script's directory).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' is not installed or not on PATH." >&2
    exit 1
  fi
}

echo "==> Resolving repo root: ${ROOT_DIR}"
cd "${ROOT_DIR}"

require docker
require node
require npm

VERSION="$(node -p "require('./package.json').version")"
IMAGE_TAG="oleg-clicker:${VERSION}"
LATEST_TAG="oleg-clicker:latest"
ARCHIVE="output/oleg-clicker-${VERSION}.tar"

echo "==> Version: ${VERSION}"
echo "==> Image tag: ${IMAGE_TAG}"
echo "==> Archive:  ${ARCHIVE}"

echo "==> Building app (npm run build)..."
npm run build

mkdir -p output

echo "==> Building docker image (${IMAGE_TAG})..."
docker build -t "${IMAGE_TAG}" -t "${LATEST_TAG}" -f deploy/Dockerfile .

echo "==> Saving image to ${ARCHIVE}..."
docker save "${IMAGE_TAG}" -o "${ARCHIVE}"

SIZE="$(du -h "${ARCHIVE}" | cut -f1)"
echo "==> Done."
echo "    Archive: ${ARCHIVE} (${SIZE})"
echo "    Image size: $(docker image inspect "${IMAGE_TAG}" --format '{{.Size}}' | awk '{printf "%.1f MB", $1/1024/1024}') (compressed tar: ${SIZE})"
echo "    To run: docker load -i ${ARCHIVE} && docker run -d -p 8080:80 ${IMAGE_TAG}"
