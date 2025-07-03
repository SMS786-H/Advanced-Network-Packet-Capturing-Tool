"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Pause, Square, Filter, Download, Network, Activity, Lock, AlertTriangle } from "lucide-react"
import PacketVisualization from "@/components/packet-visualization"
import PacketDetails from "@/components/packet-details"
import NetworkStats from "@/components/network-stats"
import ThreatDetection from "@/components/threat-detection"
import DeviceManager from "@/components/device-manager"
import NetworkMap from "@/components/network-map"

interface Packet {
  id: string
  timestamp: string
  sourceIP: string
  destIP: string
  protocol: string
  sourcePort: number
  destPort: number
  size: number
  flags: string[]
  payload: string
  threatLevel: "low" | "medium" | "high" | "critical"
  encrypted: boolean
}

interface NetworkInterface {
  id: string
  name: string
  description: string
  active: boolean
  packetsPerSecond: number
  macAddress: string
  ipAddress: string
  deviceType: string
}

interface DeviceInfo {
  ip: string
  deviceName: string
  userName: string
  macAddress: string
  deviceType: string
  manufacturer: string
  lastSeen: string
  isOnline: boolean
}

export default function AdvancedPacketCapture() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [packets, setPackets] = useState<Packet[]>([])
  const [filteredPackets, setFilteredPackets] = useState<Packet[]>([])
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null)
  const [filters, setFilters] = useState({
    sourceIP: "",
    destIP: "",
    protocol: "all",
    port: "",
    threatLevel: "all",
  })
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([
    {
      id: "1",
      name: "eth0",
      description: "Intel(R) Ethernet Connection I217-LM",
      active: true,
      packetsPerSecond: 0,
      macAddress: "00:1B:21:3C:4D:5E",
      ipAddress: "192.168.1.100",
      deviceType: "Ethernet",
    },
    {
      id: "2",
      name: "wlan0",
      description: "Realtek RTL8822BE 802.11ac PCIe Adapter",
      active: false,
      packetsPerSecond: 0,
      macAddress: "A4:B1:C2:D3:E4:F5",
      ipAddress: "192.168.1.101",
      deviceType: "Wireless",
    },
    {
      id: "3",
      name: "lo",
      description: "Software Loopback Interface",
      active: false,
      packetsPerSecond: 0,
      macAddress: "00:00:00:00:00:00",
      ipAddress: "127.0.0.1",
      deviceType: "Loopback",
    },
    {
      id: "4",
      name: "vmnet1",
      description: "VMware Virtual Ethernet Adapter (VMnet1)",
      active: false,
      packetsPerSecond: 0,
      macAddress: "00:50:56:C0:00:01",
      ipAddress: "192.168.56.1",
      deviceType: "Virtual",
    },
    {
      id: "5",
      name: "bluetooth0",
      description: "Bluetooth Device (Personal Area Network)",
      active: false,
      packetsPerSecond: 0,
      macAddress: "B8:27:EB:A1:B2:C3",
      ipAddress: "169.254.1.1",
      deviceType: "Bluetooth",
    },
  ])
  const [deviceMap, setDeviceMap] = useState<DeviceInfo[]>([
    {
      ip: "192.168.1.100",
      deviceName: "DESKTOP-ADMIN01",
      userName: "john.smith",
      macAddress: "00:1B:21:3C:4D:5E",
      deviceType: "Desktop PC",
      manufacturer: "Dell Inc.",
      lastSeen: new Date().toISOString(),
      isOnline: true,
    },
    {
      ip: "192.168.1.101",
      deviceName: "LAPTOP-SARAH",
      userName: "sarah.johnson",
      macAddress: "A4:B1:C2:D3:E4:F5",
      deviceType: "Laptop",
      manufacturer: "HP Inc.",
      lastSeen: new Date().toISOString(),
      isOnline: true,
    },
    {
      ip: "192.168.1.102",
      deviceName: "IPHONE-MIKE",
      userName: "mike.wilson",
      macAddress: "B8:27:EB:A1:B2:C3",
      deviceType: "Mobile Device",
      manufacturer: "Apple Inc.",
      lastSeen: new Date().toISOString(),
      isOnline: false,
    },
    {
      ip: "192.168.1.103",
      deviceName: "SERVER-DB01",
      userName: "system.admin",
      macAddress: "00:50:56:C0:00:01",
      deviceType: "Server",
      manufacturer: "VMware Inc.",
      lastSeen: new Date().toISOString(),
      isOnline: true,
    },
    {
      ip: "192.168.1.104",
      deviceName: "PRINTER-OFFICE",
      userName: "guest",
      macAddress: "C4:D5:E6:F7:A8:B9",
      deviceType: "Network Printer",
      manufacturer: "Canon Inc.",
      lastSeen: new Date().toISOString(),
      isOnline: true,
    },
  ])
  const [stats, setStats] = useState({
    totalPackets: 0,
    packetsPerSecond: 0,
    bytesTransferred: 0,
    threatsDetected: 0,
    activeConnections: 0,
  })

  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const packetIdCounter = useRef(0)

  // Simulate real-time packet generation
  const generateRealisticPacket = (): Packet => {
    const protocols = ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "FTP", "SSH", "ICMP"]
    const commonPorts = [80, 443, 22, 21, 53, 25, 110, 143, 993, 995, 8080, 3389]
    const threatLevels: ("low" | "medium" | "high" | "critical")[] = ["low", "low", "low", "medium", "high", "critical"]

    // Generate realistic IP addresses
    const generateIP = () => {
      const ranges = [
        () => `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        () =>
          `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        () =>
          `172.${16 + Math.floor(Math.random() * 16)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        () => `8.8.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`,
        () => `1.1.1.${Math.floor(Math.random() * 255)}`,
      ]
      return ranges[Math.floor(Math.random() * ranges.length)]()
    }

    const protocol = protocols[Math.floor(Math.random() * protocols.length)]
    const sourcePort = commonPorts[Math.floor(Math.random() * commonPorts.length)]
    const destPort = commonPorts[Math.floor(Math.random() * commonPorts.length)]
    const threatLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)]

    packetIdCounter.current += 1

    return {
      id: `pkt_${packetIdCounter.current}`,
      timestamp: new Date().toISOString(),
      sourceIP: generateIP(),
      destIP: generateIP(),
      protocol,
      sourcePort,
      destPort,
      size: Math.floor(Math.random() * 1500) + 64,
      flags: ["SYN", "ACK", "PSH", "FIN"].filter(() => Math.random() > 0.7),
      payload: `${protocol} packet data - ${Math.random().toString(36).substring(7)}`,
      threatLevel,
      encrypted: protocol === "HTTPS" || protocol === "SSH" || Math.random() > 0.8,
    }
  }

  // Start packet capturing simulation
  const startCapture = () => {
    setIsCapturing(true)
    captureIntervalRef.current = setInterval(() => {
      // Generate multiple packets per interval to simulate high-speed capture
      const newPackets = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, generateRealisticPacket)

      setPackets((prev) => {
        const updated = [...prev, ...newPackets].slice(-1000) // Keep last 1000 packets
        return updated
      })

      // Update stats
      setStats((prev) => ({
        totalPackets: prev.totalPackets + newPackets.length,
        packetsPerSecond: newPackets.length,
        bytesTransferred: prev.bytesTransferred + newPackets.reduce((sum, p) => sum + p.size, 0),
        threatsDetected:
          prev.threatsDetected +
          newPackets.filter((p) => p.threatLevel === "high" || p.threatLevel === "critical").length,
        activeConnections: Math.floor(Math.random() * 50) + 10,
      }))

      // Update interface stats
      setInterfaces((prev) =>
        prev.map((iface) => ({
          ...iface,
          packetsPerSecond: iface.active ? Math.floor(Math.random() * 100) + 10 : 0,
        })),
      )
    }, 500) // Generate packets every 500ms
  }

  const stopCapture = () => {
    setIsCapturing(false)
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
    }
  }

  const clearPackets = () => {
    setPackets([])
    setFilteredPackets([])
    setSelectedPacket(null)
    setStats({
      totalPackets: 0,
      packetsPerSecond: 0,
      bytesTransferred: 0,
      threatsDetected: 0,
      activeConnections: 0,
    })
  }

  // Apply filters
  useEffect(() => {
    let filtered = packets

    if (filters.sourceIP) {
      filtered = filtered.filter((p) => p.sourceIP.includes(filters.sourceIP))
    }
    if (filters.destIP) {
      filtered = filtered.filter((p) => p.destIP.includes(filters.destIP))
    }
    if (filters.protocol !== "all") {
      filtered = filtered.filter((p) => p.protocol === filters.protocol)
    }
    if (filters.port) {
      const port = Number.parseInt(filters.port)
      filtered = filtered.filter((p) => p.sourcePort === port || p.destPort === port)
    }
    if (filters.threatLevel !== "all") {
      filtered = filtered.filter((p) => p.threatLevel === filters.threatLevel)
    }

    setFilteredPackets(filtered)
  }, [packets, filters])

  const getThreatColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const exportPackets = () => {
    const dataStr = JSON.stringify(filteredPackets, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `packets_${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const toggleInterface = (id: string) => {
    setInterfaces((prev) => prev.map((iface) => (iface.id === id ? { ...iface, active: !iface.active } : iface)))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Network className="h-6 w-6" />
                  Advanced Network Packet Capturing Tool
                </CardTitle>
                <CardDescription>Enhanced JPCap with Multi-threaded Capturing & Real-time Analysis</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isCapturing ? "default" : "secondary"}>{isCapturing ? "CAPTURING" : "STOPPED"}</Badge>
                <div className="flex gap-2">
                  <Button onClick={startCapture} disabled={isCapturing} className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                  <Button
                    onClick={stopCapture}
                    disabled={!isCapturing}
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Pause className="h-4 w-4" />
                    Stop
                  </Button>
                  <Button onClick={clearPackets} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Square className="h-4 w-4" />
                    Clear
                  </Button>
                  <Button onClick={exportPackets} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Network Statistics */}
        <NetworkStats stats={stats} interfaces={interfaces} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters and Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sourceIP">Source IP</Label>
                <Input
                  id="sourceIP"
                  placeholder="e.g., 192.168.1.1"
                  value={filters.sourceIP}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sourceIP: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="destIP">Destination IP</Label>
                <Input
                  id="destIP"
                  placeholder="e.g., 8.8.8.8"
                  value={filters.destIP}
                  onChange={(e) => setFilters((prev) => ({ ...prev, destIP: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="protocol">Protocol</Label>
                <Select
                  value={filters.protocol}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, protocol: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Protocols</SelectItem>
                    <SelectItem value="TCP">TCP</SelectItem>
                    <SelectItem value="UDP">UDP</SelectItem>
                    <SelectItem value="HTTP">HTTP</SelectItem>
                    <SelectItem value="HTTPS">HTTPS</SelectItem>
                    <SelectItem value="DNS">DNS</SelectItem>
                    <SelectItem value="SSH">SSH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="e.g., 80, 443"
                  value={filters.port}
                  onChange={(e) => setFilters((prev) => ({ ...prev, port: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="threatLevel">Threat Level</Label>
                <Select
                  value={filters.threatLevel}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, threatLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Packet List and Visualization */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Packet Stream ({filteredPackets.length} packets)
                </span>
                {isCapturing && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600">Live</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="packets" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="packets">Packet List</TabsTrigger>
                  <TabsTrigger value="visualization">Visualization</TabsTrigger>
                  <TabsTrigger value="threats">Threat Detection</TabsTrigger>
                  <TabsTrigger value="devices">Device Manager</TabsTrigger>
                  <TabsTrigger value="network-map">Network Map</TabsTrigger>
                </TabsList>

                <TabsContent value="packets" className="space-y-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {filteredPackets
                        .slice(-50)
                        .reverse()
                        .map((packet) => (
                          <div
                            key={packet.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedPacket?.id === packet.id ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                            }`}
                            onClick={() => setSelectedPacket(packet)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs">
                                  {packet.protocol}
                                </Badge>
                                <span className="text-sm font-mono">
                                  {packet.sourceIP}:{packet.sourcePort} → {packet.destIP}:{packet.destPort}
                                </span>
                                {packet.encrypted && <Lock className="h-3 w-3 text-yellow-600" />}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${getThreatColor(packet.threatLevel)}`}>
                                  {packet.threatLevel}
                                </Badge>
                                <span className="text-xs text-gray-500">{packet.size}B</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(packet.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="visualization">
                  <PacketVisualization packets={filteredPackets} />
                </TabsContent>

                <TabsContent value="threats">
                  <ThreatDetection packets={filteredPackets} />
                </TabsContent>

                <TabsContent value="devices">
                  <DeviceManager interfaces={interfaces} onToggleInterface={toggleInterface} />
                </TabsContent>

                <TabsContent value="network-map">
                  <NetworkMap deviceMap={deviceMap} packets={filteredPackets} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Packet Details */}
        {selectedPacket && <PacketDetails packet={selectedPacket} />}

        {/* Status Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> This application simulates real-time packet capturing for demonstration
            purposes. In a production environment, this would interface with actual network adapters using JPCap or
            similar libraries with appropriate system permissions.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
