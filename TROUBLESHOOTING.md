# Medivue Pediatric IBD Care Platform - Troubleshooting Guide

## Overview

This troubleshooting guide provides solutions for common issues encountered when setting up, running, and maintaining the Medivue Pediatric IBD Care Platform.

## Quick Diagnosis

### Check System Status

```bash
# Check if all services are running
pm2 status

# Check database connection
psql -h localhost -U medivue_user -d medivue_db -c "SELECT 1;"

# Check ML service
curl http://localhost:5000/health

# Check backend API
curl http://localhost:3002/health
```

### Check Logs

```bash
# Application logs
pm2 logs

# Database logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u nginx -f
```

## Common Issues and Solutions

### 1. Database Issues

#### Issue: Database Connection Failed

**Symptoms:**
- Error: "ECONNREFUSED" or "Connection refused"
- Application fails to start
- API endpoints return 500 errors

**Solutions:**

1. **Check PostgreSQL service**
   ```bash
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. **Verify database configuration**
   ```bash
   # Check if database exists
   sudo -u postgres psql -l
   
   # Check user permissions
   sudo -u postgres psql -c "\du"
   ```

3. **Test connection manually**
   ```bash
   psql -h localhost -U medivue_user -d medivue_db
   ```

4. **Check environment variables**
   ```bash
   # Verify DATABASE_URL in .env file
   cat .env | grep DATABASE_URL
   ```

#### Issue: Migration Errors

**Symptoms:**
- Error: "relation does not exist"
- Error: "column does not exist"
- Database schema inconsistencies

**Solutions:**

1. **Run migrations in order**
   ```bash
   npm run migrate
   ```

2. **Check migration status**
   ```bash
   # List all migrations
   ls database/migrations/
   
   # Check which migrations have been applied
   psql -h localhost -U medivue_user -d medivue_db -c "SELECT * FROM migrations;"
   ```

3. **Reset database (development only)**
   ```bash
   # Drop and recreate database
   dropdb medivue_db
   createdb medivue_db
   npm run init-db
   ```

#### Issue: Data Type Conflicts

**Symptoms:**
- Error: "invalid input syntax for type boolean"
- Error: "column type mismatch"

**Solutions:**

1. **Check column data types**
   ```bash
   psql -h localhost -U medivue_user -d medivue_db -c "\d journal_entries"
   ```

2. **Run data type migration**
   ```bash
   node database/run_fix_migration.js
   ```

3. **Verify data constraints**
   ```bash
   psql -h localhost -U medivue_user -d medivue_db -c "SELECT * FROM information_schema.check_constraints WHERE table_name = 'journal_entries';"
   ```

### 2. Authentication Issues

#### Issue: JWT Token Invalid

**Symptoms:**
- Error: "Invalid token"
- Users logged out unexpectedly
- API requests return 401 errors

**Solutions:**

1. **Check JWT secret**
   ```bash
   # Verify JWT_SECRET in .env file
   cat .env | grep JWT_SECRET
   ```

2. **Clear browser storage**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

3. **Check token expiration**
   ```bash
   # Verify token format and expiration
   jwt.decode(token) // In browser console
   ```

#### Issue: Login Failures

**Symptoms:**
- Error: "Invalid credentials"
- Users cannot log in
- Password reset not working

**Solutions:**

1. **Check user account**
   ```bash
   psql -h localhost -U medivue_user -d medivue_db -c "SELECT username, failed_login_attempts FROM users WHERE username = 'admin';"
   ```

2. **Reset user password**
   ```bash
   node scripts/reset_passwords.js
   ```

3. **Check password hashing**
   ```bash
   # Verify bcrypt is working
   node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('test', 10));"
   ```

### 3. ML Service Issues

#### Issue: ML Service Not Responding

**Symptoms:**
- Error: "ML service connection failed"
- Predictions not working
- Timeout errors

**Solutions:**

1. **Check ML service status**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Restart ML service**
   ```bash
   pm2 restart medivue-ml
   ```

3. **Check Python dependencies**
   ```bash
   cd ml_models/flare_predictor
   pip list | grep -E "(flask|scikit-learn|pandas)"
   ```

4. **Verify model files**
   ```bash
   ls -la ml_models/flare_predictor/models/
   ```

#### Issue: Prediction Errors

**Symptoms:**
- Error: "Model not found"
- Error: "Feature mismatch"
- Incorrect predictions

**Solutions:**

1. **Check model files**
   ```bash
   ls -la models/
   file models/flare_predictor_1.0.0.joblib
   ```

2. **Verify feature names**
   ```bash
   python ml_models/flare_predictor/check_data.py
   ```

3. **Test model directly**
   ```bash
   python ml_models/flare_predictor/test_prediction.py
   ```

### 4. Frontend Issues

#### Issue: React App Not Loading

**Symptoms:**
- White screen
- JavaScript errors in console
- Assets not loading

**Solutions:**

1. **Check build files**
   ```bash
   ls -la build/
   npm run build
   ```

2. **Clear browser cache**
   ```bash
   # Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   # Or clear cache in browser settings
   ```

3. **Check proxy configuration**
   ```bash
   # Verify proxy in package.json
   cat package.json | grep proxy
   ```

#### Issue: Component Rendering Errors

**Symptoms:**
- React component errors
- Missing components
- Styling issues

**Solutions:**

1. **Check component imports**
   ```bash
   # Look for import errors in console
   # Check file paths and component names
   ```

2. **Verify dependencies**
   ```bash
   npm ls react react-dom
   npm ls lucide-react
   ```

3. **Check Tailwind CSS**
   ```bash
   # Verify Tailwind is compiled
   npx tailwindcss -i ./src/index.css -o ./build/output.css
   ```

### 5. API Issues

#### Issue: CORS Errors

**Symptoms:**
- Error: "CORS policy blocked"
- API requests failing from frontend
- Preflight request errors

**Solutions:**

1. **Check CORS configuration**
   ```javascript
   // In server/index.js
   app.use(cors({
     origin: ['http://localhost:3000', 'https://your-domain.com'],
     credentials: true
   }));
   ```

2. **Verify request headers**
   ```javascript
   // In frontend API calls
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
   }
   ```

#### Issue: API Endpoint Not Found

**Symptoms:**
- Error: "404 Not Found"
- API routes not working
- Incorrect endpoint URLs

**Solutions:**

1. **Check route definitions**
   ```bash
   # Verify routes in server/routes/
   ls server/routes/
   ```

2. **Test endpoints manually**
   ```bash
   curl -X GET http://localhost:3002/api/health
   curl -X POST http://localhost:3002/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'
   ```

3. **Check route middleware**
   ```javascript
   // Verify middleware order in server/index.js
   app.use('/api/auth', authRoutes);
   app.use('/api/journal', journalRoutes);
   ```

### 6. Performance Issues

#### Issue: Slow Page Load Times

**Symptoms:**
- Pages taking long to load
- Slow API responses
- High memory usage

**Solutions:**

1. **Check database performance**
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

2. **Optimize database queries**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, entry_date);
   CREATE INDEX idx_meal_logs_user_timestamp ON meal_logs(user_id, timestamp);
   ```

3. **Enable caching**
   ```javascript
   // Add Redis caching
   const redis = require('redis');
   const client = redis.createClient();
   ```

#### Issue: High Memory Usage

**Symptoms:**
- Application crashes
- Slow performance
- Memory leaks

**Solutions:**

1. **Monitor memory usage**
   ```bash
   pm2 monit
   htop
   ```

2. **Check for memory leaks**
   ```bash
   # Use Node.js heap snapshots
   node --inspect server/index.js
   ```

3. **Optimize bundle size**
   ```bash
   npm run build
   # Check bundle analyzer
   npm install --save-dev webpack-bundle-analyzer
   ```

### 7. Security Issues

#### Issue: Unauthorized Access

**Symptoms:**
- Users accessing restricted data
- Missing authentication checks
- Security vulnerabilities

**Solutions:**

1. **Check authentication middleware**
   ```javascript
   // Verify auth middleware is applied
   app.use('/api/journal', authenticateToken, journalRoutes);
   ```

2. **Review role-based access**
   ```sql
   -- Check user roles and permissions
   SELECT username, role FROM users;
   ```

3. **Audit access logs**
   ```bash
   # Check login history
   psql -h localhost -U medivue_user -d medivue_db -c "SELECT * FROM login_history ORDER BY timestamp DESC LIMIT 10;"
   ```

#### Issue: Data Encryption Problems

**Symptoms:**
- Encrypted data not decrypting
- Encryption key errors
- Data corruption

**Solutions:**

1. **Check encryption key**
   ```bash
   # Verify ENCRYPTION_KEY in .env
   cat .env | grep ENCRYPTION_KEY
   ```

2. **Test encryption/decryption**
   ```javascript
   // Test encryption functions
   const CryptoJS = require('crypto-js');
   const encrypted = CryptoJS.AES.encrypt('test', process.env.ENCRYPTION_KEY).toString();
   const decrypted = CryptoJS.AES.decrypt(encrypted, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
   ```

### 8. Environment Issues

#### Issue: Environment Variables Not Loading

**Symptoms:**
- Configuration errors
- Missing environment variables
- Default values being used

**Solutions:**

1. **Check .env file**
   ```bash
   # Verify .env file exists and has correct format
   cat .env
   ```

2. **Load environment variables**
   ```bash
   # Install dotenv if not already installed
   npm install dotenv
   
   # Load in application
   require('dotenv').config();
   ```

3. **Verify variable names**
   ```bash
   # Check for typos in variable names
   grep -r "process.env" server/
   ```

#### Issue: Port Conflicts

**Symptoms:**
- Error: "EADDRINUSE"
- Services not starting
- Port already in use

**Solutions:**

1. **Check port usage**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3002
   sudo lsof -i :3002
   ```

2. **Kill conflicting processes**
   ```bash
   # Kill process using the port
   sudo kill -9 <PID>
   ```

3. **Change port configuration**
   ```bash
   # Update port in .env file
   PORT=3003
   ```

### 9. Development Issues

#### Issue: Hot Reload Not Working

**Symptoms:**
- Changes not reflecting
- Manual restart required
- Development server issues

**Solutions:**

1. **Check file watching**
   ```bash
   # Increase file watcher limit (Linux)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Restart development server**
   ```bash
   npm run client
   ```

3. **Check for syntax errors**
   ```bash
   # Check for JavaScript errors
   npm run lint
   ```

#### Issue: Dependency Conflicts

**Symptoms:**
- Module not found errors
- Version conflicts
- Incompatible packages

**Solutions:**

1. **Clear node_modules**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check dependency versions**
   ```bash
   npm ls
   npm outdated
   ```

3. **Update dependencies**
   ```bash
   npm update
   npm audit fix
   ```

## Diagnostic Tools

### System Health Check

```bash
#!/bin/bash
# medivue-health-check.sh

echo "=== Medivue Health Check ==="

# Check services
echo "1. Checking services..."
pm2 status

# Check database
echo "2. Checking database..."
psql -h localhost -U medivue_user -d medivue_db -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   Database: OK"
else
    echo "   Database: FAILED"
fi

# Check ML service
echo "3. Checking ML service..."
curl -s http://localhost:5000/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ML Service: OK"
else
    echo "   ML Service: FAILED"
fi

# Check backend API
echo "4. Checking backend API..."
curl -s http://localhost:3002/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   Backend API: OK"
else
    echo "   Backend API: FAILED"
fi

# Check disk space
echo "5. Checking disk space..."
df -h | grep -E "(/$|/opt)"

# Check memory usage
echo "6. Checking memory usage..."
free -h

echo "=== Health Check Complete ==="
```

### Log Analysis Script

```bash
#!/bin/bash
# analyze-logs.sh

echo "=== Log Analysis ==="

# Check for errors in application logs
echo "1. Application Errors:"
pm2 logs --lines 100 | grep -i error | tail -10

# Check for errors in database logs
echo "2. Database Errors:"
sudo tail -100 /var/log/postgresql/postgresql-*.log | grep -i error

# Check for errors in nginx logs
echo "3. Nginx Errors:"
sudo tail -100 /var/log/nginx/error.log | grep -i error

# Check for failed login attempts
echo "4. Failed Login Attempts:"
psql -h localhost -U medivue_user -d medivue_db -c "SELECT username, failed_login_attempts, last_login_attempt FROM users WHERE failed_login_attempts > 0;"

echo "=== Log Analysis Complete ==="
```

## Emergency Procedures

### Complete System Reset (Development Only)

```bash
#!/bin/bash
# emergency-reset.sh

echo "WARNING: This will completely reset the system!"
echo "This should only be used in development environments."
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
    echo "Performing emergency reset..."
    
    # Stop all services
    pm2 stop all
    pm2 delete all
    
    # Drop and recreate database
    dropdb medivue_db
    createdb medivue_db
    
    # Clear node_modules
    rm -rf node_modules package-lock.json
    npm install
    
    # Reinitialize database
    npm run init-db
    
    # Start services
    npm start
    
    echo "Emergency reset complete!"
else
    echo "Reset cancelled."
fi
```

### Data Recovery

```bash
#!/bin/bash
# data-recovery.sh

echo "=== Data Recovery ==="

# Check for recent backups
echo "1. Available backups:"
ls -la /opt/medivue/backups/

# Restore from latest backup
echo "2. Restoring from latest backup..."
LATEST_BACKUP=$(ls -t /opt/medivue/backups/medivue_backup_*.sql | head -1)
if [ -n "$LATEST_BACKUP" ]; then
    psql -h localhost -U medivue_user -d medivue_db < "$LATEST_BACKUP"
    echo "   Restored from: $LATEST_BACKUP"
else
    echo "   No backups found!"
fi

echo "=== Data Recovery Complete ==="
```

## Getting Help

### Before Contacting Support

1. **Collect diagnostic information**
   ```bash
   # Run health check
   ./medivue-health-check.sh > health-check.log
   
   # Collect logs
   pm2 logs --lines 1000 > app-logs.log
   
   # System information
   uname -a > system-info.log
   node --version >> system-info.log
   npm --version >> system-info.log
   ```

2. **Document the issue**
   - What were you doing when the issue occurred?
   - What error messages did you see?
   - What steps have you already tried?
   - What is your environment (OS, Node.js version, etc.)?

### Contact Information

- **Documentation**: https://docs.medivue-pediatric.org
- **GitHub Issues**: https://github.com/medivue-pediatric/issues
- **Email Support**: support@medivue-pediatric.org
- **Emergency Contact**: emergency@medivue-pediatric.org

### Support Response Times

- **Critical Issues** (system down): 2-4 hours
- **High Priority** (major functionality broken): 24 hours
- **Medium Priority** (minor issues): 48 hours
- **Low Priority** (feature requests): 1 week

---

This troubleshooting guide is regularly updated. For the latest version, please refer to the official documentation at https://docs.medivue-pediatric.org/troubleshooting. 