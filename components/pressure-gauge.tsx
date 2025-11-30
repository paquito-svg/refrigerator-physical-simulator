"use client"

import { Gauge } from "lucide-react"

interface PressureGaugeProps {
  label: string
  pressure: number
  maxPressure: number
  type: "high" | "low"
}

export default function PressureGauge({ label, pressure, maxPressure, type }: PressureGaugeProps) {
  const isHigh = type === "high"
  const percentage = Math.min(100, (pressure / maxPressure) * 100)
  const rotation = -90 + (percentage * 180) / 100 // -90 to 90 degrees

  return (
    <div
      className={`rounded-lg border p-3 ${
        isHigh ? "border-accent/30 bg-accent/10" : "border-primary/30 bg-primary/10"
      }`}
    >
      <div className="flex items-center gap-2">
        <Gauge className={`h-4 w-4 ${isHigh ? "text-accent" : "text-primary"}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>

      {/* Gauge visualization */}
      <div className="relative mx-auto mt-2 h-12 w-24">
        {/* Gauge background arc */}
        <svg viewBox="0 0 100 60" className="h-full w-full">
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className={isHigh ? "text-accent" : "text-primary"}
            strokeLinecap="round"
            strokeDasharray={`${percentage * 1.26} 126`}
          />
          {/* Needle */}
          <g transform={`rotate(${rotation} 50 50)`}>
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke="currentColor"
              strokeWidth="3"
              className="text-foreground"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="4" fill="currentColor" className="text-foreground" />
          </g>
        </svg>
      </div>

      <div className="mt-1 text-center">
        <span className={`text-lg font-bold ${isHigh ? "text-accent" : "text-primary"}`}>{Math.round(pressure)}</span>
        <span className="ml-1 text-xs text-muted-foreground">kPa</span>
      </div>
    </div>
  )
}
