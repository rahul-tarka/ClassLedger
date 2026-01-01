#!/bin/bash
# Surge.sh deployment script

echo "🚀 Deploying to Surge.sh..."

cd frontend

# Check if surge is installed
if ! command -v surge &> /dev/null; then
    echo "❌ Surge CLI not found. Installing..."
    npm install -g surge
fi

# Deploy
surge . classledger.surge.sh

echo "✅ Deployment complete!"
echo "🌐 Your site is live at: https://classledger.surge.sh"

