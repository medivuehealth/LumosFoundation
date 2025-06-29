# Deploy Nonprofit Website for Cloud Provider Verification
# This script helps set up the nonprofit website for deployment

Write-Host "MediVue Health - Nonprofit Website Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git not found. Please install Git from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Create a new directory for the website
$websiteDir = "medivue-nonprofit-website"
if (Test-Path $websiteDir) {
    Write-Host "Website directory already exists. Removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $websiteDir
}

New-Item -ItemType Directory -Name $websiteDir
Write-Host "Created website directory: $websiteDir" -ForegroundColor Green

# Copy the website files
Copy-Item "index.html" -Destination "$websiteDir/index.html"
Copy-Item "deploy_website.md" -Destination "$websiteDir/README.md"

# Create a simple README for GitHub
$readmeContent = @"
# MediVue Health - Nonprofit Organization

## About Us

MediVue Health is a nonprofit organization dedicated to improving the quality of life for pediatric Inflammatory Bowel Disease (IBD) patients and their families through innovative technology and comprehensive care support.

## Our Mission

We believe every child deserves access to advanced healthcare tools and a supportive community that understands their unique challenges. Our platform combines AI-powered flare prediction, comprehensive health monitoring, and compassionate community support.

## Platform Features

- **AI-Powered Flare Prediction**: 85% accuracy in predicting IBD flares
- **Health Monitoring**: Comprehensive symptom and medication tracking
- **Community Support**: Peer support and recovery stories
- **Educational Resources**: Medical journals and patient guides
- **HIPAA Compliant**: Secure data handling and privacy protection

## Contact Information

- Email: info@medivuehealth.org
- Phone: (555) 123-4567
- Address: [Your Organization Address]

## Nonprofit Status

MediVue Health operates as a nonprofit organization committed to making advanced pediatric IBD care accessible to all families, regardless of their financial circumstances.

---

*This website serves as the official online presence for MediVue Health nonprofit organization.*
"@

Set-Content -Path "$websiteDir/README.md" -Value $readmeContent

# Create .gitignore
$gitignoreContent = @"
# System files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
"@

Set-Content -Path "$websiteDir/.gitignore" -Value $gitignoreContent

Write-Host ""
Write-Host "Website files prepared successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Navigate to the website directory: cd $websiteDir" -ForegroundColor Cyan
Write-Host "2. Initialize Git repository: git init" -ForegroundColor Cyan
Write-Host "3. Add files: git add ." -ForegroundColor Cyan
Write-Host "4. Commit: git commit -m 'Initial nonprofit website'" -ForegroundColor Cyan
Write-Host "5. Create GitHub repository: medivue-health-website" -ForegroundColor Cyan
Write-Host "6. Add remote: git remote add origin https://github.com/[username]/medivue-health-website.git" -ForegroundColor Cyan
Write-Host "7. Push: git push -u origin main" -ForegroundColor Cyan
Write-Host "8. Enable GitHub Pages in repository settings" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your website will be available at: https://[username].github.io/medivue-health-website" -ForegroundColor Green
Write-Host ""
Write-Host "Use this URL for cloud provider nonprofit applications!" -ForegroundColor Yellow

# Open the website directory in File Explorer
Start-Process $websiteDir 