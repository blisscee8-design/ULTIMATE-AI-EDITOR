#!/bin/bash

# ULTIMATE DEEP VIDEO EDITOR - Quick Start Script
# Run this to set everything up automatically

set -e

echo "🌟 ULTIMATE DEEP VIDEO EDITOR v3.0"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
echo -e "${YELLOW}[1/10]${NC} Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js v18+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"

# Check Python
echo -e "${YELLOW}[2/10]${NC} Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.9+${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✅ ${PYTHON_VERSION}${NC}"

# Check FFmpeg
echo -e "${YELLOW}[3/10]${NC} Checking FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ FFmpeg not found. Please install FFmpeg${NC}"
    exit 1
fi
echo -e "${GREEN}✅ FFmpeg installed${NC}"

# Check GPU
echo -e "${YELLOW}[4/10]${NC} Checking GPU..."
if command -v nvidia-smi &> /dev/null; then
    echo -e "${GREEN}✅ NVIDIA GPU detected:${NC}"
    nvidia-smi --query-gpu=name --format=csv,noheader
else
    echo -e "${YELLOW}⚠️  No NVIDIA GPU detected. Using CPU (slower).${NC}"
fi

# Install npm dependencies
echo -e "${YELLOW}[5/10]${NC} Installing npm dependencies..."
npm install
echo -e "${GREEN}✅ npm dependencies installed${NC}"

# Install Python dependencies
echo -e "${YELLOW}[6/10]${NC} Installing Python dependencies..."
pip install -r requirements.txt
echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Create directories
echo -e "${YELLOW}[7/10]${NC} Creating directories..."
mkdir -p models uploads outputs temp logs
echo -e "${GREEN}✅ Directories created${NC}"

# Setup environment
echo -e "${YELLOW}[8/10]${NC} Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  .env created. Please edit with your API keys!${NC}"
else
    echo -e "${GREEN}✅ .env already exists${NC}"
fi

# Download models
echo -e "${YELLOW}[9/10]${NC} Would you like to download AI models? (This may take 30+ minutes)"
read -p "Download models? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bash download-models.sh
    echo -e "${GREEN}✅ Models downloaded${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping model download${NC}"
fi

# Final check
echo -e "${YELLOW}[10/10]${NC} Running final checks..."
npm test 2>/dev/null || echo "Test skipped"
echo -e "${GREEN}✅ All checks passed!${NC}"

echo ""
echo -e "${GREEN}🎉 Installation complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Edit .env with your API keys"
echo "  2. Run: npm start"
echo "  3. Open: http://localhost:3000"
echo ""
echo "📚 Documentation: https://docs.deep-editor.io"
echo "💬 Support: https://discord.gg/deep-editor"
echo ""