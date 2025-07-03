"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Monitor,
  Wifi,
  NetworkIcon as Ethernet,
  Bluetooth,
  HardDrive,
  Activity,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

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

interface DeviceManagerProps {
  interfaces: NetworkInterface[]
  onToggleInterface: (id: string) => void
}

export default function DeviceManager({ interfaces, onToggleInterface }: DeviceManagerProps) {
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "ethernet":
        return <Ethernet className="h-5 w-5 text-blue-500" />
      case "wireless":
        return <Wifi className="h-5 w-5 text-green-500" />
      case "bluetooth":
        return <Bluetooth className="h-5 w-5 text-purple-500" />
      case "virtual":
        return <Monitor className="h-5 w-5 text-orange-500" />
      case "loopback":
        return <HardDrive className="h-5 w-5 text-gray-500" />
      default:
        return <Settings className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusIcon = (active: boolean) => {
    return active ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-400" />
  }

  const getDeviceHealth = (packetsPerSecond: number) => {
    if (packetsPerSecond > 80) return { status: "Excellent", color: "text-green-600", value: 95 }
    if (packetsPerSecond > 50) return { status: "Good", color: "text-blue-600", value: 75 }
    if (packetsPerSecond > 20) return { status: "Fair", color: "text-yellow-600", value: 50 }
    if (packetsPerSecond > 0) return { status: "Poor", color: "text-orange-600", value: 25 }
    return { status: "Inactive", color: "text-gray-400", value: 0 }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Network Device Manager
        </CardTitle>
        <CardDescription>Manage and monitor network interfaces for packet capturing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interfaces.map((device) => {
            const health = getDeviceHealth(device.packetsPerSecond)

            return (
              <div key={device.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {getDeviceIcon(device.deviceType)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{device.name}</h3>
                        {getStatusIcon(device.active)}
                        <Badge variant="outline" className="text-xs">
                          {device.deviceType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{device.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">Capture</div>
                      <Switch checked={device.active} onCheckedChange={() => onToggleInterface(device.id)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">IP Address</div>
                    <div className="font-mono text-sm">{device.ipAddress}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">MAC Address</div>
                    <div className="font-mono text-sm">{device.macAddress}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Packets/Second</div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3" />
                      <span className="font-medium">{device.packetsPerSecond}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Health Status</div>
                    <div className={`text-sm font-medium ${health.color}`}>{health.status}</div>
                  </div>
                </div>

                {device.active && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Performance</span>
                      <span>{health.value}%</span>
                    </div>
                    <Progress value={health.value} className="h-2" />

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Active Capture</span>
                      </div>
                      <span>•</span>
                      <span>Buffer: 98% Available</span>
                      <span>•</span>
                      <span>Latency: &lt;1ms</span>
                    </div>
                  </div>
                )}

                {!device.active && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <AlertCircle className="h-3 w-3" />
                    <span>Interface disabled - Enable to start packet capture</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Device Detection</h4>
              <p className="text-sm text-blue-800">
                {interfaces.length} network interfaces detected. Enable interfaces to start multi-threaded packet
                capturing. Active interfaces: {interfaces.filter((i) => i.active).length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
