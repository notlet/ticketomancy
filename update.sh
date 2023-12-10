#! /bin/bash
echo Updating...
docker compose down
docker compose build
docker compose up -d