# Dockerfile for Viltrumite Backend
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create necessary directories
RUN mkdir -p Databases uploads AI-Module/temp_downloads

# Copy dependency files first for caching
COPY Backend/package*.json ./Backend/
COPY AI-Module/requirements.txt ./AI-Module/

# Install Node dependencies
RUN cd Backend && npm install

# Install Python dependencies
RUN pip3 install --no-cache-dir -r AI-Module/requirements.txt --break-system-packages

# Copy the rest of the application
# Note: Ensure .dockerignore handles node_modules and venv
COPY . .

WORKDIR /app/Backend

# Environment variables for Docker
ENV PORT=3000
ENV UPLOADS_DIR=/app/uploads
ENV DB_SONGS=/app/Databases/songs.db
ENV DB_USERS=/app/Databases/users.db
ENV PYTHON_BIN=python3
ENV AI_MODULE_CORE=/app/AI-Module/Core
ENV PYTHON_FALLBACK=/app/AI-Module/Inference/fallback.py
ENV PYTHON_USER_ADDER=/app/AI-Module/Training/user_adder.py

# Explicitly indicate paths (removed VOLUME to prevent masking on non-persistent tiers)
EXPOSE 3000

CMD ["npm", "start"]
