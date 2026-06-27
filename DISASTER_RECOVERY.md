# OgaFix Disaster Recovery Plan

## Overview

This document outlines how to recover the complete OgaFix platform from scratch in case of disaster.

**Recovery Time Objective (RTO):** 30 minutes
**Recovery Point Objective (RPO):** 1 hour

---

## Quick Recovery (5 minutes)

If you have Docker installed, recover everything with:

```bash
# Clone repository
git clone https://github.com/Chi-eze/ogafix-website.git
cd ogafix-website

# Set environment variables
export DB_HOST=ogafix-db.clug0ckyoc91.eu-west-1.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=ogafix
export DB_USER=ogafixadmin
export DB_PASSWORD=ChangeMe123!
export FRONTEND_URL=https://ogafix.work

# Start everything
docker-compose up -d

# Verify
curl http://localhost:3000/health
curl http://localhost/
```

**That's it!** Your entire platform is running.

---

## Complete Recovery (30 minutes)

### Prerequisites

- AWS account with access to RDS
- Docker & Docker Compose installed
- Git installed
- SSH access to EC2 (if using EC2)

### Step 1: Prepare Environment

```bash
# Clone the repository
git clone https://github.com/Chi-eze/ogafix-website.git
cd ogafix-website

# Create .env file with credentials
cat > .env << 'EOF'
DB_HOST=ogafix-db.clug0ckyoc91.eu-west-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=ogafix
DB_USER=ogafixadmin
DB_PASSWORD=ChangeMe123!
NODE_ENV=production
FRONTEND_URL=https://ogafix.work
EOF

# Verify database connectivity
psql -h ogafix-db.clug0ckyoc91.eu-west-1.rds.amazonaws.com \
     -U ogafixadmin \
     -d ogafix \
     -c "SELECT version();"
```

### Step 2: Build Docker Images

```bash
# Build backend
docker build -f backend/Dockerfile -t ogafix-backend:latest ./backend

# Build frontend
docker build -f Dockerfile.frontend -t ogafix-frontend:latest .

# Or build both with docker-compose
docker-compose build
```

### Step 3: Start Services

```bash
# Option A: Using Docker Compose (Recommended)
docker-compose up -d

# Option B: Manual Docker commands
# Backend
docker run -d \
  --name ogafix-backend \
  -p 3000:3000 \
  --env-file .env \
  ogafix-backend:latest

# Frontend
docker run -d \
  --name ogafix-frontend \
  -p 80:80 \
  -p 443:443 \
  ogafix-frontend:latest
```

### Step 4: Verify Services

```bash
# Check running containers
docker ps

# Check backend health
curl http://localhost:3000/health

# Check frontend
curl http://localhost/

# View logs
docker logs ogafix-backend
docker logs ogafix-frontend
```

### Step 5: Restore from Backup (if needed)

```bash
# List available backups
aws rds describe-db-snapshots --db-instance-identifier ogafix

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ogafix-restored \
  --db-snapshot-identifier ogafix-snapshot-2026-06-27

# Wait for restoration to complete
aws rds wait db-instance-available --db-instance-identifier ogafix-restored
```

---

## Backup Procedures

### Automated Backups

AWS RDS automatically backs up your database:
- **Retention:** 7 days (default)
- **Frequency:** Daily
- **Time:** 02:00 UTC

To increase retention:

```bash
aws rds modify-db-instance \
  --db-instance-identifier ogafix \
  --backup-retention-period 30 \
  --apply-immediately
```

### Manual Backup

```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier ogafix \
  --db-snapshot-identifier ogafix-backup-$(date +%Y-%m-%d-%H-%M-%S)

# List snapshots
aws rds describe-db-snapshots --db-instance-identifier ogafix
```

### Code Backup

Your code is backed up in GitHub:

```bash
# Push to GitHub
git add -A
git commit -m "Backup: $(date)"
git push origin main

# Clone from GitHub (disaster recovery)
git clone https://github.com/Chi-eze/ogafix-website.git
```

---

## Disaster Scenarios

### Scenario 1: Database Corruption

**Problem:** Database is corrupted or data is lost

**Recovery:**

```bash
# 1. Identify latest good backup
aws rds describe-db-snapshots --db-instance-identifier ogafix \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime]'

# 2. Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ogafix-restored \
  --db-snapshot-identifier <snapshot-id>

# 3. Wait for restoration
aws rds wait db-instance-available --db-instance-identifier ogafix-restored

# 4. Update connection string in .env
# 5. Restart containers
docker-compose restart backend
```

### Scenario 2: Application Crash

**Problem:** Backend or frontend crashes

**Recovery:**

```bash
# Check logs
docker logs ogafix-backend
docker logs ogafix-frontend

# Restart containers
docker-compose restart

# Or rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Scenario 3: Complete Infrastructure Loss

**Problem:** EC2 instance is deleted or corrupted

**Recovery:**

```bash
# 1. Launch new EC2 instance
# 2. SSH into new instance
# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Clone repository
git clone https://github.com/Chi-eze/ogafix-website.git
cd ogafix-website

# 5. Create .env file
cat > .env << 'EOF'
DB_HOST=ogafix-db.clug0ckyoc91.eu-west-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=ogafix
DB_USER=ogafixadmin
DB_PASSWORD=ChangeMe123!
NODE_ENV=production
FRONTEND_URL=https://ogafix.work
EOF

# 6. Start services
docker-compose up -d

# 7. Update DNS to point to new instance
# 8. Setup SSL certificate
sudo certbot certonly --standalone -d ogafix.work
```

### Scenario 4: DNS/Domain Issues

**Problem:** Domain not resolving or DNS is down

**Recovery:**

```bash
# 1. Update GoDaddy DNS records
# Point A record to new IP address

# 2. Wait for DNS propagation (5-30 minutes)
nslookup ogafix.work
dig ogafix.work

# 3. Verify connectivity
curl https://ogafix.work/health
```

---

## Monitoring & Alerts

### Health Checks

```bash
# Backend health
curl -s http://localhost:3000/health | jq .

# Frontend health
curl -s http://localhost/ | head -20

# Database connectivity
docker exec ogafix-backend node -e "
  const pg = require('pg');
  const client = new pg.Client(process.env);
  client.connect().then(() => {
    console.log('✓ Database connected');
    process.exit(0);
  }).catch(err => {
    console.error('✗ Database error:', err.message);
    process.exit(1);
  });
"
```

### Container Logs

```bash
# Real-time logs
docker-compose logs -f

# Backend logs
docker logs -f ogafix-backend

# Frontend logs
docker logs -f ogafix-frontend

# Last 100 lines
docker logs --tail 100 ogafix-backend
```

### System Resources

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

---

## Maintenance Tasks

### Weekly

- [ ] Check backup status
- [ ] Review logs for errors
- [ ] Test database connectivity
- [ ] Verify SSL certificate expiration

### Monthly

- [ ] Create manual database backup
- [ ] Review and update security groups
- [ ] Check for software updates
- [ ] Test disaster recovery procedure

### Quarterly

- [ ] Full disaster recovery drill
- [ ] Review and update documentation
- [ ] Audit access logs
- [ ] Update credentials if needed

---

## Checklist for New Deployment

- [ ] Clone repository
- [ ] Create .env file with credentials
- [ ] Verify database connectivity
- [ ] Build Docker images
- [ ] Start docker-compose
- [ ] Verify backend health
- [ ] Verify frontend health
- [ ] Update DNS records
- [ ] Setup SSL certificate
- [ ] Test API endpoints
- [ ] Monitor logs for errors

---

## Support & Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port
lsof -i :3000
lsof -i :80

# Kill process
kill -9 <PID>
```

**Docker daemon not running:**
```bash
# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

**Database connection refused:**
```bash
# Check RDS security group
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Verify credentials
psql -h <host> -U <user> -d <database>
```

**SSL certificate issues:**
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# View renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## Contact & Escalation

- **Technical Issues:** Check logs and documentation
- **Database Issues:** Contact AWS support
- **Domain Issues:** Contact GoDaddy support
- **Emergency:** Contact team lead

---

**Last Updated:** 2026-06-27
**Version:** 1.0
**Status:** Production Ready
