#!/bin/bash
set -e

PI_HOST="pi@192.168.1.5"
REMOTE_DIR="/var/www/html/trading-position-calculator"

echo "Building..."
npm run build

echo "Deploying to $PI_HOST..."
ssh "$PI_HOST" "rm -rf $REMOTE_DIR/*"
scp -r dist/trading-position-calculator/* "$PI_HOST:$REMOTE_DIR/"

echo "Done."
