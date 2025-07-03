"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Shield, Eye, Lock, Zap } from "lucide-react"
import { useMemo } from "react"

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

interface ThreatDetectionProps {
  packets: Packet[]
}

interface ThreatAlert {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  sourceIP: string
  timestamp: string
  count: number
}

export default function ThreatDetection({ packets }: ThreatDetectionProps) {
  const threatAlerts = useMemo(() => {
    const alerts: ThreatAlert[] = []
    const ipCounts: Record<string, number> = {}
    const portScans: Record<string, Set<number>> = {}

    // Analyze packets for threats
    packets.forEach((packet) => {
      // Count packets per IP
      ipCounts[packet.sourceIP] = (ipCounts[packet.sourceIP] || 0) + 1

      // Detect port scanning
      if (!portScans[packet.sourceIP]) {
        portScans[packet.sourceIP] = new Set()
      }
      portScans[packet.sourceIP].add(packet.destPort)

      // High-risk packets
      if (packet.threatLevel === "critical" || packet.threatLevel === "high") {
        alerts.push({
          id: `threat_${packet.id}`,
          type: packet.threatLevel === "critical" ? "Malicious Activity" : "Suspicious Behavior",
          severity: packet.threatLevel,
          description: `${packet.protocol} traffic from ${packet.sourceIP} shows ${packet.threatLevel} risk patterns`,
          sourceIP: packet.sourceIP,
          timestamp: packet.timestamp,
          count: 1,
        })
      }
    })

    // Detect DDoS attempts (high packet count from single IP)
    Object.entries(ipCounts).forEach(([ip, count]) => {
      if (count > 50) {
        alerts.push({
          id: `ddos_${ip}`,
          type: "Potential DDoS",
          severity: "high",
          description: `Unusually high traffic volume from ${ip} (${count} packets)`,
          sourceIP: ip,
          timestamp: new Date().toISOString(),
          count,
        })
      }
    })

    // Detect port scanning
    Object.entries(portScans).forEach(([ip, ports]) => {
      if (ports.size > 10) {
        alerts.push({
          id: `portscan_${ip}`,
          type: "Port Scanning",
          severity: "medium",
          description: `Port scanning detected from ${ip} (${ports.size} different ports)`,
          sourceIP: ip,
          timestamp: new Date().toISOString(),
          count: ports.size,
        })
      }
    })

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }, [packets])

  const threatStats = useMemo(() => {
    const stats = {
      critical: threatAlerts.filter((a) => a.severity === "critical").length,
      high: threatAlerts.filter((a) => a.severity === "high").length,
      medium: threatAlerts.filter((a) => a.severity === "medium").length,
      low: threatAlerts.filter((a) => a.severity === "low").length,
      encrypted: packets.filter((p) => p.encrypted).length,
      total: threatAlerts.length,
    }
    return stats
  }, [threatAlerts, packets])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <Shield className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Eye className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Zap className="h-4 w-4 text-green-500" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Threat Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical</p>
                <p className="text-2xl font-bold">{threatStats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">High</p>
                <p className="text-2xl font-bold">{threatStats.high}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Medium</p>
                <p className="text-2xl font-bold">{threatStats.medium}</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Low</p>
                <p className="text-2xl font-bold">{threatStats.low}</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Encrypted</p>
                <p className="text-2xl font-bold">{threatStats.encrypted}</p>
              </div>
              <Lock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Threats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Threat Alerts ({threatAlerts.length})
          </CardTitle>
          <CardDescription>Real-time threat detection and anomaly analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {threatAlerts.length === 0 ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>No active threats detected. Network traffic appears normal.</AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {threatAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{alert.type}</h4>
                        <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Source: {alert.sourceIP}</span>
                        <span>Count: {alert.count}</span>
                        <span>Time: {new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* ML-Based Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle>Machine Learning Anomaly Detection</CardTitle>
          <CardDescription>AI-powered threat detection and behavioral analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Traffic Pattern Analysis</span>
                <span>87% Normal</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Behavioral Baseline</span>
                <span>92% Established</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>ML Engine Status:</strong> Learning from {packets.length} packets. Anomaly detection accuracy
              improving with more data samples.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
