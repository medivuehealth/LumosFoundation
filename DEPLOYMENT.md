# Medivue Pediatric IBD Care Platform - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Medivue Pediatric IBD Care Platform in various environments, from development to production.

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows Server
- **Node.js**: LTS version (18.x or 20.x)
- **Python**: 3.8 or higher
- **PostgreSQL**: 12 or higher
- **Redis**: 6.0 or higher (optional, for caching)
- **Docker**: 20.10 or higher (for containerized deployment)

### Hardware Requirements

#### Development
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB
- **Network**: Standard internet connection

#### Production
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **Network**: High-speed internet with SSL certificate

## Environment Setup

### 1. Development Environment

#### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/medivue-pediatric-npo.git
   cd medivue-pediatric-npo
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies
   cd ml_models/flare_predictor
   pip install -r requirements.txt
   cd ../..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/medivue_db
   
   # Server Configuration
   PORT=3002
   NODE_ENV=development
   
   # ML Service Configuration
   ML_SERVICE_URL=http://localhost:5000
   
   # Security
   JWT_SECRET=your-development-jwt-secret
   ENCRYPTION_KEY=your-development-encryption-key
   
   # External APIs
   WEATHER_API_KEY=your-weather-api-key
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the application**
   ```bash
   npm start
   ```

#### Docker Development Setup

1. **Build and run with Docker Compose**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3002
   - ML Service: http://localhost:5000

### 2. Staging Environment

#### Staging Deployment

1. **Set up staging server**
   ```bash
   # Create staging directory
   mkdir -p /opt/medivue/staging
   cd /opt/medivue/staging
   
   # Clone repository
   git clone https://github.com/your-org/medivue-pediatric-npo.git .
   git checkout staging
   ```

2. **Configure staging environment**
   ```bash
   # Create staging environment file
   cp .env.example .env.staging
   
   # Edit staging configuration
   nano .env.staging
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.staging.yml up -d
   ```

### 3. Production Environment

#### Production Deployment Options

##### Option A: Traditional Server Deployment

1. **Server Preparation**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install required packages
   sudo apt install -y nodejs npm python3 python3-pip postgresql postgresql-contrib nginx redis-server
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Database Setup**
   ```bash
   # Create database and user
   sudo -u postgres psql
   
   CREATE DATABASE medivue_prod;
   CREATE USER medivue_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE medivue_prod TO medivue_user;
   \q
   ```

3. **Application Deployment**
   ```bash
   # Create application directory
   sudo mkdir -p /opt/medivue/production
   sudo chown $USER:$USER /opt/medivue/production
   cd /opt/medivue/production
   
   # Clone repository
   git clone https://github.com/your-org/medivue-pediatric-npo.git .
   git checkout main
   
   # Install dependencies
   npm install --production
   cd ml_models/flare_predictor && pip install -r requirements.txt && cd ../..
   
   # Set up environment
   cp .env.example .env.production
   nano .env.production
   ```

4. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/medivue
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       # Frontend
       location / {
           root /opt/medivue/production/build;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:3002;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # ML Service
       location /ml {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/medivue /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Start application with PM2**
   ```bash
   # Create PM2 ecosystem file
   nano ecosystem.config.js
   ```

   ```javascript
   module.exports = {
     apps: [
       {
         name: 'medivue-backend',
         script: 'server/index.js',
         env: {
           NODE_ENV: 'production',
           PORT: 3002
         },
         instances: 'max',
         exec_mode: 'cluster'
       },
       {
         name: 'medivue-ml',
         script: 'ml_models/flare_predictor/app.py',
         interpreter: 'python3',
         env: {
           FLASK_ENV: 'production'
         }
       }
     ]
   };
   ```

   ```bash
   # Start applications
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

##### Option B: Docker Production Deployment

1. **Create production Docker Compose file**
   ```bash
   nano docker-compose.prod.yml
   ```

   ```yaml
   version: '3.8'
   
   services:
     frontend:
       build:
         context: .
         dockerfile: Dockerfile.frontend
       ports:
         - "80:80"
       depends_on:
         - backend
       environment:
         - REACT_APP_API_URL=https://api.your-domain.com
   
     backend:
       build:
         context: .
         dockerfile: Dockerfile.backend
       ports:
         - "3002:3002"
       depends_on:
         - postgres
         - redis
         - ml-service
       environment:
         - DATABASE_URL=postgresql://medivue_user:password@postgres:5432/medivue_prod
         - REDIS_URL=redis://redis:6379
         - ML_SERVICE_URL=http://ml-service:5000
         - NODE_ENV=production
   
     ml-service:
       build:
         context: ./ml_models/flare_predictor
         dockerfile: Dockerfile
       ports:
         - "5000:5000"
       environment:
         - FLASK_ENV=production
   
     postgres:
       image: postgres:13
       environment:
         - POSTGRES_DB=medivue_prod
         - POSTGRES_USER=medivue_user
         - POSTGRES_PASSWORD=secure_password
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"
   
     redis:
       image: redis:6-alpine
       ports:
         - "6379:6379"
       volumes:
         - redis_data:/data
   
     nginx:
       image: nginx:alpine
       ports:
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./ssl:/etc/nginx/ssl
       depends_on:
         - frontend
         - backend
   
   volumes:
     postgres_data:
     redis_data:
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

##### Option C: Cloud Deployment

#### AWS Deployment

1. **EC2 Instance Setup**
   ```bash
   # Launch EC2 instance (t3.medium or larger)
   # Connect to instance
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

2. **Install Docker and Docker Compose**
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Deploy application**
   ```bash
   git clone https://github.com/your-org/medivue-pediatric-npo.git
   cd medivue-pediatric-npo
   docker-compose -f docker-compose.prod.yml up -d
   ```

#### Google Cloud Platform Deployment

1. **Create GCP project and enable APIs**
   ```bash
   gcloud config set project your-project-id
   gcloud services enable compute.googleapis.com
   gcloud services enable container.googleapis.com
   ```

2. **Deploy with Cloud Run**
   ```bash
   # Build and push Docker images
   docker build -t gcr.io/your-project-id/medivue-backend .
   docker push gcr.io/your-project-id/medivue-backend
   
   # Deploy to Cloud Run
   gcloud run deploy medivue-backend \
     --image gcr.io/your-project-id/medivue-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## SSL Certificate Setup

### Let's Encrypt (Free)

1. **Install Certbot**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Set up auto-renewal**
   ```bash
   sudo crontab -e
   # Add this line:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Commercial SSL Certificate

1. **Purchase SSL certificate from provider**
2. **Install certificate files**
   ```bash
   sudo mkdir -p /etc/ssl/medivue
   sudo cp your-certificate.crt /etc/ssl/medivue/
   sudo cp your-private-key.key /etc/ssl/medivue/
   ```

3. **Update Nginx configuration**
   ```nginx
   ssl_certificate /etc/ssl/medivue/your-certificate.crt;
   ssl_certificate_key /etc/ssl/medivue/your-private-key.key;
   ```

## Database Migration and Backup

### Database Migration

1. **Run migrations**
   ```bash
   npm run migrate
   ```

2. **Seed initial data**
   ```bash
   npm run seed
   ```

### Database Backup

1. **Create backup script**
   ```bash
   nano /opt/medivue/backup.sh
   ```

   ```bash
   #!/bin/bash
   BACKUP_DIR="/opt/medivue/backups"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   mkdir -p $BACKUP_DIR
   
   pg_dump medivue_prod > $BACKUP_DIR/medivue_backup_$DATE.sql
   
   # Keep only last 7 days of backups
   find $BACKUP_DIR -name "medivue_backup_*.sql" -mtime +7 -delete
   ```

2. **Set up automated backups**
   ```bash
   chmod +x /opt/medivue/backup.sh
   crontab -e
   # Add this line for daily backups at 2 AM:
   0 2 * * * /opt/medivue/backup.sh
   ```

## Monitoring and Logging

### Application Monitoring

1. **Set up PM2 monitoring**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 30
   ```

2. **Configure log rotation**
   ```bash
   sudo nano /etc/logrotate.d/medivue
   ```

   ```
   /opt/medivue/production/logs/*.log {
       daily
       missingok
       rotate 30
       compress
       delaycompress
       notifempty
       create 644 medivue medivue
   }
   ```

### Health Checks

1. **Create health check endpoint**
   ```javascript
   // In server/index.js
   app.get('/health', (req, res) => {
     res.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       services: {
         database: 'connected',
         ml_service: 'connected'
       }
     });
   });
   ```

2. **Set up monitoring alerts**
   ```bash
   # Create monitoring script
   nano /opt/medivue/monitor.sh
   ```

   ```bash
   #!/bin/bash
   HEALTH_CHECK=$(curl -s http://localhost:3002/health)
   
   if [[ $HEALTH_CHECK != *"healthy"* ]]; then
     echo "Health check failed: $HEALTH_CHECK" | mail -s "Medivue Health Alert" admin@your-domain.com
   fi
   ```

## Security Configuration

### Firewall Setup

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Environment Security

1. **Secure environment variables**
   ```bash
   # Generate secure secrets
   openssl rand -hex 32  # JWT_SECRET
   openssl rand -hex 32  # ENCRYPTION_KEY
   ```

2. **Database security**
   ```sql
   -- Create read-only user for analytics
   CREATE USER medivue_readonly WITH PASSWORD 'readonly_password';
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO medivue_readonly;
   ```

## Performance Optimization

### Frontend Optimization

1. **Build optimization**
   ```bash
   npm run build
   ```

2. **Enable compression**
   ```nginx
   # In Nginx configuration
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
   ```

### Backend Optimization

1. **Enable clustering**
   ```javascript
   const cluster = require('cluster');
   const numCPUs = require('os').cpus().length;
   
   if (cluster.isMaster) {
     for (let i = 0; i < numCPUs; i++) {
       cluster.fork();
     }
   } else {
     // Worker process
     require('./server/index.js');
   }
   ```

2. **Database optimization**
   ```sql
   -- Create indexes for frequently queried columns
   CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, entry_date);
   CREATE INDEX idx_meal_logs_user_timestamp ON meal_logs(user_id, timestamp);
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using a port
   sudo netstat -tulpn | grep :3002
   
   # Kill process if needed
   sudo kill -9 <PID>
   ```

2. **Database connection issues**
   ```bash
   # Test database connection
   psql -h localhost -U medivue_user -d medivue_prod
   
   # Check PostgreSQL logs
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```

3. **Memory issues**
   ```bash
   # Monitor memory usage
   free -h
   
   # Check PM2 memory usage
   pm2 monit
   ```

### Log Analysis

```bash
# View application logs
pm2 logs

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -u nginx -f
```

## Maintenance

### Regular Maintenance Tasks

1. **Update dependencies**
   ```bash
   npm update
   pip install --upgrade -r ml_models/flare_predictor/requirements.txt
   ```

2. **Database maintenance**
   ```sql
   -- Vacuum database
   VACUUM ANALYZE;
   
   -- Update statistics
   ANALYZE;
   ```

3. **System updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

### Backup and Recovery

1. **Test backup restoration**
   ```bash
   # Create test database
   createdb medivue_test
   
   # Restore backup
   psql medivue_test < /opt/medivue/backups/medivue_backup_20250623.sql
   ```

2. **Disaster recovery plan**
   - Document recovery procedures
   - Test recovery process regularly
   - Keep backup copies off-site

## Support and Documentation

### Getting Help

- **Documentation**: https://docs.medivue-pediatric.org
- **GitHub Issues**: https://github.com/medivue-pediatric/issues
- **Email Support**: support@medivue-pediatric.org

### Monitoring Tools

- **Application Monitoring**: PM2, New Relic, DataDog
- **Server Monitoring**: htop, iotop, netstat
- **Database Monitoring**: pg_stat_statements, pgBadger

---

This deployment guide is regularly updated. For the latest version, please refer to the official documentation at https://docs.medivue-pediatric.org/deployment. 