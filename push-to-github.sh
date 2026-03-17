#!/bin/bash

# PUSH TO GITHUB - Automated Script

echo "🚀 Pushing Ultimate Deep Video Editor to GitHub"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not installed${NC}"
    exit 1
fi

# Get repository info
echo -e "${YELLOW}Please provide your GitHub information:${NC}"
read -p "GitHub Username: " GITHUB_USER
read -p "Repository Name: " REPO_NAME

# Set remote URL
REMOTE_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo ""
echo -e "${YELLOW}Using repository: ${GREEN}$REMOTE_URL${NC}"
echo ""

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}[1/5]${NC} Initializing git repository..."
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
fi

# Add remote
echo -e "${YELLOW}[2/5]${NC} Adding remote repository..."
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE_URL"
echo -e "${GREEN}✅ Remote added${NC}"

# Stage all files
echo -e "${YELLOW}[3/5]${NC} Staging all files..."
git add .
echo -e "${GREEN}✅ Files staged${NC}"

# Commit
echo -e "${YELLOW}[4/5]${NC} Creating commit..."
git commit -m "Initial commit: Ultimate Deep Video Editor v3.0.0 - Complete AI-powered deepfake &
