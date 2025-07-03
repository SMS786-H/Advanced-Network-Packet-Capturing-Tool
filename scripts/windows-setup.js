// Windows Setup Script for Real-Time Packet Capture
// Run this in PowerShell as Administrator

const { exec } = require("child_process")
const fs = require("fs")

async function setupWindowsPacketCapture() {
  console.log("Setting up Windows Packet Capture Environment...")

  // 1. Check if running as Administrator
  try {
    exec("net session", (error) => {
      if (error) {
        console.error("ERROR: Please run as Administrator!")
        process.exit(1)
      }
    })
  } catch (e) {
    console.error("Administrator check failed")
  }

  // 2. Install Npcap (WinPcap replacement)
  console.log("Installing Npcap...")
  const npcapUrl = "https://nmap.org/npcap/dist/npcap-1.75.exe"

  // 3. Setup Java Environment
  console.log("Checking Java installation...")
  exec("java -version", (error, stdout, stderr) => {
    if (error) {
      console.log("Java not found. Please install Java JDK 8 or higher")
      console.log("Download from: https://www.oracle.com/java/technologies/downloads/")
    } else {
      console.log("Java found:", stderr)
    }
  })

  // 4. Download JPCap library
  console.log("Setting up JPCap library...")
  const jpcapSetup = `
# JPCap Setup Instructions:
1. Download JPCap from: http://netresearch.ics.uci.edu/kfujii/jpcap/doc/
2. Extract jpcap.jar to your project lib folder
3. Copy jpcap.dll to your Java bin directory
4. Add jpcap.jar to your classpath

# Alternative: Use pcap4j (more modern)
# Add to your Maven pom.xml:
<dependency>
    <groupId>org.pcap4j</groupId>
    <artifactId>pcap4j-core</artifactId>
    <version>1.8.2</version>
</dependency>
<dependency>
    <groupId>org.pcap4j</groupId>
    <artifactId>pcap4j-packetfactory-static</artifactId>
    <version>1.8.2</version>
</dependency>
    `

  fs.writeFileSync("SETUP_INSTRUCTIONS.md", jpcapSetup)
  console.log("Setup instructions written to SETUP_INSTRUCTIONS.md")
}

setupWindowsPacketCapture()
