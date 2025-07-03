"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
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

interface PacketVisualizationProps {
  packets: Packet[]
}

export default function PacketVisualization({ packets }: PacketVisualizationProps) {
  const protocolData = useMemo(() => {
    const protocolCounts = packets.reduce(
      (acc, packet) => {
        acc[packet.protocol] = (acc[packet.protocol] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(protocolCounts).map(([protocol, count]) => ({
      protocol,
      count,
    }))
  }, [packets])

  const threatData = useMemo(() => {
    const threatCounts = packets.reduce(
      (acc, packet) => {
        acc[packet.threatLevel] = (acc[packet.threatLevel] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(threatCounts).map(([level, count]) => ({
      level,
      count,
    }))
  }, [packets])

  const timeSeriesData = useMemo(() => {
    const last10Minutes = packets
      .slice(-60) // Last 60 packets for demo
      .reduce(
        (acc, packet, index) => {
          const minute = Math.floor(index / 6) // Group by 6 packets per "minute"
          if (!acc[minute]) {
            acc[minute] = { time: `${minute}m`, packets: 0, bytes: 0 }
          }
          acc[minute].packets += 1
          acc[minute].bytes += packet.size
          return acc
        },
        {} as Record<number, { time: string; packets: number; bytes: number }>,
      )

    return Object.values(last10Minutes)
  }, [packets])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]
  const THREAT_COLORS = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#EF4444",
    critical: "#DC2626",
  }

  return (
    <div className="space-y-6">
      {/* Protocol Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Distribution</CardTitle>
          <CardDescription>Network traffic by protocol type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={protocolData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="protocol" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Level Distribution</CardTitle>
            <CardDescription>Security threat classification</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={threatData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ level, count }) => `${level}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={THREAT_COLORS[entry.level as keyof typeof THREAT_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Over Time</CardTitle>
            <CardDescription>Real-time packet flow</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="packets" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Source IPs */}
      <Card>
        <CardHeader>
          <CardTitle>Top Source IP Addresses</CardTitle>
          <CardDescription>Most active network sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              packets.reduce(
                (acc, packet) => {
                  acc[packet.sourceIP] = (acc[packet.sourceIP] || 0) + 1
                  return acc
                },
                {} as Record<string, number>,
              ),
            )
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([ip, count]) => (
                <div key={ip} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{ip}</span>
                  <span className="text-sm font-medium">{count} packets</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
