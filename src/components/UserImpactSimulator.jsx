import React, { useState } from "react";
import { impactMetrics, impactRadii } from "../lib/impactPhysics.js";

// Función para convertir JD a fecha legible
function jdToDate(jd) {
  const unixTime = (jd - 2440587.5) * 86400000;
  return new Date(unixTime);
}

export default function UserImpactSimulator({ asteroid, lat, lon, onSimulate }) {
  const [angle, setAngle] = useState(45);
  const [result, setResult] = useState(null); // resultados después de simular

  if (!asteroid || lat == null || lon == null) return null;

  const diameter_m = asteroid.diameter_m || 50;
  const velocity_ms = asteroid.velocity_ms || 20000;

  const handleSimulate = () => {
    const metrics = impactMetrics({ diameter_m, velocity_ms, angle_deg: angle });
    const radii = impactRadii({ diameter_m, velocity_ms, angle_deg: angle });

    // 🔹 simulamos un JD futuro (por ejemplo, hoy + 30 días)
    const now = new Date();
    const futureJD = now.getTime() / 86400000 + 2440587.5 + 30; 

    const data = {
      lat,
      lon,
      angle_deg: angle,
      velocity_ms,
      metrics,
      radii,
      t_jd: futureJD
    };

    setResult(data);
    if (onSimulate) onSimulate(data);
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

      {result && (
        <div className="text-sm space-y-1">
          <p><strong>Diámetro:</strong> {diameter_m.toFixed(0)} m</p>
          <p><strong>Masa:</strong> {result.metrics.mass_kg.toExponential(2)} kg</p>
          <p><strong>Energía:</strong> {result.metrics.KE_megatons.toFixed(2)} Mt TNT</p>
          <p><strong>Cráter:</strong> {result.metrics.crater_diameter_m.toFixed(0)} m</p>

          {/* 🔹 Info adicional como en ImpactSimulator */}
          <p><strong>Fecha estimada de impacto:</strong> {jdToDate(result.t_jd).toISOString().split("T")[0]}</p>
          <p>
            <strong>Cuenta regresiva:</strong>{" "}
            {Math.floor(
              (jdToDate(result.t_jd) - new Date()) / (1000 * 60 * 60 * 24)
            )}{" "}
            días
          </p>
          <p><strong>Velocidad:</strong> {result.velocity_ms.toFixed(0)} m/s</p>
          <p><strong>Ángulo:</strong> {result.angle_deg.toFixed(1)}°</p>
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
