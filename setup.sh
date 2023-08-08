#!/bin/sh

# MongoDB
docker run -p 27017:27017 --name mongo -d mongodb/mongodb-community-server:latest

# Redis
docker run --name redis-container -p 6379:6379 -d redis/redis-stack