#!/bin/bash

# OgaFix Monitoring Script
# Run this periodically to check system health
# Usage: ./scripts/monitor.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 OgaFix System Health Check"
echo "=============================="
echo ""

# Check 1: Backend Service Status
echo -e "${YELLOW}1. Backend Service Status${NC}"
if sudo systemctl is-active --quiet ogafix-backend; then
  echo -e "${GREEN}✓ Backend service is running${NC}"
else
  echo -e "${RED}✗ Backend service is NOT running${NC}"
  echo "  Start with: sudo systemctl start ogafix-backend"
fi

# Check 2: Backend Health
echo ""
echo -e "${YELLOW}2. Backend Health Check${NC}"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
  HEALTH=$(curl -s http://localhost:3000/health | jq -r '.status' 2>/dev/null || echo "unknown")
  echo -e "${GREEN}✓ Backend is responding (status: $HEALTH)${NC}"
else
  echo -e "${RED}✗ Backend is NOT responding${NC}"
  echo "  Check logs: tail -f /var/log/ogafix-backend.log"
fi

# Check 3: Nginx Status
echo ""
echo -e "${YELLOW}3. Nginx Status${NC}"
if sudo systemctl is-active --quiet nginx; then
  echo -e "${GREEN}✓ Nginx is running${NC}"
else
  echo -e "${RED}✗ Nginx is NOT running${NC}"
  echo "  Start with: sudo systemctl start nginx"
fi

# Check 4: Frontend Availability
echo ""
echo -e "${YELLOW}4. Frontend Availability${NC}"
if curl -s http://localhost/ > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
  echo -e "${RED}✗ Frontend is NOT accessible${NC}"
  echo "  Check Nginx: sudo systemctl status nginx"
fi

# Check 5: Database Connectivity
echo ""
echo -e "${YELLOW}5. Database Connectivity${NC}"
if timeout 5 bash -c 'exec 3<>/dev/tcp/ogafix-db.clug0ckyoc91.eu-west-1.rds.amazonaws.com/5432' 2>/dev/null; then
  echo -e "${GREEN}✓ Database is reachable${NC}"
else
  echo -e "${RED}✗ Database is NOT reachable${NC}"
  echo "  Check security groups and RDS status"
fi

# Check 6: Disk Space
echo ""
echo -e "${YELLOW}6. Disk Space${NC}"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
  echo -e "${GREEN}✓ Disk usage: ${DISK_USAGE}%${NC}"
else
  echo -e "${RED}✗ Disk usage is high: ${DISK_USAGE}%${NC}"
  echo "  Clean up logs or increase disk space"
fi

# Check 7: Memory Usage
echo ""
echo -e "${YELLOW}7. Memory Usage${NC}"
MEM_USAGE=$(free | awk 'NR==2 {printf("%.0f", $3/$2 * 100)}')
if [ "$MEM_USAGE" -lt 80 ]; then
  echo -e "${GREEN}✓ Memory usage: ${MEM_USAGE}%${NC}"
else
  echo -e "${RED}✗ Memory usage is high: ${MEM_USAGE}%${NC}"
fi

# Check 8: SSL Certificate
echo ""
echo -e "${YELLOW}8. SSL Certificate${NC}"
if [ -f "/etc/letsencrypt/live/ogafix.work/fullchain.pem" ]; then
  EXPIRY=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/ogafix.work/fullchain.pem | cut -d= -f2)
  DAYS_LEFT=$(( ($(date -d "$EXPIRY" +%s) - $(date +%s)) / 86400 ))
  
  if [ "$DAYS_LEFT" -gt 30 ]; then
    echo -e "${GREEN}✓ SSL certificate valid for $DAYS_LEFT days${NC}"
  else
    echo -e "${YELLOW}⚠ SSL certificate expires in $DAYS_LEFT days${NC}"
    echo "  Renew with: sudo certbot renew"
  fi
else
  echo -e "${RED}✗ SSL certificate not found${NC}"
  echo "  Setup with: sudo certbot certonly --standalone -d ogafix.work"
fi

# Check 9: Recent Errors in Logs
echo ""
echo -e "${YELLOW}9. Recent Errors${NC}"
ERROR_COUNT=$(grep -c "ERROR\|error\|Error" /var/log/ogafix-backend.log 2>/dev/null || echo "0")
if [ "$ERROR_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✓ No recent errors in backend logs${NC}"
else
  echo -e "${YELLOW}⚠ Found $ERROR_COUNT errors in recent logs${NC}"
  echo "  View logs: tail -50 /var/log/ogafix-backend.log"
fi

# Summary
echo ""
echo "=============================="
echo -e "${GREEN}Health check complete!${NC}"
echo ""
echo "For more details:"
echo "  Backend logs: tail -f /var/log/ogafix-backend.log"
echo "  Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  Service status: sudo systemctl status ogafix-backend"
echo ""
