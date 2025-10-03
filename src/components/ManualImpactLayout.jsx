// src/components/ManualImpactLayout.jsx
import React from "react";
import ImpactMap from "./ImpactMap";
import UserImpactSimulator from "./UserImpactSimulator";
import OrbitalViewerComponent from "./OrbitalViewerComponent";

export default function ManualImpactLayout({
  asteroid,
  impactRings,
  onSelectPoint,
  userPoint,
  onSimulate,
  samplesEarth,
  samplesAsteroid,
  orbitEl,
  onApplyMitigation
}) {
  return (
    <div className="grid grid-cols-2 gap-4 h-[600px] bg-[#0f172a] p-3 rounded shadow">
      {/* 🟢 Panel Izquierdo: Órbitas + Simulador manual */}
      <div className="flex flex-col rounded bg-[#1e293b] text-white p-3 overflow-hidden">
        {/* ☄️ Visualización Orbital */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-green-400">☄️ Orbital Visualization</h2>
          </div>
          <div className="rounded overflow-hidden h-[500px]">
            <OrbitalViewerComponent
              samplesEarth={samplesEarth}
              samplesAsteroid={samplesAsteroid}
            />
          </div>
        </div>

        
      </div>

      {/* 🟠 Panel Derecho: Mapa de Impacto */}
      <div className="flex flex-col rounded bg-[#1e293b] text-white p-3 overflow-hidden h-[500px]">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-lg font-bold text-orange-400">🌍 Earth Impact Map</h2>
        </div>
        <div className="flex-1 rounded overflow-hidden ">
          <ImpactMap impactRings={impactRings} onSelect={onSelectPoint} />
        </div>
      </div>
    </div>
    
  );
}
