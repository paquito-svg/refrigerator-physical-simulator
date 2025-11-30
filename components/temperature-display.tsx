"use client"

import { Thermometer } from "lucide-react"

interface TemperatureDisplayProps {
  label: string
  temperature: number
  type: "hot" | "cold"
}

export default function TemperatureDisplay({ label, temperature, type }: TemperatureDisplayProps) {
  const isHot = type === "hot"
  const fillPercentage = isHot
    ? Math.min(100, Math.max(0, ((temperature + 10) / 80) * 100))
    : Math.min(100, Math.max(0, ((30 - temperature) / 60) * 100))

  return (
    <div className={`rounded-lg border p-3 ${isHot ? "border-hot/30 bg-hot/10" : "border-cold/30 bg-cold/10"}`}>
      <div className="flex items-center gap-2">
        <Thermometer className={`h-4 w-4 ${isHot ? "text-hot" : "text-cold"}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className={`text-2xl font-bold ${isHot ? "text-hot" : "text-cold"}`}>{temperature}</span>
        <span className="mb-1 text-sm text-muted-foreground">°C</span>
      </div>
      {/* Mini thermometer visualization */}
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-500 ${isHot ? "bg-hot" : "bg-cold"}`}
          style={{ width: `${fillPercentage}%` }}
        />
      </div>
    </div>
  )
}
