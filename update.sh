#! /bin/bash
echo Updating...
docker compose down
git pull
docker compose build
docker compose up -d
echo Update completed.