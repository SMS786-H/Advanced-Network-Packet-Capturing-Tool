"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Monitor,
  Smartphone,
  Server,
  Printer,
  Laptop,
  User,
  Wifi,
  Activity,
  Clock,
  Search,
  MapPin,
  Globe,
} from "lucide-react"
import { useState, useMemo } from "react"

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

interface NetworkMapProps {
  deviceMap: DeviceInfo[]
  packets: Packet[]
}

export default function NetworkMap({ deviceMap, packets }: NetworkMapProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "desktop pc":
        return <Monitor className="h-6 w-6 text-blue-500" />
      case "laptop":
        return <Laptop className="h-6 w-6 text-green-500" />
      case "mobile device":
        return <Smartphone className="h-6 w-6 text-purple-500" />
      case "server":
        return <Server className="h-6 w-6 text-red-500" />
      case "network printer":
        return <Printer className="h-6 w-6 text-orange-500" />
      default:
        return <Monitor className="h-6 w-6 text-gray-500" />
    }
  }

  const getUserInitials = (userName: string) => {
    return userName
      .split(".")
      .map((name) => name.charAt(0).toUpperCase())
      .join("")
  }

  const getDeviceActivity = (ip: string) => {
    const devicePackets = packets.filter((p) => p.sourceIP === ip || p.destIP === ip)
    return {
      totalPackets: devicePackets.length,
      lastActivity: devicePackets.length > 0 ? devicePackets[devicePackets.length - 1].timestamp : null,
      protocols: [...new Set(devicePackets.map((p) => p.protocol))],
    }
  }

  const filteredDevices = useMemo(() => {
    return deviceMap.filter(
      (device) =>
        device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.ip.includes(searchTerm) ||
        device.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [deviceMap, searchTerm])

  const networkStats = useMemo(() => {
    const onlineDevices = deviceMap.filter((d) => d.isOnline).length
    const totalDevices = deviceMap.length
    const deviceTypes = deviceMap.reduce(
      (acc, device) => {
        acc[device.deviceType] = (acc[device.deviceType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      onlineDevices,
      totalDevices,
      deviceTypes,
    }
  }, [deviceMap])

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Online Devices</p>
                <p className="text-2xl font-bold">{networkStats.onlineDevices}</p>
              </div>
              <Wifi className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Devices</p>
                <p className="text-2xl font-bold">{networkStats.totalDevices}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Users</p>
                <p className="text-2xl font-bold">{new Set(deviceMap.map((d) => d.userName)).size}</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Device Types</p>
                <p className="text-2xl font-bold">{Object.keys(networkStats.deviceTypes).length}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Device Discovery & Network Mapping
          </CardTitle>
          <CardDescription>Real-time network device identification and user mapping</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by device name, user, IP address, or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Badge variant="outline" className="whitespace-nowrap">
              {filteredDevices.length} devices found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle>Network Device Map</CardTitle>
          <CardDescription>Comprehensive device and user identification</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredDevices.map((device) => {
                const activity = getDeviceActivity(device.ip)

                return (
                  <div
                    key={device.ip}
                    className={`p-4 border rounded-lg transition-colors ${
                      device.isOnline ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        {getDeviceIcon(device.deviceType)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{device.deviceName}</h3>
                            <Badge variant={device.isOnline ? "default" : "secondary"} className="text-xs">
                              {device.isOnline ? "Online" : "Offline"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{device.manufacturer}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getUserInitials(device.userName)}</AvatarFallback>
                        </Avatar>
                        <div className="text-right">
                          <div className="text-sm font-medium">{device.userName}</div>
                          <div className="text-xs text-muted-foreground">User Account</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">IP Address</div>
                        <div className="font-mono text-sm font-medium">{device.ip}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">MAC Address</div>
                        <div className="font-mono text-sm">{device.macAddress}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Device Type</div>
                        <div className="text-sm">{device.deviceType}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Last Seen</div>
                        <div className="text-sm flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(device.lastSeen).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Activity Information */}
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            <span>{activity.totalPackets} packets</span>
                          </div>
                          {activity.protocols.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>Protocols:</span>
                              <div className="flex gap-1">
                                {activity.protocols.slice(0, 3).map((protocol) => (
                                  <Badge key={protocol} variant="outline" className="text-xs">
                                    {protocol}
                                  </Badge>
                                ))}
                                {activity.protocols.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{activity.protocols.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {device.isOnline && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600">Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Device Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Device Type Distribution</CardTitle>
          <CardDescription>Network infrastructure overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(networkStats.deviceTypes).map(([type, count]) => (
              <div key={type} className="text-center p-3 border rounded-lg">
                {getDeviceIcon(type)}
                <div className="mt-2">
                  <div className="font-medium text-sm">{type}</div>
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Topology Info */}
      <Card>
        <CardHeader>
          <CardTitle>Network Topology Information</CardTitle>
          <CardDescription>Discovered network infrastructure details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Network Segments</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>192.168.1.0/24 (Main Network)</span>
                  <Badge variant="outline">
                    {deviceMap.filter((d) => d.ip.startsWith("192.168.1")).length} devices
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>10.0.0.0/8 (Internal Network)</span>
                  <Badge variant="outline">{deviceMap.filter((d) => d.ip.startsWith("10.")).length} devices</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Active Users</h4>
              <div className="space-y-2">
                {[...new Set(deviceMap.map((d) => d.userName))].slice(0, 5).map((user) => (
                  <div key={user} className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                    <span>{user}</span>
                    <Badge variant="outline" className="text-xs">
                      {deviceMap.filter((d) => d.userName === user).length} device(s)
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
