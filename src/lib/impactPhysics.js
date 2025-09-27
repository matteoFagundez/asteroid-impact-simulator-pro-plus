

// src/lib/impactPhysics.js
const J_PER_MT = 4.184e15;

/**
 * Métricas físicas del impacto
 * @param {number} diameter_m    Diámetro del asteroide [m]
 * @param {number} velocity_ms   Velocidad de entrada [m/s]
 * @param {number} angle_deg     Ángulo (0° = rasante, 90° = vertical)
 * @param {number} density_kgm3  Densidad [kg/m³] (por defecto: rocoso)
 */
export function impactMetrics({
  diameter_m,
  velocity_ms,
  angle_deg,
  density_kgm3 = 3000, // densidad estándar
}) {
  if (![diameter_m, velocity_ms, angle_deg].every(Number.isFinite)) {
    throw new Error("impactMetrics: parámetros inválidos");
  }

  // Masa = ρ * volumen (esfera)
  const r = diameter_m / 2;
  const volume = (4 / 3) * Math.PI * r ** 3;
  const mass = density_kgm3 * volume; // [kg]

  // Energía cinética total [J]
  const KE = 0.5 * mass * velocity_ms ** 2;

  // Energía efectiva (acoplamiento por ángulo)
  const angleRad = (angle_deg * Math.PI) / 180;
  const KE_eff = KE * Math.max(0, Math.sin(angleRad)); // clamp

  // A Mt TNT
  const KE_mt = KE / J_PER_MT;
  const KE_eff_mt = KE_eff / J_PER_MT;

  // Cráter (pi-scaling muy simplificada; orden de magnitud razonable)
  const rho_target = 2500; // kg/m³
  const g = 9.81;
  let crater_diameter_m = 1.161 * Math.pow(KE_eff / (rho_target * g), 0.25);
  if (!Number.isFinite(crater_diameter_m) || crater_diameter_m < 0) crater_diameter_m = 0;

  return {
    mass_kg: mass,
    KE_J: KE,
    KE_megatons: KE_mt,
    KE_effective_J: KE_eff,
    KE_effective_megatons: KE_eff_mt,
    crater_diameter_m,
  };
}

/**
 * Radios de daño (metros), escalados empíricamente sobre E_eff (Mt)
 * ~ severo ≈ 3·∛E_mt km; moderado 2×; leve 4× (clamp para visual)
 */
export function impactRadii({
  diameter_m,
  velocity_ms,
  angle_deg,
  density_kgm3 = 3000,
}) {
  if (![diameter_m, velocity_ms, angle_deg].every(Number.isFinite)) {
    throw new Error("impactRadii: parámetros inválidos");
  }

  const m = impactMetrics({ diameter_m, velocity_ms, angle_deg, density_kgm3 });
  const E_mt = Math.max(0, m.KE_effective_megatons);

  const severe_km   = 3.0 * Math.cbrt(E_mt);
  const moderate_km = 2.0 * severe_km;
  const light_km    = 4.0 * severe_km;

  const clampM = (meters) => Math.max(100, Math.min(meters, 300_000)); // 100 m .. 300 km

  return {
    severe:   clampM(severe_km   * 1000),
    moderate: clampM(moderate_km * 1000),
    light:    clampM(light_km    * 1000),
  };
}
