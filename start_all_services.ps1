# MediVue Health - Start All Services
# PowerShell script to start all application services

Write-Host "Starting MediVue Health Services..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Function to start a service in background
function Start-ServiceInBackground {
    param(
        [string]$ServiceName,
        [string]$Command,
        [string]$WorkingDirectory = "."
    )
    
    Write-Host "Starting $ServiceName..." -ForegroundColor Yellow
    
    try {
        $process = Start-Process -FilePath "powershell" -ArgumentList "-Command", $Command -WorkingDirectory $WorkingDirectory -WindowStyle Minimized -PassThru
        Write-Host "$ServiceName started successfully (PID: $($process.Id))" -ForegroundColor Green
        return $process
    }
    catch {
        Write-Host "Failed to start $ServiceName: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Start React Frontend
$frontendProcess = Start-ServiceInBackground -ServiceName "React Frontend" -Command "npm run client"

# Wait a moment for frontend to start
Start-Sleep -Seconds 3

# Start Node.js Backend
$backendProcess = Start-ServiceInBackground -ServiceName "Node.js Backend" -Command "npm run server"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start ML APIs
$mlProcess = Start-ServiceInBackground -ServiceName "ML APIs" -Command "python run_ml_apis.py"

Write-Host ""
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3002" -ForegroundColor Cyan
Write-Host "ML APIs: Running on their respective ports" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 10
    }
}
catch {
    Write-Host ""
    Write-Host "Stopping all services..." -ForegroundColor Red
    
    if ($frontendProcess) { Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($backendProcess) { Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($mlProcess) { Stop-Process -Id $mlProcess.Id -Force -ErrorAction SilentlyContinue }
    
    Write-Host "All services stopped." -ForegroundColor Green
} 