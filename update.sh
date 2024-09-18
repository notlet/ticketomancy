#! /bin/bash
echo Stopping containers...
docker compose down

echo Pulling latest images...
docker compose pull

echo Starting containers...
docker compose up -d

echo Update completed.