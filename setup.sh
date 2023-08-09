#!/bin/sh

# MongoDB
docker run -p 27017:27017 --name mongo -d mongodb/mongodb-community-server:latest

# Redis
docker run -p 6379:6379 --name redisJson -d redis/redis-stack-server:latest
docker run -p 6380:6379 --name redisGeohash -d redis/redis-stack-server:latest
