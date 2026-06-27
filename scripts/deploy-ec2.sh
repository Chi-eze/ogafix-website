#!/bin/bash

# OgaFix EC2 Deployment Script
# Deploys the complete OgaFix platform to EC2 in minutes

set -e

# Configuration
DOMAIN="${DOMAIN:-ogafix.work}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_HOST="${EC2_HOST:-54.74.68.179}"
SSH_KEY="${SSH_KEY:-~/.ssh/chi-sftp}"
DEPLOY_PATH="/home/ubuntu/ogafix-website"
BACKEND_PORT="3000"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 OgaFix EC2 Deployment${NC}"
echo "================================"

# Step 1: Build Docker images
echo -e "${YELLOW}Step 1: Building Docker images...${NC}"
docker-compose build
echo -e "${GREEN}✓ Docker images built${NC}"

# Step 2: Push to EC2
echo -e "${YELLOW}Step 2: Pushing code to EC2...${NC}"
ssh -i ${SSH_KEY} ${EC2_USER}@${EC2_HOST} "mkdir -p ${DEPLOY_PATH}"
rsync -avz -e "ssh -i ${SSH_KEY}" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  . ${EC2_USER}@${EC2_HOST}:${DEPLOY_PATH}/
echo -e "${GREEN}✓ Code pushed to EC2${NC}"

# Step 3: Deploy on EC2
echo -e "${YELLOW}Step 3: Deploying on EC2...${NC}"
ssh -i ${SSH_KEY} ${EC2_USER}@${EC2_HOST} << 'DEPLOY_SCRIPT'
  set -e
  
  cd /home/ubuntu/ogafix-website
  
  # Install Docker if needed
  if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
  fi
  
  # Install Docker Compose if needed
  if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
  fi
  
  # Build and start containers
  docker-compose down || true
  docker-compose up -d
  
  echo "✓ Containers running"
  
  # Wait for services to be healthy
  echo "Waiting for services to be healthy..."
  sleep 10
  
  # Check backend health
  if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✓ Backend is healthy"
  else
    echo "✗ Backend health check failed"
    exit 1
  fi
  
  # Check frontend health
  if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✓ Frontend is healthy"
  else
    echo "✗ Frontend health check failed"
    exit 1
  fi
DEPLOY_SCRIPT

echo -e "${GREEN}✓ Deployment complete${NC}"

# Step 4: Verify
echo -e "${YELLOW}Step 4: Verifying deployment...${NC}"
echo "Testing backend: http://${EC2_HOST}:3000/health"
curl -s http://${EC2_HOST}:3000/health | jq . || echo "Backend not responding"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ OgaFix is live!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Frontend: http://${DOMAIN}"
echo "Backend: http://${EC2_HOST}:3000"
echo "API: http://${DOMAIN}/api"
echo ""
echo "Next steps:"
echo "1. Update GoDaddy DNS to point to ${EC2_HOST}"
echo "2. Setup SSL certificate: sudo certbot certonly --standalone -d ${DOMAIN}"
echo "3. Restart Nginx: sudo systemctl restart nginx"
