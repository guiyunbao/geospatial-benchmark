#!/bin/sh

# MongoDB
docker run -p 27017:27017 --name mongo -d mongodb/mongodb-community-server:latest

# Redis
docker run -p 6379:6379 --name redis -d redis/redis-stack-server:latest
