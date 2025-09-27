// src/components/ImpactSimulator.jsx
import React from "react";

export default function ImpactSimulator({ intersection, diameter_m }) {
  if (!intersection) {
    return (
      <div className="p-3 bg-white rounded shadow text-sm text-gray-600">
        Selecciona un asteroide para simular el impacto.
      </div>
    );
  }

  const { metrics, radii } = intersection;

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
            <li><b>Zona severa:</b> {radii.severe.toFixed(0)} m</li>
            <li><b>Zona moderada:</b> {radii.moderate.toFixed(0)} m</li>
            <li><b>Zona leve:</b> {radii.light.toFixed(0)} m</li>
          </>
        )}
      </ul>
    </div>
  );
}
