# Medivue Pediatric NPO Setup Guide

## System Requirements

### Node.js
- **Required Version**: LTS (18.x or 20.x)
- **⚠️ Warning**: Do not use Node.js v22+ as it causes compatibility issues
- **Recommendation**: Use nvm (Node Version Manager) to manage Node.js versions

### Python
- Required for ML service
- Python 3.8+ recommended
- See `ml_models/flare_predictor/requirements.txt` for Python dependencies

### PostgreSQL
- Version 12+ recommended
- Two databases required:
  1. `medivue` - Main application database
  2. `ibd_flarepredictor` - ML model database

## Port Configuration

| Service | Port | Notes |
|---------|------|-------|
| Frontend | 3000 | React development server |
| Backend | 3002 | Express server |
| ML Service | 5000 | Flask server |

## Setup Steps

1. **Database Setup**
   ```bash
   # Run migrations in order
   node scripts/run_migrations.js
   ```
   - Verify all required columns exist
   - Key tables: users, roles, login_history
   - Required columns: failed_login_attempts in users table

2. **Backend Setup**
   ```bash
   npm install
   ```
   - Verify package versions in package.json
   - No beta versions (e.g., Express should be v4.18.x, not v5.x)
   - MUI packages should be v5.x series

3. **ML Service Setup**
   ```bash
   cd ml_models/flare_predictor
   pip install -r requirements.txt
   ```

4. **Frontend Setup**
   - Proxy configuration in package.json points to backend port (3002)
   - Verify all React dependencies are compatible

## Common Issues and Solutions

1. **Missing Dependencies**
   - If `ee-first` or other core modules are missing:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Database Column Errors**
   - Check if migrations ran in correct order
   - Verify schema.sql matches current application needs
   - Run `scripts/create_admin_user.js` for initial setup

3. **Port Conflicts**
   - Frontend: Will auto-suggest new port if 3000 is taken
   - Backend: Change port in server/index.js if needed
   - ML Service: Configure in ml_models/flare_predictor/app.py

## Starting Services

Start in this order:
1. Database (PostgreSQL service)
2. Backend: `npm run server`
3. ML Service: Will auto-start with backend
4. Frontend: `npm run client`

Or use the combined command:
```bash
npm start
```

## Development Guidelines

1. **Version Control**
   - Keep package.json versions locked to stable releases
   - Document any version changes
   - Test compatibility before upgrading major versions

2. **Database Changes**
   - Always create migration files
   - Update schema.sql
   - Test migrations on development before production

3. **Configuration**
   - Keep environment-specific settings in config files
   - Use .env files for sensitive data
   - Document all configuration options

## Troubleshooting

If services fail to start:
1. Check Node.js version (`node -v`)
2. Verify database connections
3. Check port availability
4. Review logs in logs/ directory
5. Ensure all migrations are up to date 