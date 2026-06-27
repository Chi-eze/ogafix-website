#!/bin/bash

# OgaFix EC2 Initialization Script
# Run this on a fresh EC2 instance to set up the complete platform
# Usage: curl -fsSL https://raw.githubusercontent.com/Chi-eze/ogafix-website/main/scripts/init-ec2.sh | bash

set -e

echo "🚀 OgaFix EC2 Initialization"
echo "============================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Update system
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y
echo -e "${GREEN}✓ System updated${NC}"

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
sudo apt-get install -y \
  curl \
  wget \
  git \
  nginx \
  certbot \
  python3-certbot-nginx \
  build-essential \
  libssl-dev \
  libffi-dev

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Install Node.js 18
echo -e "${YELLOW}Step 3: Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"

# Step 4: Clone repository
echo -e "${YELLOW}Step 4: Cloning OgaFix repository...${NC}"
cd /home/ubuntu
git clone https://github.com/Chi-eze/ogafix-website.git
cd ogafix-website
echo -e "${GREEN}✓ Repository cloned${NC}"

# Step 5: Install backend dependencies
echo -e "${YELLOW}Step 5: Installing backend dependencies...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Step 6: Create frontend dist directory
echo -e "${YELLOW}Step 6: Setting up frontend...${NC}"
mkdir -p client/dist
# Frontend HTML is already in the repo
echo -e "${GREEN}✓ Frontend ready${NC}"

# Step 7: Configure Nginx
echo -e "${YELLOW}Step 7: Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/ogafix.work > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    server_name ogafix.work www.ogafix.work;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        root /home/ubuntu/ogafix-website/client/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
NGINX_CONFIG

# Enable site
sudo ln -sf /etc/nginx/sites-available/ogafix.work /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
echo -e "${GREEN}✓ Nginx configured${NC}"

# Step 8: Create systemd service for backend
echo -e "${YELLOW}Step 8: Creating backend service...${NC}"
sudo tee /etc/systemd/system/ogafix-backend.service > /dev/null << 'SERVICE_CONFIG'
[Unit]
Description=OgaFix Backend API Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/ogafix-website/backend
Environment="NODE_ENV=production"
Environment="DB_HOST=ogafix-db.clug0ckyoc91.eu-west-1.rds.amazonaws.com"
Environment="DB_PORT=5432"
Environment="DB_NAME=ogafix"
Environment="DB_USER=ogafixadmin"
Environment="DB_PASSWORD=ChangeMe123!"
Environment="FRONTEND_URL=https://ogafix.work"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/ogafix-backend.log
StandardError=append:/var/log/ogafix-backend.log

[Install]
WantedBy=multi-user.target
SERVICE_CONFIG

# Create log file
sudo touch /var/log/ogafix-backend.log
sudo chown ubuntu:ubuntu /var/log/ogafix-backend.log

# Enable service
sudo systemctl daemon-reload
sudo systemctl enable ogafix-backend.service
sudo systemctl start ogafix-backend.service
echo -e "${GREEN}✓ Backend service created and started${NC}"

# Step 9: Wait for backend to be ready
echo -e "${YELLOW}Step 9: Waiting for backend to be ready...${NC}"
sleep 5
for i in {1..30}; do
  if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 1
done

# Step 10: Verify services
echo -e "${YELLOW}Step 10: Verifying services...${NC}"
echo ""
echo "Backend health:"
curl -s http://localhost:3000/health | jq . || echo "Backend not responding"
echo ""
echo "Frontend:"
curl -s http://localhost/ | head -5
echo ""

# Step 11: Setup SSL (manual step)
echo -e "${YELLOW}Step 11: SSL Certificate Setup${NC}"
echo ""
echo "To setup SSL certificate, run:"
echo "  sudo certbot certonly --standalone -d ogafix.work -d www.ogafix.work"
echo ""
echo "Then update Nginx config to use SSL and restart:"
echo "  sudo systemctl restart nginx"
echo ""

# Summary
echo ""
echo -e "${GREEN}===========================${NC}"
echo -e "${GREEN}✓ OgaFix EC2 Setup Complete!${NC}"
echo -e "${GREEN}===========================${NC}"
echo ""
echo "Services:"
echo "  Frontend: http://$(hostname -I | awk '{print $1}')/"
echo "  Backend: http://$(hostname -I | awk '{print $1}'):3000"
echo "  Logs: tail -f /var/log/ogafix-backend.log"
echo ""
echo "Next steps:"
echo "1. Update GoDaddy DNS to point to this instance"
echo "2. Setup SSL certificate (see above)"
echo "3. Monitor logs: tail -f /var/log/ogafix-backend.log"
echo ""
