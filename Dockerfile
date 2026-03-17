FROM nvidia/cuda:11.8.0-runtime-ubuntu22.04

LABEL maintainer="Ultimate Deep Editor Team"
LABEL description="Ultimate Deepfake & Face Editing Platform v3.0"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3.9 \
    python3-pip \
    nodejs \
    npm \
    ffmpeg \
    git \
    wget \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install Node dependencies
RUN npm install --production

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY mega-server.js .
COPY mega-index.html ./index.html
COPY mega-editor.js .

# Create necessary directories
RUN mkdir -p models uploads outputs temp logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "mega-server.js"]