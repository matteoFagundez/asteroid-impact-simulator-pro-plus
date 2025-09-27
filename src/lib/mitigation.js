export function applyKineticImpactor(orbitEl, dV_ms){
  const scale = Math.min(0.001, dV_ms/1000)
  return { ...orbitEl, M0_deg: orbitEl.M0_deg + 360*scale }
}
export function applyGravityTractor(orbitEl, duration_days, accel_mm_s2){
  const dV = (accel_mm_s2/1000) * duration_days * 86400
  return applyKineticImpactor(orbitEl, dV)
}
export function applyNuclearStandoff(orbitEl, efficiency=0.5){
  const dV = 50 * efficiency
  return applyKineticImpactor(orbitEl, dV)
}