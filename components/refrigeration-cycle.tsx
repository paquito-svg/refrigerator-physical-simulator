"use client"

import { useEffect, useRef } from "react"

interface RefrigerationCycleProps {
  isRunning: boolean
  condenserTemp: number
  evaporatorTemp: number
  compressorPressure: number
}

export default function RefrigerationCycle({
  isRunning,
  condenserTemp,
  evaporatorTemp,
  compressorPressure,
}: RefrigerationCycleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Array<{ x: number; y: number; progress: number; segment: number }>>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener("resize", resize)

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push({
          x: 0,
          y: 0,
          progress: (i / 20) * 100,
          segment: Math.floor((i / 20) * 4),
        })
      }
    }

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      ctx.clearRect(0, 0, width, height)

      // Calculate positions
      const padding = 40
      const componentSize = 60
      const pipeWidth = 8

      // Component positions
      const compressor = { x: width / 2, y: height - padding - componentSize / 2 }
      const condenser = { x: width - padding - componentSize / 2, y: height / 2 }
      const valve = { x: width / 2, y: padding + componentSize / 2 }
      const evaporator = { x: padding + componentSize / 2, y: height / 2 }

      // Draw pipes
      const drawPipe = (
        from: { x: number; y: number },
        to: { x: number; y: number },
        color: string,
        isHighPressure: boolean,
      ) => {
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = isHighPressure ? pipeWidth : pipeWidth - 2
        ctx.lineCap = "round"
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      }

      // Hot color based on condenser temp
      const hotIntensity = Math.min(1, Math.max(0, (condenserTemp - 20) / 60))
      const hotColor = `rgb(${200 + hotIntensity * 55}, ${100 - hotIntensity * 50}, ${80 - hotIntensity * 40})`

      // Cold color based on evaporator temp
      const coldIntensity = Math.min(1, Math.max(0, -evaporatorTemp / 30))
      const coldColor = `rgb(${80 - coldIntensity * 30}, ${150 + coldIntensity * 55}, ${220 + coldIntensity * 35})`

      // Draw pipes (in order: bottom to right, right to top, top to left, left to bottom)
      drawPipe(compressor, condenser, hotColor, true) // High pressure hot gas
      drawPipe(condenser, valve, `rgb(180, 120, 80)`, true) // High pressure liquid
      drawPipe(valve, evaporator, coldColor, false) // Low pressure liquid/gas mix
      drawPipe(evaporator, compressor, `rgb(100, 160, 200)`, false) // Low pressure gas

      // Draw components
      // Compressor
      ctx.fillStyle = "#1e293b"
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(compressor.x - 35, compressor.y - 25, 70, 50, 8)
      ctx.fill()
      ctx.stroke()

      // Compressor animation
      if (isRunning) {
        const time = Date.now() / 100
        const pulseSize = 3 + Math.sin(time * (compressorPressure / 400)) * 2
        ctx.fillStyle = "#3b82f6"
        ctx.beginPath()
        ctx.arc(compressor.x, compressor.y, pulseSize, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = "#e2e8f0"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("COMPRESOR", compressor.x, compressor.y + 4)

      // Condenser
      ctx.fillStyle = "#1e293b"
      ctx.strokeStyle = hotColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(condenser.x - 25, condenser.y - 40, 50, 80, 8)
      ctx.fill()
      ctx.stroke()

      // Condenser coils
      ctx.strokeStyle = hotColor
      ctx.lineWidth = 2
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(condenser.x - 15, condenser.y - 30 + i * 15)
        ctx.lineTo(condenser.x + 15, condenser.y - 30 + i * 15)
        ctx.stroke()
      }

      ctx.fillStyle = "#e2e8f0"
      ctx.font = "bold 9px sans-serif"
      ctx.fillText("CONDEN-", condenser.x, condenser.y + 50)
      ctx.fillText("SADOR", condenser.x, condenser.y + 62)

      // Expansion Valve
      ctx.fillStyle = "#1e293b"
      ctx.strokeStyle = "#a855f7"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(valve.x - 20, valve.y - 15)
      ctx.lineTo(valve.x + 20, valve.y - 15)
      ctx.lineTo(valve.x + 10, valve.y + 15)
      ctx.lineTo(valve.x - 10, valve.y + 15)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = "#e2e8f0"
      ctx.font = "bold 9px sans-serif"
      ctx.fillText("VÁLVULA", valve.x, valve.y + 35)

      // Evaporator
      ctx.fillStyle = "#1e293b"
      ctx.strokeStyle = coldColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(evaporator.x - 25, evaporator.y - 40, 50, 80, 8)
      ctx.fill()
      ctx.stroke()

      // Evaporator coils
      ctx.strokeStyle = coldColor
      ctx.lineWidth = 2
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(evaporator.x - 15, evaporator.y - 30 + i * 15)
        ctx.lineTo(evaporator.x + 15, evaporator.y - 30 + i * 15)
        ctx.stroke()
      }

      ctx.fillStyle = "#e2e8f0"
      ctx.font = "bold 9px sans-serif"
      ctx.fillText("EVAPO-", evaporator.x, evaporator.y + 50)
      ctx.fillText("RADOR", evaporator.x, evaporator.y + 62)

      // Temperature labels
      ctx.font = "bold 12px monospace"
      ctx.fillStyle = hotColor
      ctx.fillText(`${condenserTemp}°C`, condenser.x, condenser.y - 50)

      ctx.fillStyle = coldColor
      ctx.fillText(`${evaporatorTemp}°C`, evaporator.x, evaporator.y - 50)

      // Animate particles
      if (isRunning) {
        const speed = 0.3 + (compressorPressure / 2000) * 0.4

        particlesRef.current.forEach((particle) => {
          particle.progress += speed
          if (particle.progress >= 100) {
            particle.progress = 0
          }

          // Calculate position based on progress
          let x = 0,
            y = 0
          let color = ""
          const p = particle.progress

          if (p < 25) {
            // Compressor to Condenser
            const t = p / 25
            x = compressor.x + (condenser.x - compressor.x) * t
            y = compressor.y + (condenser.y - compressor.y) * t
            color = hotColor
          } else if (p < 50) {
            // Condenser to Valve
            const t = (p - 25) / 25
            x = condenser.x + (valve.x - condenser.x) * t
            y = condenser.y + (valve.y - condenser.y) * t
            color = `rgb(180, 120, 80)`
          } else if (p < 75) {
            // Valve to Evaporator
            const t = (p - 50) / 25
            x = valve.x + (evaporator.x - valve.x) * t
            y = valve.y + (evaporator.y - valve.y) * t
            color = coldColor
          } else {
            // Evaporator to Compressor
            const t = (p - 75) / 25
            x = evaporator.x + (compressor.x - evaporator.x) * t
            y = evaporator.y + (compressor.y - evaporator.y) * t
            color = `rgb(100, 160, 200)`
          }

          // Draw particle
          ctx.beginPath()
          ctx.fillStyle = color
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = "rgba(255,255,255,0.5)"
          ctx.lineWidth = 1
          ctx.stroke()
        })
      }

      // Draw arrows showing flow direction
      const drawArrow = (x: number, y: number, angle: number, color: string) => {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(10, 0)
        ctx.lineTo(-5, -6)
        ctx.lineTo(-5, 6)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }

      // Arrows
      drawArrow((compressor.x + condenser.x) / 2, (compressor.y + condenser.y) / 2, -Math.PI / 4, hotColor)
      drawArrow((condenser.x + valve.x) / 2, (condenser.y + valve.y) / 2, (-3 * Math.PI) / 4, "#b4784f")
      drawArrow((valve.x + evaporator.x) / 2, (valve.y + evaporator.y) / 2, (3 * Math.PI) / 4, coldColor)
      drawArrow((evaporator.x + compressor.x) / 2, (evaporator.y + compressor.y) / 2, Math.PI / 4, "#64a0c8")

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, condenserTemp, evaporatorTemp, compressorPressure])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary/30">
      <canvas ref={canvasRef} className="h-full w-full" style={{ display: "block" }} />
    </div>
  )
}
