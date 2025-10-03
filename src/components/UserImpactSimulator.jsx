import React, { useState, useEffect } from "react";
import { impactMetrics, impactRadii } from "../lib/impactPhysics.js";

function jdToDate(jd) {
  const unixTime = (jd - 2440587.5) * 86400000;
  return new Date(unixTime);
}

export default function UserImpactSimulator({ asteroid, lat, lon, impactData, onSimulate }) {
  const [angle, setAngle] = useState(45);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (impactData) {
      setResult(impactData);
      setAngle(impactData.angle_deg || 45);
    }
  }, [impactData]);
  if (!asteroid || lat == null || lon == null) return null;

  const diameter_m   = asteroid?.diameter_m   || 50;
  const velocity_ms  = asteroid?.velocity_ms  || 20000;
  const angle_init   = asteroid?.angle_deg    || angle; 
  const density_kgm3 = asteroid?.density_kgm3 || 3000;

  // 🔹 Recalcular siempre que cambien orbitEl (asteroid), lat, lon o angle
  useEffect(() => {
    const metrics = impactMetrics({ diameter_m, velocity_ms, angle_deg: angle_init, density_kgm3 });
    const radii   = impactRadii({ diameter_m, velocity_ms, angle_deg: angle_init, density_kgm3 });


    const now = new Date();
    const futureJD = now.getTime() / 86400000 + 2440587.5 + 30;

    const data = {
      lat,
      lon,
      angle_deg: angle,
      velocity_ms,
      metrics,
      radii,
      t_jd: futureJD,
      diameter_m,
      density_kgm3
    };

    setResult(data);
    if (onSimulate) onSimulate(data);
  }, [asteroid, lat, lon, angle]); // 👈 dependencias
const handleSimulate = () => {
    const metrics = impactMetrics({ diameter_m, velocity_ms, angle_deg: angle, density_kgm3 });
    const radii   = impactRadii({ diameter_m, velocity_ms, angle_deg: angle, density_kgm3 });

    const now = new Date();
    const futureJD = now.getTime() / 86400000 + 2440587.5 + 30;

    const data = {
      lat,
      lon,
      angle_deg: angle,
      velocity_ms,
      metrics,
      radii,
      t_jd: futureJD,
      diameter_m,
      density_kgm3
    };

    setResult(data);
    if (onSimulate) onSimulate(data);
  };
  const dateStr = result ? jdToDate(result.t_jd).toISOString().split("T")[0] : null;

  return (
    <div className="p-4 bg-[#0f172a] text-white rounded-xl shadow-lg space-y-3 border border-gray-700 font-mono h-[330px] overflow-hidden">
      {/* Entrada angular vertical */}
      <div className="flex justify-between items-center">
        <label className="text-cyan-300 text-xs tracking-wide">ENTRY ANGLE</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="10"
            max="90"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="accent-cyan-500"
          />
          <span className="text-lg text-cyan-300">{angle}°</span>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <DataLine label="DIAMETER" value={`${diameter_m.toFixed(0)} m`} color="text-green-400" />
          <DataLine label="VELOCITY" value={`${result.velocity_ms.toFixed(0)} m/s`} color="text-green-400" />
          <DataLine label="ENERGY" value={`${result.metrics.KE_megatons.toFixed(2)} Mt`} />
          <DataLine label="CRATER" value={`${result.metrics.crater_diameter_m.toFixed(0)} m`} />
          <DataLine label="SEVERE ZONE" value={`${result.radii.severe.toFixed(0)} m`} />
          <DataLine label="MODERATE ZONE" value={`${result.radii.moderate.toFixed(0)} m`} />
          <DataLine label="LIGHT ZONE" value={`${result.radii.light.toFixed(0)} m`} />
          <DataLine label="ANGLE" value={`${result.angle_deg.toFixed(1)}°`} />
        </div>
      )}

      {/* Fecha destacada estilo badge */}
      {dateStr && (
        <div className="bg-[#3f2e1d] border border-orange-500 rounded-lg text-center py-1 mt-2">
          <p className="text-xs text-orange-300 tracking-widest">ESTIMATED IMPACT</p>
          <p className="text-xl text-orange-400 font-bold">
            {new Date(dateStr).toDateString().toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
}

// Línea de información formateada
function DataLine({ label, value, color = "text-cyan-300" }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400 tracking-wide">{label}</span>
      <span className={`text-right text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}
