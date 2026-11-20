#!/bin/sh
set -eu

docker compose up -d --build backend
docker compose up -d --build frontend
