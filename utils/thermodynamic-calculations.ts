export interface RefrigerantProperties {
  latentHeat: number // kJ/kg - Calor latente de vaporización
  vaporizationPressure: number // kPa - Presión de vaporización (a temperatura de referencia)
  specificHeat: number // kJ/(kg·K) - Calor específico del refrigerante
  boilingPoint: number // °C - Punto de ebullición a presión atmosférica
}

export interface SystemCalculations {
  compressorPressure: number // kPa
  condenserTemp: number // °C
  evaporatorTemp: number // °C
  refrigerantFlow: number // kg/s
  cop: number // Coefficient of Performance
  heatRemoved: number // kW
  workInput: number // kW
  lowPressure: number // kPa
  highPressure: number // kPa
  pressureRatio: number // Relación de presiones
}

export interface ValidationErrors {
  pressure?: string
  ambientTemp?: string
  evaporatorTemp?: string
}

/**
 * Valida los parámetros del sistema y retorna errores si existen
 */
export function validateSystemParameters(
  compressorPressure: number,
  ambientTemp: number,
  evaporatorTemp: number,
): ValidationErrors {
  const errors: ValidationErrors = {}

  // Presión muy baja
  if (compressorPressure < 100) {
    errors.pressure = "Presión demasiado baja (<100 kPa). El compresor no funcionaría."
  }

  // Presión muy alta (> 2500 kPa puede causar daños)
  if (compressorPressure > 2500) {
    errors.pressure = "Presión demasiado alta (>2500 kPa). Riesgo de falla del sistema."
  }

  // Temperatura ambiente muy baja
  if (ambientTemp < -40) {
    errors.ambientTemp = "Temperatura ambiente muy baja (<-40°C). Condensador no puede rechazar calor."
  }

  // Temperatura ambiente muy alta
  if (ambientTemp > 60) {
    errors.ambientTemp = "Temperatura ambiente muy alta (>60°C). Eficiencia crítica comprometida."
  }

  // Evaporador más frío que lo posible
  if (evaporatorTemp < -80) {
    errors.evaporatorTemp = "Temperatura de evaporador muy baja (<-80°C). Físicamente imposible con estos parámetros."
  }

  return errors
}

/**
 * Relación de Clausius-Clapeyron: dP/dT = L / (T * Δv)
 * Aproximación: T_sat ≈ T_ref + (ln(P/P_ref) * T_ref^2 * Δv) / L
 * Para refrigerantes, aproximamos como una relación logarítmica simple
 */
function calculateSaturationTemperature(
  pressure: number,
  referencePressure: number,
  referenceTemp: number,
  latentHeat: number,
): number {
  // Relación aproximada usando la ecuación de Antoine simplificada
  const pressureRatio = pressure / referencePressure
  const tempChange = (Math.log(pressureRatio) * 100) / (latentHeat / 10)
  return referenceTemp + tempChange
}

/**
 * Calcula el estado del sistema dado los parámetros del refrigerante, compresor y ambiente
 * Agregado parámetro ambientTemp
 */
export function calculateSystemState(
  compressorPressure: number,
  refrigerant: RefrigerantProperties,
  ambientTemp = 25,
): SystemCalculations {
  // Presión de baja presión (a la salida de la válvula de expansión)
  // Típicamente es 60-80% de la presión de vaporización
  const lowPressure = refrigerant.vaporizationPressure * 0.75

  // Relación de presiones del compresor
  const pressureRatio = compressorPressure / lowPressure

  // === TEMPERATURAS DE SATURACIÓN ===
  // Temperatura en el condensador (alta presión)
  // El condensador debe estar por encima de la temperatura ambiente para rechazar calor
  const condenserTempBase = calculateSaturationTemperature(
    compressorPressure,
    101.325,
    refrigerant.boilingPoint,
    refrigerant.latentHeat,
  )
  const condenserTemp = Math.max(condenserTempBase, ambientTemp + 5) // Mínimo 5°C sobre ambiente

  // Temperatura en el evaporador (baja presión)
  const evaporatorTemp = calculateSaturationTemperature(
    lowPressure,
    101.325,
    refrigerant.boilingPoint,
    refrigerant.latentHeat,
  )

  // === CÁLCULOS DE FLUJO Y ENERGÍA ===
  // Flujo másico del refrigerante (modelado como función de presión y propiedades)
  const baseFlow = 0.015 // kg/s - flujo base
  const flowFactor = 0.5 + (compressorPressure / 2000) * 0.3 // Factor que varía con presión
  const refrigerantFlow = baseFlow * flowFactor

  // Calor removido en el evaporador: Q_evap = m_dot * L * efficiency
  // Donde efficiency disminuye con mayor delta T (menos tiempo de contacto)
  const deltaT = condenserTemp - evaporatorTemp
  const coolingEfficiency = Math.max(0.5, 1 - deltaT / 80)
  const heatRemoved = refrigerantFlow * refrigerant.latentHeat * coolingEfficiency

  // Trabajo de entrada al compresor (trabajo adiabático ideal)
  // W = m_dot * Cp * (T_high - T_low) / efficiency
  const compressorEfficiency = 0.75 - (pressureRatio - 2) * 0.05 // Eficiencia disminuye con alta relación de presiones
  const workInput =
    (refrigerantFlow * refrigerant.specificHeat * (condenserTemp - evaporatorTemp) * Math.log(pressureRatio)) /
    (compressorEfficiency * 10)

  // Coeficiente de Performance (COP)
  const cop = workInput > 0.01 ? heatRemoved / workInput : 0

  return {
    compressorPressure: Math.round(compressorPressure * 10) / 10,
    condenserTemp: Math.round(condenserTemp * 10) / 10,
    evaporatorTemp: Math.round(evaporatorTemp * 10) / 10,
    refrigerantFlow: Math.round(refrigerantFlow * 1000) / 1000,
    cop: Math.round(cop * 100) / 100,
    heatRemoved: Math.round(heatRemoved * 100) / 100,
    workInput: Math.round(workInput * 100) / 100,
    lowPressure: Math.round(lowPressure * 10) / 10,
    highPressure: compressorPressure,
    pressureRatio: Math.round(pressureRatio * 100) / 100,
  }
}

/**
 * Presets de refrigerantes comunes
 */
export const refrigerantPresets = {
  R134a: {
    name: "R-134a (CFC-Free)",
    properties: {
      latentHeat: 215,
      vaporizationPressure: 301.2,
      specificHeat: 1.42,
      boilingPoint: -26.1,
    },
  },
  R410A: {
    name: "R-410A (Hydrofluoroolefin)",
    properties: {
      latentHeat: 195,
      vaporizationPressure: 402,
      specificHeat: 1.58,
      boilingPoint: -51.6,
    },
  },
  R32: {
    name: "R-32 (Low GWP)",
    properties: {
      latentHeat: 320,
      vaporizationPressure: 551,
      specificHeat: 1.68,
      boilingPoint: -51.7,
    },
  },
  R290: {
    name: "R-290 (Propane)",
    properties: {
      latentHeat: 355,
      vaporizationPressure: 928,
      specificHeat: 2.08,
      boilingPoint: -42.1,
    },
  },
}
