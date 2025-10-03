import React from "react";

function jdToDate(jd) {
  const unixTime = (jd - 2440587.5) * 86400000;
  return new Date(unixTime);
}

export default function ImpactSimulator({ intersection, diameter_m }) {
  if (!intersection) {
    return (
      <div className="p-3 bg-[#11151b] rounded shadow text-sm text-gray-400 border border-gray-700">
        Selecciona un asteroide para simular el impacto.
      </div>
    );
  }

  const { metrics, radii, t_jd, velocity_ms, angle_deg } = intersection;
  const impactDate = jdToDate(t_jd);
  const impactDateStr = impactDate.toISOString().split("T")[0];

  const now = new Date();
  const diffMs = impactDate - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return (
    <div className="p-4 bg-[#0f172a] text-white rounded-xl shadow-lg space-y-3 border border-gray-700 font-mono h-[330px] overflow-hidden">
      <div className="flex justify-between items-center">
        <label className="text-cyan-300 text-xs tracking-wide">IMPACT DETAILS</label>
        <span className="text-sm text-orange-400 font-semibold">
          {diffDays >= 0
            ? `EN ${diffDays} DÍAS`
            : `HACE ${Math.abs(diffDays)} DÍAS`}
        </span>
      </div>

      {/* Grilla estilo UserImpactSimulator */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <DataLine label="DIAMETER" value={`${diameter_m.toFixed(0)} m`} color="text-green-400" />
        <DataLine label="VELOCITY" value={`${velocity_ms.toFixed(0)} m/s`} color="text-green-400" />
        {metrics && (
          <>
            <DataLine label="MASS" value={`${metrics.mass_kg.toExponential(3)} kg`} />
            <DataLine label="ENERGY" value={`${metrics.KE_megatons?.toFixed(2)} Mt`} />
            <DataLine label="CRATER" value={`${metrics.crater_diameter_m?.toFixed(0)} m`} />
          </>
        )}
        {radii && (
          <>
            <DataLine label="SEVERE ZONE" value={`${radii.severe.toFixed(0)} m`} />
            <DataLine label="MODERATE ZONE" value={`${radii.moderate.toFixed(0)} m`} />
            <DataLine label="LIGHT ZONE" value={`${radii.light.toFixed(0)} m`} />
          </>
        )}
        <DataLine label="ENTRY ANGLE" value={`${angle_deg.toFixed(1)}°`} />
      </div>

      {/* Fecha destacada estilo badge */}
      <div className="bg-[#3f2e1d] border border-orange-500 rounded-lg text-center py-1 mt-2">
        <p className="text-xs text-orange-300 tracking-widest">ESTIMATED IMPACT</p>
        <p className="text-xl text-orange-400 font-bold">
          {impactDate.toDateString().toUpperCase()}
        </p>
      </div>
    </div>
  );
}

// Línea formateada
function DataLine({ label, value, color = "text-cyan-300" }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400 tracking-wide">{label}</span>
      <span className={`text-right text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}
