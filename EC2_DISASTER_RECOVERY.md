# OgaFix EC2 Disaster Recovery Guide

## Quick Recovery (15 minutes)

If your EC2 instance crashes or is deleted, recover everything with these steps:

### Step 1: Launch New EC2 Instance

1. Go to AWS Console → EC2 → Instances
2. Click "Launch Instances"
3. **Configuration:**
   - **AMI:** Ubuntu 22.04 LTS (t3.micro)
   - **Instance Type:** t3.micro (free tier eligible)
   - **Security Group:** Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - **Key Pair:** Use existing `ogafix-key`
   - **Storage:** 20GB (default)
4. Click "Launch"
5. Wait for instance to be running
6. Note the new **Elastic IP** or **Public IP**

### Step 2: Connect to New Instance

```bash
# SSH into new instance
ssh -i ~/.ssh/chi-sftp ubuntu@<NEW_IP>
```

### Step 3: Run Initialization Script

```bash
# Run the complete setup script
curl -fsSL https://raw.githubusercontent.com/Chi-eze/ogafix-website/main/scripts/init-ec2.sh | bash
```

This script will:
- ✅ Update system packages
- ✅ Install Node.js 18
- ✅ Clone your repository
- ✅ Install dependencies
- ✅ Configure Nginx
- ✅ Create backend service
- ✅ Start all services

### Step 4: Update DNS

1. Go to GoDaddy Domain Management
2. Update DNS A records:
   - **@** → `<NEW_IP>`
   - **www** → `<NEW_IP>`
3. Wait for DNS propagation (5-30 minutes)

### Step 5: Setup SSL Certificate

```bash
# SSH into instance
ssh -i ~/.ssh/chi-sftp ubuntu@<NEW_IP>

# Get SSL certificate
sudo certbot certonly --standalone \
  -d ogafix.work \
  -d www.ogafix.work \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Update Nginx to use SSL
sudo tee /etc/nginx/sites-available/ogafix.work > /dev/null << 'EOF'
server {
    listen 80;
    server_name ogafix.work www.ogafix.work;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ogafix.work www.ogafix.work;
    
    ssl_certificate /etc/letsencrypt/live/ogafix.work/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ogafix.work/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
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
    }
    
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
EOF

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Verify Everything

```bash
# Check backend
curl https://ogafix.work/api/health

# Check frontend
curl https://ogafix.work/

# View backend logs
tail -f /var/log/ogafix-backend.log
```

**Done!** Your OgaFix platform is fully recovered.

---

## Manual Recovery (If Script Fails)

If the initialization script fails, follow these manual steps:

### 1. Update System

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Install Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verify
```

### 3. Install Nginx

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 4. Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/Chi-eze/ogafix-website.git
cd ogafix-website
```

### 5. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 6. Configure Nginx

```bash
# Copy Nginx config
sudo cp nginx.conf /etc/nginx/nginx.conf

# Or create manually
sudo tee /etc/nginx/sites-available/ogafix.work > /dev/null << 'EOF'
# [Use config from Step 5 above]
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/ogafix.work /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Create Backend Service

```bash
sudo tee /etc/systemd/system/ogafix-backend.service > /dev/null << 'EOF'
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
EOF

# Create log file
sudo touch /var/log/ogafix-backend.log
sudo chown ubuntu:ubuntu /var/log/ogafix-backend.log

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable ogafix-backend.service
sudo systemctl start ogafix-backend.service
```

### 8. Verify Services

```bash
# Check backend
curl http://localhost:3000/health

# Check frontend
curl http://localhost/

# View logs
tail -f /var/log/ogafix-backend.log
```

---

## Maintenance & Monitoring

### Daily Checks

```bash
# Check backend health
curl https://ogafix.work/api/health

# Check service status
sudo systemctl status ogafix-backend

# Check Nginx status
sudo systemctl status nginx

# View recent logs
tail -50 /var/log/ogafix-backend.log
```

### Weekly Tasks

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node

# Check SSL certificate expiration
sudo certbot certificates
```

### Monthly Tasks

- [ ] Review and archive logs
- [ ] Check for security updates
- [ ] Test disaster recovery procedure
- [ ] Backup database manually
- [ ] Review access logs for anomalies

---

## Troubleshooting

### Backend Won't Start

```bash
# Check service status
sudo systemctl status ogafix-backend

# View error logs
sudo journalctl -u ogafix-backend -n 50

# Check if port 3000 is in use
sudo lsof -i :3000

# Manually test backend
cd /home/ubuntu/ogafix-website/backend
NODE_ENV=production node server.js
```

### Nginx Won't Start

```bash
# Test configuration
sudo nginx -t

# Check if port 80/443 is in use
sudo lsof -i :80
sudo lsof -i :443

# View Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Error

```bash
# Test database connectivity
psql -h ogafix-db.clug0ckyoc91.eu-west-1.rds.amazonaws.com \
     -U ogafixadmin \
     -d ogafix \
     -c "SELECT version();"

# Check security group
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# View renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## Backup Procedures

### Database Backup

```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier ogafix \
  --db-snapshot-identifier ogafix-backup-$(date +%Y-%m-%d)

# List snapshots
aws rds describe-db-snapshots --db-instance-identifier ogafix
```

### Code Backup

```bash
# Push to GitHub
cd /home/ubuntu/ogafix-website
git add -A
git commit -m "Backup: $(date)"
git push origin main
```

### Full System Backup

```bash
# Create EC2 AMI (Amazon Machine Image)
aws ec2 create-image \
  --instance-id i-xxxxx \
  --name ogafix-backup-$(date +%Y-%m-%d) \
  --description "OgaFix complete system backup"
```

---

## Monitoring & Alerts

### Setup CloudWatch Alarms

```bash
# CPU usage alarm
aws cloudwatch put-metric-alarm \
  --alarm-name ogafix-high-cpu \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

# Disk space alarm
aws cloudwatch put-metric-alarm \
  --alarm-name ogafix-low-disk \
  --alarm-description "Alert when disk < 10%" \
  --metric-name DiskSpaceUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 10 \
  --comparison-operator LessThanThreshold
```

---

## Checklist for New EC2 Instance

- [ ] Launch EC2 instance (t3.micro, Ubuntu 22.04)
- [ ] Assign Elastic IP
- [ ] Configure security groups (22, 80, 443)
- [ ] SSH into instance
- [ ] Run init-ec2.sh script
- [ ] Update GoDaddy DNS
- [ ] Setup SSL certificate
- [ ] Verify backend health
- [ ] Verify frontend loads
- [ ] Monitor logs for errors
- [ ] Test API endpoints
- [ ] Setup monitoring/alerts

---

## Support

For issues or questions:
1. Check logs: `tail -f /var/log/ogafix-backend.log`
2. Review this guide
3. Contact AWS support for infrastructure issues
4. Contact GoDaddy for domain issues

---

**Last Updated:** 2026-06-27
**Version:** 1.0
**Status:** Production Ready
