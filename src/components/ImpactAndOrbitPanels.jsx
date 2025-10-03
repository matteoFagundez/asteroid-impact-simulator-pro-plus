// src/components/ImpactAndOrbitPanels.jsx
import React from "react";
import EarthImpactView from "./EarthImpactView";
import OrbitalViewerComponent from "./OrbitalViewerComponent";

export default function ImpactAndOrbitPanels({ impactData, samplesEarth, samplesAsteroid }) {
  return (
    <div className="grid grid-cols-2 gap-4 h-[600px] bg-[#0f172a] p-3 rounded shadow">
      <div className="flex flex-col rounded bg-[#1e293b] text-white p-3 h-[550px]">
        <h2 className="text-lg font-bold text-green-400 mb-2">☄️ Orbital Visualization</h2>
        <div className="flex-1 overflow-hidden rounded">
          <OrbitalViewerComponent
            samplesEarth={samplesEarth}
            samplesAsteroid={samplesAsteroid}
          />
        </div>
      </div>
      <div className="flex flex-col rounded bg-[#1e293b] text-white p-3">
        <h2 className="text-lg font-bold text-orange-400 mb-2">🌍 Earth Impact Map</h2>
        <div className="flex-1 overflow-hidden rounded h-[650px]">
          <EarthImpactView impact={impactData} />
        </div>
      </div>
      
    </div>
  );
}
