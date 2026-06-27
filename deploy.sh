#!/bin/bash

# OgaFix Deployment Script
# This script builds and deploys the frontend to the EC2 instance

set -e

echo "🚀 OgaFix Deployment Script"
echo "================================"

# Configuration
DOMAIN="ogafix.work"
EC2_USER="ubuntu"
EC2_HOST="54.74.68.179"
DEPLOY_PATH="/home/ubuntu/ogafix-website"
BACKEND_PORT="3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build frontend
echo -e "${YELLOW}Step 1: Building frontend...${NC}"
cd client
npm run build
cd ..
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 2: Deploy to EC2
echo -e "${YELLOW}Step 2: Deploying to EC2...${NC}"
scp -r -i ~/.ssh/chi-sftp client/dist ${EC2_USER}@${EC2_HOST}:${DEPLOY_PATH}/
scp -i ~/.ssh/chi-sftp nginx.conf ${EC2_USER}@${EC2_HOST}:${DEPLOY_PATH}/
echo -e "${GREEN}✓ Files deployed to EC2${NC}"

# Step 3: Setup Nginx on EC2
echo -e "${YELLOW}Step 3: Setting up Nginx...${NC}"
ssh -i ~/.ssh/chi-sftp ${EC2_USER}@${EC2_HOST} << 'EOF'
  # Install Nginx if not already installed
  if ! command -v nginx &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y nginx certbot python3-certbot-nginx
  fi

  # Copy Nginx config
  sudo cp /home/ubuntu/ogafix-website/nginx.conf /etc/nginx/nginx.conf

  # Test Nginx config
  sudo nginx -t

  # Restart Nginx
  sudo systemctl restart nginx
  sudo systemctl enable nginx

  echo "Nginx configured and running"
EOF
echo -e "${GREEN}✓ Nginx configured${NC}"

# Step 4: Setup SSL Certificate
echo -e "${YELLOW}Step 4: Setting up SSL certificate...${NC}"
ssh -i ~/.ssh/chi-sftp ${EC2_USER}@${EC2_HOST} << EOF
  # Note: This requires DNS to be pointing to the EC2 instance
  # Run this manually if needed:
  # sudo certbot certonly --standalone -d ogafix.work -d www.ogafix.work
  
  echo "SSL setup instructions:"
  echo "1. Point your GoDaddy DNS to: 54.74.68.179"
  echo "2. Run: sudo certbot certonly --standalone -d ogafix.work -d www.ogafix.work"
  echo "3. Or use: sudo certbot certonly --webroot -w /var/www/certbot -d ogafix.work"
EOF

# Step 5: Verify deployment
echo -e "${YELLOW}Step 5: Verifying deployment...${NC}"
HEALTH_CHECK=$(curl -s http://${EC2_HOST}:3000/health | grep -o '"status":"healthy"' || echo "")

if [ ! -z "$HEALTH_CHECK" ]; then
  echo -e "${GREEN}✓ Backend API is healthy${NC}"
else
  echo -e "${RED}✗ Backend API health check failed${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Deployment completed!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update GoDaddy DNS to point to: 54.74.68.179"
echo "2. Set up SSL certificate (if not already done)"
echo "3. Access your site at: https://ogafix.work"
echo ""
echo "Backend API: http://54.74.68.179:3000"
echo "Frontend: https://ogafix.work"
