"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lock, Shield, Globe, Clock, Database, Flag } from "lucide-react"

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

interface PacketDetailsProps {
  packet: Packet
}

export default function PacketDetails({ packet }: PacketDetailsProps) {
  const getDeviceInfo = (ip: string) => {
    // This would normally lookup from the device map
    const deviceMap = [
      { ip: "192.168.1.100", deviceName: "DESKTOP-ADMIN01", userName: "john.smith" },
      { ip: "192.168.1.101", deviceName: "LAPTOP-SARAH", userName: "sarah.johnson" },
      { ip: "192.168.1.102", deviceName: "IPHONE-MIKE", userName: "mike.wilson" },
      { ip: "192.168.1.103", deviceName: "SERVER-DB01", userName: "system.admin" },
    ]
    return deviceMap.find((d) => d.ip === ip) || { deviceName: "Unknown Device", userName: "unknown" }
  }

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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Packet Details - {packet.id}
        </CardTitle>
        <CardDescription>Deep packet inspection and analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Network Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Source Device:</span>
                  <div className="text-right">
                    <div className="font-mono text-sm">{packet.sourceIP}</div>
                    <div className="text-xs text-muted-foreground">{getDeviceInfo(packet.sourceIP).deviceName}</div>
                    <div className="text-xs text-blue-600">@{getDeviceInfo(packet.sourceIP).userName}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Destination Device:</span>
                  <div className="text-right">
                    <div className="font-mono text-sm">{packet.destIP}</div>
                    <div className="text-xs text-muted-foreground">{getDeviceInfo(packet.destIP).deviceName}</div>
                    <div className="text-xs text-blue-600">@{getDeviceInfo(packet.destIP).userName}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Protocol:</span>
                  <Badge variant="outline">{packet.protocol}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timing & Size
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Timestamp:</span>
                  <span className="text-sm">{formatTimestamp(packet.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Packet Size:</span>
                  <span className="text-sm">{packet.size} bytes</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                TCP Flags
              </h3>
              <div className="flex flex-wrap gap-2">
                {packet.flags.length > 0 ? (
                  packet.flags.map((flag) => (
                    <Badge key={flag} variant="secondary" className="text-xs">
                      {flag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No flags set</span>
                )}
              </div>
            </div>
          </div>

          {/* Security Analysis */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Analysis
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Threat Level:</span>
                  <Badge className={`text-xs ${getThreatColor(packet.threatLevel)}`}>
                    {packet.threatLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Encrypted:</span>
                  <div className="flex items-center gap-1">
                    {packet.encrypted && <Lock className="h-3 w-3" />}
                    <span className="text-sm">{packet.encrypted ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Risk Assessment</h3>
              <div className="space-y-2">
                {packet.threatLevel === "critical" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Critical Threat Detected:</strong> This packet shows signs of malicious activity.
                      Immediate investigation recommended.
                    </p>
                  </div>
                )}
                {packet.threatLevel === "high" && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>High Risk:</strong> Suspicious patterns detected. Monitor closely.
                    </p>
                  </div>
                )}
                {packet.threatLevel === "medium" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Medium Risk:</strong> Some anomalies detected. Review recommended.
                    </p>
                  </div>
                )}
                {packet.threatLevel === "low" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Low Risk:</strong> Normal traffic pattern detected.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Payload Preview</h3>
              <ScrollArea className="h-32 w-full border rounded-lg p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap">{packet.payload}</pre>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
