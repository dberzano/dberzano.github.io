#!/bin/bash -e
cd "$(dirname "$0")"
NAME="SecretSanta"
if docker ps | grep -q "$NAME"; then
    echo Stopping container...
    docker rm -f "$NAME"
else
    echo Starting container...
    docker run -it --rm -p 80:80 -v "$PWD":/usr/share/nginx/html -d --name "$NAME" nginx
fi
