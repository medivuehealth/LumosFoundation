# Screenshot Capture Guide for MediVue Health Website

## 📸 **Screenshots to Capture**

Since your application is running locally, you can capture these screenshots to enhance the nonprofit website:

### **1. Main Dashboard (Summary Tab)**
- **URL**: http://localhost:3000 (Home tab)
- **What to capture**: Overview of health metrics, recent activities
- **File name**: `dashboard-screenshot.png`

### **2. AI Flare Prediction**
- **URL**: http://localhost:3000 → Predictions tab
- **What to capture**: Prediction interface with risk scores
- **File name**: `flare-prediction-screenshot.png`

### **3. Nutrition Analyzer**
- **URL**: http://localhost:3000 → Nutrition tab
- **What to capture**: Meal logging interface, nutritional analysis
- **File name**: `nutrition-analyzer-screenshot.png`

### **4. Health Tracking (Journal)**
- **URL**: http://localhost:3000 → My Log tab
- **What to capture**: Symptom journal, tracking interface
- **File name**: `health-tracking-screenshot.png`

### **5. Community Connect**
- **URL**: http://localhost:3000 → Connect tab
- **What to capture**: Community forum, recovery stories
- **File name**: `community-connect-screenshot.png`

### **6. Advocacy Center**
- **URL**: http://localhost:3000 → Advocacy tab
- **What to capture**: Advocacy programs, voting interface
- **File name**: `advocacy-center-screenshot.png`

## 🛠️ **How to Capture Screenshots**

### **Windows (Built-in)**
1. **Full Screen**: Press `PrtScn` key
2. **Active Window**: Press `Alt + PrtScn`
3. **Snipping Tool**: Press `Windows + Shift + S`

### **Browser Developer Tools**
1. Open Developer Tools (`F12`)
2. Click the device toggle (mobile/tablet view)
3. Set to desktop view for best quality
4. Take screenshot

### **Recommended Settings**
- **Resolution**: 1920x1080 or higher
- **Format**: PNG for best quality
- **Browser**: Chrome or Edge for best rendering

## 📁 **File Organization**

Create a `screenshots` folder in your website directory:
```
medivue-nonprofit-website/
├── index.html
├── README.md
├── .gitignore
└── screenshots/
    ├── dashboard-screenshot.png
    ├── flare-prediction-screenshot.png
    ├── nutrition-analyzer-screenshot.png
    ├── health-tracking-screenshot.png
    ├── community-connect-screenshot.png
    └── advocacy-center-screenshot.png
```

## 🔄 **Update Website with Screenshots**

Once you have the screenshots:

1. **Add images to HTML**:
   ```html
   <div class="screenshot-placeholder">
       <img src="screenshots/dashboard-screenshot.png" alt="Dashboard Interface" style="width: 100%; height: 100%; object-fit: cover;">
   </div>
   ```

2. **Commit and push**:
   ```bash
   git add screenshots/
   git add index.html
   git commit -m "Add application screenshots to website"
   git push origin main
   ```

## 🎯 **Screenshot Tips**

### **Best Practices**
- **Clean Interface**: Close unnecessary browser tabs/windows
- **Good Lighting**: Ensure good contrast and visibility
- **Consistent Size**: Use same dimensions for all screenshots
- **Professional Look**: Remove any personal data or test content

### **What to Avoid**
- Personal information in screenshots
- Browser address bars with localhost URLs
- Developer tools or console errors
- Incomplete or broken interface elements

## 🚀 **Quick Capture Commands**

### **Using PowerShell (Windows)**
```powershell
# Create screenshots directory
New-Item -ItemType Directory -Name "screenshots" -Force

# Open application in browser
Start-Process "http://localhost:3000"
```

### **Using Python (if available)**
```python
import pyautogui
import time

# Wait for page to load
time.sleep(3)
# Capture screenshot
pyautogui.screenshot('screenshots/dashboard.png')
```

## 📋 **Checklist**

- [ ] Main Dashboard screenshot
- [ ] Flare Prediction interface
- [ ] Nutrition Analyzer interface
- [ ] Health Tracking interface
- [ ] Community Connect interface
- [ ] Advocacy Center interface
- [ ] All screenshots saved in PNG format
- [ ] Screenshots added to website
- [ ] Website updated and pushed to GitHub

Once you have the screenshots, the nonprofit website will look much more professional and showcase your actual application features! 