import React from "react";

function jdToDate(jd) { // Revisar la conversión 
  const unixTime = (jd - 2440587.5) * 86400000;
  return new Date(unixTime);
}

export default function ImpactSimulator({ intersection, diameter_m }) {
  if (!intersection) {
    return (
      <div className="p-3 bg-white rounded shadow text-sm text-gray-600">
        Selecciona un asteroide para simular el impacto.
      </div>
    );
  }

  const { metrics, radii, t_jd, velocity_ms, angle_deg } = intersection;

  // Convertir JD a fecha normal
  const impactDate = jdToDate(t_jd);
  const impactDateStr = impactDate.toISOString().split("T")[0];

  // Calcular días restantes
  const now = new Date();
  const diffMs = impactDate - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return (
    <div className="p-3 bg-white rounded shadow text-sm">
      <h2 className="font-bold mb-2">Impacto Simulado</h2>
      <ul className="space-y-1">
        <li><b>Diámetro:</b> {diameter_m.toLocaleString()} m</li>

        {metrics && (
          <>
            <li><b>Masa:</b> {metrics.mass_kg.toExponential(3)} kg</li>
            <li><b>Energía:</b> {metrics.KE_megatons?.toFixed(2)} Mt TNT</li>
            <li><b>Cráter:</b> {metrics.crater_diameter_m?.toFixed(0)} m</li>
          </>
        )}

        {radii && (
          <>
            <li><b>Fecha estimada de impacto:</b> {impactDateStr}</li>
            <li><b>Cuenta regresiva:</b> {diffDays} días</li>
            <li><b>Velocidad:</b> {velocity_ms.toFixed(0)} m/s</li>
            <li><b>Ángulo:</b> {angle_deg.toFixed(1)}°</li>
            <li><b>Zona severa:</b> {radii.severe.toFixed(0)} m</li>
            <li><b>Zona moderada:</b> {radii.moderate.toFixed(0)} m</li>
            <li><b>Zona leve:</b> {radii.light.toFixed(0)} m</li>
          </>
        )}
      </ul>
    </div>
  );
}
