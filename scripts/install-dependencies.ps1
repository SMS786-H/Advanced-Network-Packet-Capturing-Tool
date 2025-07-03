# PowerShell Script to Install Dependencies
# Run as Administrator

Write-Host "Installing Windows Packet Capture Dependencies..." -ForegroundColor Green

# 1. Install Chocolatey (if not installed)
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# 2. Install Java JDK
Write-Host "Installing Java JDK..." -ForegroundColor Yellow
choco install openjdk11 -y

# 3. Install Node.js (for the web interface)
Write-Host "Installing Node.js..." -ForegroundColor Yellow
choco install nodejs -y

# 4. Install Git
Write-Host "Installing Git..." -ForegroundColor Yellow
choco install git -y

# 5. Download and install Npcap
Write-Host "Downloading Npcap..." -ForegroundColor Yellow
$npcapUrl = "https://nmap.org/npcap/dist/npcap-1.75.exe"
$npcapPath = "$env:TEMP\npcap-installer.exe"
Invoke-WebRequest -Uri $npcapUrl -OutFile $npcapPath

Write-Host "Please run the Npcap installer manually: $npcapPath" -ForegroundColor Red
Write-Host "Make sure to check 'Install Npcap in WinPcap API-compatible Mode'" -ForegroundColor Red

# 6. Create project structure
Write-Host "Creating project structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path ".\packet-capture-app"
New-Item -ItemType Directory -Force -Path ".\packet-capture-app\java-backend"
New-Item -ItemType Directory -Force -Path ".\packet-capture-app\web-frontend"
New-Item -ItemType Directory -Force -Path ".\packet-capture-app\lib"

Write-Host "Setup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Install Npcap from the downloaded installer" -ForegroundColor White
Write-Host "2. Download JPCap or use pcap4j dependency" -ForegroundColor White
Write-Host "3. Build your Java backend" -ForegroundColor White
Write-Host "4. Deploy your React frontend" -ForegroundColor White
