#!/bin/bash

# AUTOMATED PUSH TO GITHUB
# No prompts needed - just run it!

GITHUB_USER="blisscee8-design"
REPO_NAME="ultimate-deepfake-editor"
REMOTE_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo "🚀 Pushing Ultimate Deep Video Editor to GitHub"
echo "================================================"
echo "Repository: $REMOTE_URL"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not installed${NC}"
    exit 1
fi

# Initialize git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}[1/5]${NC} Initializing git..."
    git init
    echo -e "${GREEN}✅ Done${NC}"
fi

# Add remote
echo -e "${YELLOW}[2/5]${NC} Adding remote..."
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE_URL"
echo -e "${GREEN}✅ Done${NC}"

# Stage files
echo -e "${YELLOW}[3/5]${NC} Staging files..."
git add .
echo -e "${GREEN}✅ Done${NC}"

# Commit
echo -e "${YELLOW}[4/5]${NC} Creating commit..."
git commit -m "Initial commit: Ultimate Deep Video Editor v3.0.0 - AI-powered deepfake & face editing platform with 50+ features"
echo -e "${GREEN}✅ Done${NC}"

# Push
echo -e "${YELLOW}[5/5]${NC} Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ SUCCESS!${NC}"
    echo ""
    echo "📍 Repository: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "📦 Files pushed:"
    echo "   ✓ mega-server.js"
    echo "   ✓ mega-index.html"
    echo "   ✓ mega-editor.js"
    echo "   ✓ package.json"
    echo "   ✓ requirements.txt"
    echo "   ✓ .env.example"
    echo "   ✓ docker-compose.yml"
    echo "   ✓ Dockerfile"
    echo "   ✓ All documentation"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Push failed!${NC}"
    echo "Make sure:"
    echo "   1. Repository exists on GitHub"
    echo "   2. You have push access"
    echo "   3. GitHub credentials are configured"
    exit 1
fi