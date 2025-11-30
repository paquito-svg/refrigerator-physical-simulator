"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Droplets } from "lucide-react"
import { type RefrigerantProperties, refrigerantPresets } from "@/utils/thermodynamic-calculations"

interface RefrigerantInputModeProps {
  refrigerant: RefrigerantProperties
  onRefrigerantChange: (props: RefrigerantProperties) => void
}

export default function RefrigerantInputMode({ refrigerant, onRefrigerantChange }: RefrigerantInputModeProps) {
  const [inputMode, setInputMode] = useState<"sliders" | "direct">("sliders")

  const handleSliderChange = (key: keyof RefrigerantProperties, value: number) => {
    onRefrigerantChange({
      ...refrigerant,
      [key]: value,
    })
  }

  const handleDirectInput = (key: keyof RefrigerantProperties, value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue)) {
      onRefrigerantChange({
        ...refrigerant,
        [key]: numValue,
      })
    }
  }

  const loadPreset = (preset: RefrigerantProperties) => {
    onRefrigerantChange(preset)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Droplets className="h-5 w-5 text-cold" />
          Propiedades del Refrigerante
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Presets de Refrigerantes</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 md:grid-cols-2">
            {Object.entries(refrigerantPresets).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => loadPreset(preset.properties)}
                className="justify-start text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Mode Toggle */}
        <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "sliders" | "direct")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sliders">Deslizadores</TabsTrigger>
            <TabsTrigger value="direct">Valores Directos</TabsTrigger>
          </TabsList>

          {/* Sliders Mode */}
          <TabsContent value="sliders" className="space-y-5 mt-4">
            {/* Latent Heat */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Calor latente de vaporización</Label>
                <span className="font-mono text-sm font-semibold text-foreground">{refrigerant.latentHeat} kJ/kg</span>
              </div>
              <Slider
                value={[refrigerant.latentHeat]}
                onValueChange={(v) => handleSliderChange("latentHeat", v[0])}
                min={100}
                max={400}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100 kJ/kg</span>
                <span>400 kJ/kg</span>
              </div>
            </div>

            {/* Vaporization Pressure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Presión de vaporización (sat.)</Label>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {refrigerant.vaporizationPressure} kPa
                </span>
              </div>
              <Slider
                value={[refrigerant.vaporizationPressure]}
                onValueChange={(v) => handleSliderChange("vaporizationPressure", v[0])}
                min={100}
                max={1000}
                step={20}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100 kPa</span>
                <span>1000 kPa</span>
              </div>
            </div>

            {/* Specific Heat */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Calor específico (Cp)</Label>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {refrigerant.specificHeat} kJ/(kg·K)
                </span>
              </div>
              <Slider
                value={[refrigerant.specificHeat * 10]}
                onValueChange={(v) => handleSliderChange("specificHeat", v[0] / 10)}
                min={8}
                max={25}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.8 kJ/(kg·K)</span>
                <span>2.5 kJ/(kg·K)</span>
              </div>
            </div>

            {/* Boiling Point */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Punto de ebullición</Label>
                <span className="font-mono text-sm font-semibold text-foreground">{refrigerant.boilingPoint}°C</span>
              </div>
              <Slider
                value={[refrigerant.boilingPoint + 100]}
                onValueChange={(v) => handleSliderChange("boilingPoint", v[0] - 100)}
                min={-100}
                max={100}
                step={2}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>-100°C</span>
                <span>100°C</span>
              </div>
            </div>
          </TabsContent>

          {/* Direct Input Mode */}
          <TabsContent value="direct" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Calor latente (kJ/kg)</Label>
                <Input
                  type="number"
                  value={refrigerant.latentHeat}
                  onChange={(e) => handleDirectInput("latentHeat", e.target.value)}
                  min={50}
                  max={500}
                  step={1}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Presión vap. (kPa)</Label>
                <Input
                  type="number"
                  value={refrigerant.vaporizationPressure}
                  onChange={(e) => handleDirectInput("vaporizationPressure", e.target.value)}
                  min={50}
                  max={2000}
                  step={1}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cp (kJ/(kg·K))</Label>
                <Input
                  type="number"
                  value={refrigerant.specificHeat}
                  onChange={(e) => handleDirectInput("specificHeat", e.target.value)}
                  min={0.5}
                  max={5}
                  step={0.1}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Pbo. ebullición (°C)</Label>
                <Input
                  type="number"
                  value={refrigerant.boilingPoint}
                  onChange={(e) => handleDirectInput("boilingPoint", e.target.value)}
                  min={-150}
                  max={150}
                  step={0.1}
                  className="text-sm"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
