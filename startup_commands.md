# Service Startup Commands

## Development Startup

1. Start both services together (recommended):
```bash
npm start
```

This will start both services concurrently:
- Backend will run on port 3002
- Frontend will run on port 3000

## Running Services Separately

1. Start the backend (in one terminal):
```bash
node server/index.js
```
You should see:
- "Server running on port 3002"
- "Successfully connected to PostgreSQL database"

2. Start the frontend (in another terminal):
```bash
npm run client
```

## Troubleshooting Backend Connection Issues

If you encounter backend connection issues (port 3002), follow these steps:

1. Check if there's already a process running on port 3002:
```bash
lsof -i :3002    # On Unix/Mac
# or
netstat -ano | findstr :3002    # On Windows
```

2. Kill any existing process if needed, then start the backend again:
```bash
node server/index.js
```

## Viewing Logs

Logs are written to the logs/ directory:
- Backend logs: backend-error.log, backend-out.log
- Frontend logs: frontend-error.log, frontend-out.log
- Combined logs: combined.log 