#!/bin/bash
# Sync Frontend to Public Repository
# Usage: ./sync-frontend.sh

set -e

# Configuration
FRONTEND_REPO_PATH="../ClassLedger-Frontend"
FRONTEND_REPO_URL="https://github.com/YOUR-SECOND-ACCOUNT/ClassLedger-Frontend.git"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Syncing Frontend to Public Repository...${NC}\n"

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: frontend directory not found!${NC}"
    exit 1
fi

# Check if frontend repo exists, clone if not
if [ ! -d "$FRONTEND_REPO_PATH" ]; then
    echo -e "${YELLOW}📦 Frontend repo not found. Cloning...${NC}"
    git clone "$FRONTEND_REPO_URL" "$FRONTEND_REPO_PATH"
    echo -e "${GREEN}✅ Repository cloned${NC}\n"
fi

# Copy frontend files
echo -e "${YELLOW}📋 Copying frontend files...${NC}"
rsync -av --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='*.log' \
    frontend/ "$FRONTEND_REPO_PATH/"

echo -e "${GREEN}✅ Files copied${NC}\n"

# Go to frontend repo
cd "$FRONTEND_REPO_PATH"

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}ℹ️  No changes to commit${NC}"
    exit 0
fi

# Stage all changes
git add .

# Commit
COMMIT_MSG="Update frontend from main repo - $(date +'%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG"

# Push to remote
echo -e "${YELLOW}🚀 Pushing to remote...${NC}"
git push origin main

echo -e "\n${GREEN}✅ Frontend synced successfully!${NC}"
echo -e "${GREEN}🌐 Site will update in 1-2 minutes at:${NC}"
echo -e "${GREEN}   https://YOUR-SECOND-ACCOUNT.github.io/ClassLedger-Frontend/${NC}\n"

