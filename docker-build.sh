#!/bin/bash
# based on https://pretzelhands.com/posts/command-line-flags

PRODUCTION=0
PUBLISH=0
ALL=0
REGISTRY=localhost:5000
SERVICES=()

for arg in "$@"
do
  case $arg in
    --prod)
    PRODUCTION=1
    shift
    ;;
    --publish)
    PUBLISH=1
    shift
    ;;
    --all)
    ALL=1
    shift
    ;;
    -r|--registry)
    REGISTRY="$2"
    shift
    shift
    ;;
    *)
    SERVICES+=("$1")
    shift
    ;;
  esac
done

echo "# Production: $PRODUCTION"
echo "# Build all: $ALL"
echo "# Publish: $PUBLISH"
echo "# Registry: $REGISTRY"
echo "# Service args: ${SERVICES[*]}"

SERVICES_TO_BUILD=${SERVICES[*]}
if [ $ALL == 1 ]; then
  SERVICE_DIRS=()
  DIRS_WITH_DOCKERFILE="$(find . -type f -name 'Dockerfile' ! -path './node_modules/*')"
  for item in $DIRS_WITH_DOCKERFILE
  do
    SERVICE_DIRS+=("$(basename $(dirname $item))")
  done

  SERVICES_TO_BUILD=${SERVICE_DIRS[@]}
fi

echo "# Following services will be build: $SERVICES_TO_BUILD"

for service in $SERVICES_TO_BUILD
do
  if [ $PRODUCTION == 1 ]; then
    docker buildx build --build-arg PRODUCTION=true --platform linux/arm/v7 -t $REGISTRY/$service:latest -f ./apps/$service/Dockerfile . || exit 1
  else
    docker buildx build --platform linux/arm/v7 -t $REGISTRY/$service:latest -f ./apps/$service/Dockerfile . || exit 1
  fi

  if [ $PUBLISH == 1 ]; then
    docker push $REGISTRY/$service:latest || exit 1
  fi
done