#!/bin/sh

npm ci
npx tsc

node dist/index.js
