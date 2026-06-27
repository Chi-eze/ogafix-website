# OgaFix Frontend Deployment Guide

## Overview

This guide walks you through deploying the OgaFix frontend to your EC2 instance with Nginx, SSL, and custom domain.

**Architecture:**
- Backend API: EC2 port 3000 (Node.js/Express)
- Frontend: EC2 port 80/443 (React/Vite + Nginx)
- Domain: ogafix.work (GoDaddy DNS)

## Prerequisites

- EC2 instance running at `54.74.68.179`
- SSH access with `chi-sftp` key
- GoDaddy domain `ogafix.work`
- Backend API running and healthy

## Step 1: Build Frontend

```bash
cd /home/ubuntu/ogafix-website/client
npm install
npm run build
```

This creates optimized static files in `client/dist/`.

## Step 2: Deploy to EC2

### Option A: Using Deploy Script (Recommended)

```bash
cd /home/ubuntu/ogafix-website
chmod +x deploy.sh
./deploy.sh
```

### Option B: Manual Deployment

```bash
# Copy built files to EC2
scp -r -i ~/.ssh/chi-sftp client/dist ubuntu@54.74.68.179:/home/ubuntu/ogafix-website/

# Copy Nginx config
scp -i ~/.ssh/chi-sftp nginx.conf ubuntu@54.74.68.179:/home/ubuntu/ogafix-website/

# SSH into EC2
ssh -i ~/.ssh/chi-sftp ubuntu@54.74.68.179
```

## Step 3: Setup Nginx on EC2

```bash
# SSH into EC2
ssh -i ~/.ssh/chi-sftp ubuntu@54.74.68.179

# Install Nginx
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Copy Nginx configuration
sudo cp /home/ubuntu/ogafix-website/nginx.conf /etc/nginx/nginx.conf

# Test Nginx configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 4: Configure GoDaddy DNS

1. Go to **GoDaddy DNS Management**
2. Find your `ogafix.work` domain
3. Add/Update DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | 54.74.68.179 |
| A | www | 54.74.68.179 |
| CNAME | api | ogafix.work |

4. Wait for DNS propagation (5-30 minutes)

## Step 5: Setup SSL Certificate

```bash
# SSH into EC2
ssh -i ~/.ssh/chi-sftp ubuntu@54.74.68.179

# Create certbot directory
sudo mkdir -p /var/www/certbot

# Get SSL certificate (after DNS is propagated)
sudo certbot certonly --standalone \
  -d ogafix.work \
  -d www.ogafix.work \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Or use webroot method:
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d ogafix.work \
  -d www.ogafix.work \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Restart Nginx
sudo systemctl restart nginx
```

## Step 6: Verify Deployment

### Check Nginx Status
```bash
sudo systemctl status nginx
```

### Test Frontend
```bash
curl -I https://ogafix.work
```

Should return: `HTTP/2 200`

### Test Backend API
```bash
curl http://54.74.68.179:3000/health
```

Should return: `{"status":"healthy",...}`

### Test API through Frontend
```bash
curl https://ogafix.work/api/health
```

## Step 7: Auto-Renew SSL Certificate

```bash
# SSH into EC2
ssh -i ~/.ssh/chi-sftp ubuntu@54.74.68.179

# Setup auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

## Troubleshooting

### Nginx won't start
```bash
# Check syntax errors
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate not found
```bash
# Verify certificate exists
sudo ls -la /etc/letsencrypt/live/ogafix.work/

# Renew if needed
sudo certbot renew --force-renewal
```

### Backend API not responding
```bash
# Check if backend is running
curl http://localhost:3000/health

# Check backend logs
ssh -i ~/.ssh/chi-sftp ubuntu@54.74.68.179
tail -f /var/log/ogafix-backend.log
```

### DNS not resolving
```bash
# Check DNS propagation
nslookup ogafix.work
dig ogafix.work
```

## Updating Frontend

To deploy new frontend changes:

```bash
# Build new version
cd /home/ubuntu/ogafix-website/client
npm run build

# Deploy
cd ..
./deploy.sh
```

Nginx will automatically serve the new files.

## Monitoring

### Check Nginx access logs
```bash
sudo tail -f /var/log/nginx/access.log
```

### Check Nginx error logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Monitor system resources
```bash
top
df -h
free -h
```

## Performance Optimization

The Nginx configuration includes:
- ✅ Gzip compression
- ✅ Browser caching (30 days for assets)
- ✅ HTTP/2 support
- ✅ Rate limiting
- ✅ Security headers
- ✅ SSL/TLS 1.2+

## Security Checklist

- ✅ SSL/TLS enabled
- ✅ Security headers configured
- ✅ Rate limiting enabled
- ✅ Sensitive files blocked
- ✅ HTTPS redirect enabled
- ✅ Firewall rules configured

## Support

For issues or questions, contact: support@ogafix.work

---

**Deployment Date:** 2026-06-27
**Version:** 1.0
**Status:** Production Ready
