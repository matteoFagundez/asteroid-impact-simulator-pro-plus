// src/components/UserImpactSimulator.jsx
import React, { useState } from "react";
import { impactMetrics, impactRadii } from "../lib/impactPhysics.js";

export default function UserImpactSimulator({ asteroid, lat, lon, onSimulate }) {
  const [angle, setAngle] = useState(45);
  const [result, setResult] = useState(null); // 👈 resultados después de simular

  if (!asteroid || lat == null || lon == null) return null;

  const diameter_m = asteroid.diameter_m || 50;
  const velocity_ms = asteroid.velocity_ms || 20000;

  const handleSimulate = () => {
    // Calculamos métricas solo al presionar el botón
    const metrics = impactMetrics({ diameter_m, velocity_ms, angle_deg: angle });
    const radii = impactRadii({ diameter_m, velocity_ms, angle_deg: angle });

    const data = {
      lat,
      lon,
      angle_deg: angle,
      velocity_ms,
      metrics,
      radii,
    };

    setResult(data); // guardamos en el estado interno
    if (onSimulate) onSimulate(data); // enviamos al padre (mapa)
  };

  return (
    <div className="p-4 bg-white rounded shadow space-y-2">
      <h3 className="font-bold text-lg">🌍 Impacto Personalizado</h3>
      <p><strong>Asteroide:</strong> {asteroid.name}</p>
      <p><strong>Ubicación:</strong> {lat.toFixed(2)}°, {lon.toFixed(2)}°</p>

      <div className="flex items-center gap-2">
        <label>Ángulo:</label>
        <input
          type="range"
          min="10"
          max="90"
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
        />
        <span>{angle}°</span>
      </div>

      {/* 🔹 Solo mostramos resultados después de simular */}
      {result && (
        <div className="text-sm space-y-1">
          <p><strong>Diámetro:</strong> {diameter_m.toFixed(0)} m</p>
          <p><strong>Masa:</strong> {result.metrics.mass_kg.toExponential(2)} kg</p>
          <p><strong>Energía:</strong> {result.metrics.KE_megatons.toFixed(2)} Mt TNT</p>
          <p><strong>Cráter:</strong> {result.metrics.crater_diameter_m.toFixed(0)} m</p>
          <p><strong>Zona severa:</strong> {result.radii.severe.toFixed(0)} m</p>
          <p><strong>Zona moderada:</strong> {result.radii.moderate.toFixed(0)} m</p>
          <p><strong>Zona leve:</strong> {result.radii.light.toFixed(0)} m</p>
        </div>
      )}

      <button
        onClick={handleSimulate}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        🚀 Simular Impacto
      </button>
    </div>
  );
}
