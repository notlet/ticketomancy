#! /bin/bash

docker image build -t ghcr.io/notlet/ticketomancy:latest .
docker push ghcr.io/notlet/ticketomancy:latest

echo 👍.