#!/usr/bin/env bash
set -e

echo "Building frontend..."
cd client
npm install
npm run build

echo "Installing backend dependencies..."
cd ../server
npm install
npm rebuild sqlite3

echo "Build complete!"
