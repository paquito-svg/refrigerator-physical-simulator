"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Thermometer, Gauge, Zap, Play, Pause, RotateCcw, AlertTriangle } from "lucide-react"
import RefrigerationCycle from "./refrigeration-cycle"
import TemperatureDisplay from "./temperature-display"
import PressureGauge from "./pressure-gauge"
import RefrigerantInputMode from "./refrigerant-input-mode"
import {
  type RefrigerantProperties,
  type SystemCalculations,
  type ValidationErrors,
  refrigerantPresets,
  calculateSystemState,
  validateSystemParameters,
} from "@/utils/thermodynamic-calculations"

export default function RefrigeratorSimulator() {
  const [isRunning, setIsRunning] = useState(true)

  const [compressorPressureInput, setCompressorPressureInput] = useState(1200)
  const [ambientTempInput, setAmbientTempInput] = useState(25)
  const [refrigerantInput, setRefrigerantInput] = useState<RefrigerantProperties>(refrigerantPresets.R134a.properties)

  // Estados aplicados (después de guardar)
  const [compressorPressure, setCompressorPressure] = useState(1200)
  const [ambientTemp, setAmbientTemp] = useState(25)
  const [refrigerant, setRefrigerant] = useState<RefrigerantProperties>(refrigerantPresets.R134a.properties)

  const [systemState, setSystemState] = useState<SystemCalculations>({
    compressorPressure: 1200,
    condenserTemp: 40,
    evaporatorTemp: -10,
    refrigerantFlow: 0.05,
    cop: 3.5,
    heatRemoved: 2.5,
    workInput: 0.71,
    lowPressure: 225,
    highPressure: 1200,
    pressureRatio: 5.3,
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Manejador para guardar cambios
  const handleSaveChanges = useCallback(() => {
    // Validar parámetros
    const evaporatorTempEstimate = -10 // Estimado para validación
    const errors = validateSystemParameters(compressorPressureInput, ambientTempInput, evaporatorTempEstimate)

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})
    setCompressorPressure(compressorPressureInput)
    setAmbientTemp(ambientTempInput)
    setRefrigerant(refrigerantInput)

    // Calcular nuevo estado del sistema
    const newState = calculateSystemState(compressorPressureInput, refrigerantInput, ambientTempInput)
    setSystemState(newState)
  }, [compressorPressureInput, ambientTempInput, refrigerantInput])

  const resetSimulation = () => {
    setCompressorPressureInput(1200)
    setAmbientTempInput(25)
    setRefrigerantInput(refrigerantPresets.R134a.properties)
    setCompressorPressure(1200)
    setAmbientTemp(25)
    setRefrigerant(refrigerantPresets.R134a.properties)
    setValidationErrors({})

    const defaultState = calculateSystemState(1200, refrigerantPresets.R134a.properties, 25)
    setSystemState(defaultState)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Simulador de Ciclo de Refrigeración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualización física del funcionamiento de un refrigerador con cálculos termodinámicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isRunning ? "secondary" : "default"}
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            className="gap-2"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? "Pausar" : "Iniciar"}
          </Button>
          <Button variant="outline" size="sm" onClick={resetSimulation} className="gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Thermometer className="h-5 w-5 text-accent" />
                Temperatura Ambiente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Temperatura exterior</Label>
                  <span className="font-mono text-sm font-semibold text-accent">{ambientTempInput} °C</span>
                </div>
                <Slider
                  value={[ambientTempInput]}
                  onValueChange={(v) => setAmbientTempInput(v[0])}
                  min={-40}
                  max={60}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-40°C</span>
                  <span>60°C</span>
                </div>
                <div className="mt-3">
                  <input
                    type="number"
                    value={ambientTempInput}
                    onChange={(e) => {
                      const val = Math.max(-40, Math.min(60, Number(e.target.value)))
                      setAmbientTempInput(val)
                    }}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                    placeholder="Ingresa temperatura en °C"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compressor Pressure Control */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-5 w-5 text-primary" />
                Presión del Compresor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Presión de descarga</Label>
                  <span className="font-mono text-sm font-semibold text-primary">{compressorPressureInput} kPa</span>
                </div>
                <Slider
                  value={[compressorPressureInput]}
                  onValueChange={(v) => setCompressorPressureInput(v[0])}
                  min={100}
                  max={2500}
                  step={25}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100 kPa</span>
                  <span>2500 kPa</span>
                </div>
                <div className="mt-3">
                  <input
                    type="number"
                    value={compressorPressureInput}
                    onChange={(e) => {
                      const val = Math.max(100, Math.min(2500, Number(e.target.value)))
                      setCompressorPressureInput(val)
                    }}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                    placeholder="Ingresa presión en kPa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refrigerant Properties - Using new component */}
          <RefrigerantInputMode refrigerant={refrigerantInput} onRefrigerantChange={setRefrigerantInput} />

          {validationErrors && Object.keys(validationErrors).length > 0 && (
            <Card className="border-red-500/50 bg-red-950/20">
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
                  <div className="space-y-1 text-sm text-red-400">
                    {Object.entries(validationErrors).map(([key, message]) => (
                      <p key={key}>{message}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleSaveChanges}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            size="lg"
          >
            <Zap className="h-4 w-4" />
            Guardar Cambios
          </Button>

          {/* Performance Metrics */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5 text-accent" />
                Rendimiento del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Calor removido</p>
                  <p className="text-xl font-bold text-cold">
                    {systemState.heatRemoved}
                    <span className="text-sm font-normal text-muted-foreground"> kW</span>
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Trabajo entrada</p>
                  <p className="text-xl font-bold text-accent">
                    {systemState.workInput}
                    <span className="text-sm font-normal text-muted-foreground"> kW</span>
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Relación P</p>
                  <p className="text-xl font-bold text-foreground">
                    {systemState.pressureRatio}
                    <span className="text-sm font-normal text-muted-foreground">x</span>
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Alta presión</p>
                  <p className="text-xl font-bold text-hot">
                    {systemState.highPressure}
                    <span className="text-sm font-normal text-muted-foreground"> kPa</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Cycle Diagram */}
        <div className="lg:col-span-2">
          <Card className="h-full border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Thermometer className="h-5 w-5 text-primary" />
                Diagrama del Ciclo de Refrigeración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RefrigerationCycle
                isRunning={isRunning}
                condenserTemp={systemState.condenserTemp}
                evaporatorTemp={systemState.evaporatorTemp}
                compressorPressure={systemState.compressorPressure}
              />

              {/* Temperature and Pressure Displays */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TemperatureDisplay label="Condensador" temperature={systemState.condenserTemp} type="hot" />
                <TemperatureDisplay label="Evaporador" temperature={systemState.evaporatorTemp} type="cold" />
                <PressureGauge
                  label="Alta Presión"
                  pressure={systemState.highPressure}
                  maxPressure={2500}
                  type="high"
                />
                <PressureGauge label="Baja Presión" pressure={systemState.lowPressure} maxPressure={600} type="low" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 rounded-lg border border-border bg-card/50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          Base Teórica: Ciclo de Refrigeración (Rankine Inverso)
        </h3>
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <p>
            <span className="font-medium text-foreground">Principios Fundamentales:</span> El ciclo de refrigeración
            utiliza cambios de fase del refrigerante para transferir calor de una zona fría a una caliente mediante
            trabajo mecánico. El refrigerante circula en un ciclo de cuatro etapas que invierte el ciclo de Rankine
            usado en generación de energía.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="font-medium text-cold">Evaporador (1→2):</p>
              <p>
                Q = m·L (absorción de calor latente). El refrigerante se vaporiza a baja presión P_baja ≈{" "}
                {systemState.lowPressure} kPa, absorbiendo calor del interior.
              </p>
            </div>
            <div>
              <p className="font-medium text-primary">Compresor (2→3):</p>
              <p>
                W = P·ΔV (trabajo adiabático). El gas se comprime desde P_baja a P_alta = {systemState.highPressure}{" "}
                kPa, aumentando temperatura y presión para el condensador.
              </p>
            </div>
            <div>
              <p className="font-medium text-hot">Condensador (3→4):</p>
              <p>
                Q = m·Cp·ΔT + m·L (rechazo de calor latente). El gas se condensa liberando calor al ambiente a T_cond ={" "}
                {systemState.condenserTemp}°C.
              </p>
            </div>
            <div>
              <p className="font-medium text-neutral">Válvula Expansión (4→1):</p>
              <p>
                Proceso isoentálpico (h = cte). El líquido se expande hasta P_baja, enfriándose a T_evap ={" "}
                {systemState.evaporatorTemp}°C, completando el ciclo.
              </p>
            </div>
          </div>
          <p className="text-xs pt-2 border-t border-border">
            <span className="font-medium">Ecuación de Clausius-Clapeyron:</span> dP/dT = L/(T·Δv) relaciona presión de
            saturación con temperatura. Las temperaturas de saturación mostradas se calculan basadas en las propiedades
            del refrigerante y la presión del compresor.
          </p>
        </div>
      </div>
    </div>
  )
}
