"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Globe, Shield, Network, HardDrive } from "lucide-react"

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

interface Stats {
  totalPackets: number
  packetsPerSecond: number
  bytesTransferred: number
  threatsDetected: number
  activeConnections: number
}

interface NetworkStatsProps {
  stats: Stats
  interfaces: NetworkInterface[]
}

export default function NetworkStats({ stats, interfaces }: NetworkStatsProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Packets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Packets</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPackets.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{stats.packetsPerSecond}/sec current rate</p>
          <Progress value={Math.min((stats.packetsPerSecond / 100) * 100, 100)} className="mt-2" />
        </CardContent>
      </Card>

      {/* Data Transferred */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data Transferred</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBytes(stats.bytesTransferred)}</div>
          <p className="text-xs text-muted-foreground">Network throughput</p>
          <Progress value={Math.min((stats.bytesTransferred / 1000000) * 100, 100)} className="mt-2" />
        </CardContent>
      </Card>

      {/* Active Connections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeConnections}</div>
          <p className="text-xs text-muted-foreground">Current network sessions</p>
          <Progress value={Math.min((stats.activeConnections / 100) * 100, 100)} className="mt-2" />
        </CardContent>
      </Card>

      {/* Threats Detected */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.threatsDetected}</div>
          <p className="text-xs text-muted-foreground">Security alerts raised</p>
          <Progress value={Math.min((stats.threatsDetected / 10) * 100, 100)} className="mt-2" />
        </CardContent>
      </Card>

      {/* Network Interfaces */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Device Interfaces
          </CardTitle>
          <CardDescription>Multi-threaded packet capture across network devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {interfaces.map((iface) => (
              <div key={iface.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-lg">{iface.name}</h4>
                      <Badge
                        variant={iface.active ? "default" : "secondary"}
                        className={iface.active ? "bg-green-500" : ""}
                      >
                        {iface.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {iface.deviceType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{iface.description}</p>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IP Address:</span>
                        <span className="font-mono">{iface.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MAC Address:</span>
                        <span className="font-mono">{iface.macAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Packets/sec:</span>
                        <span className="font-medium">{iface.packetsPerSecond}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {iface.active && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600">Capturing packets</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
