#!/bin/sh

# MongoDB
docker pull mongodb/mongodb-community-server
docker run -p 27017:27017 --name mongo -d mongodb/mongodb-community-server:latest
