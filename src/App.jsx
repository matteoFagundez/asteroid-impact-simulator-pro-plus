
// src/App.jsx
import React, { useEffect, useMemo, useState } from 'react';
import TimeController from './components/TimeController.jsx';
import OrbitalViewer3D from './components/OrbitalViewer3D.jsx';
import OrbitalViewerComponent from './components/OrbitalViewerComponent.jsx';
import EarthImpactView from './components/EarthImpactView.jsx';
import ImpactSimulator from './components/ImpactSimulator.jsx';
import MitigationStrategies from './components/MitigationStrategies.jsx';
import DataVisualizer from './components/DataVisualizer.jsx';
import Storytelling from './components/Storytelling.jsx';

import { fetchAsteroids, fetchOrbitElements } from './services/nasa.js';
import { keplerToState, earthStateApprox, computeEntryAngle,  findEarthIntersection, eciToLatLon } from './lib/orbital.js';
import { impactMetrics, impactRadii } from './lib/impactPhysics.js';
import { findNodeImpactCandidate } from './lib/nodeImpact.js';
import ImpactMap from "./components/ImpactMap.jsx"; 
import UserImpactSimulator from "./components/UserImpactSimulator.jsx"; 
import ImpactAndOrbitPanels from "./components/ImpactAndOrbitPanels.jsx";
import ManualImpactLayout from "./components/ManualImpactLayout";



// util para convertir Julian Date a fecha legible
function jdToDate(jd) {
  const unixTime = (jd - 2440587.5) * 86400000;
  return new Date(unixTime).toISOString().split("T")[0];
}

export default function App(){
  const [asteroids, setAsteroids] = useState([]);
  const [selected, setSelected] = useState(null);
  const [orbitEl, setOrbitEl] = useState(null);
  const [dateJD, setDateJD] = useState(2460200.5);
  const [scale, setScale] = useState(10);
  const [useEarthView, setUseEarthView] = useState(true);
  const [impactData, setImpactData] = useState(null);

  const [manualMode, setManualMode] = useState(false); // ⬅️ toggle automático / manual
  const [userLatLon, setUserLatLon] = useState(null);
  const [userAngle, setUserAngle] = useState(45);

  const handleSelectAsteroid = async (id) => {
    const base = asteroids.find(x => x.id === id);
    const orb = await fetchOrbitElements(base.id); 
    const orbitEl = { ...base, ...orb };
    setSelected(base);
    setOrbitEl(orbitEl);
  };

  // 1) Carga inicial de asteroides
  useEffect(()=>{
    (async()=>{
      const list = await fetchAsteroids(import.meta.env.VITE_NASA_API_KEY);
      setAsteroids(list);
      setSelected(list[0]);
      setOrbitEl(list[0]);
    })();
  }, []);

  // 2) Prepara muestras para orrery (Three)
  const samplesEarth = useMemo(()=>{
    const out = []; const start = dateJD-182, step=15;
    for(let d=0; d<=365; d+=step){
      const s = earthStateApprox(start + d);
      out.push([s.r_eci[0]/1.495978707e11, s.r_eci[1]/1.495978707e11, s.r_eci[2]/1.495978707e11]);
    }
    return out;
  }, [dateJD]);

  const samplesAsteroid = useMemo(()=>{
    if(!orbitEl) return [];
    const out = []; const start = dateJD-182, step=15;
    for(let d=0; d<=365; d+=step){
      const s = keplerToState(orbitEl, start + d);
      out.push([s.r_eci[0]/1.495978707e11, s.r_eci[1]/1.495978707e11, s.r_eci[2]/1.495978707e11]);
    }
    return out;
  }, [orbitEl, dateJD]);
  const diameter_m = selected?.diameter_m || 50;
  const [userPoint, setUserPoint] = useState(null);
  const [rings, setRings] = useState(null);
useEffect(() => {
  (async()=>{
    if (!orbitEl || !selected) { setImpactData(null); return; }

    // 1) Intentar impacto real (si tenés esta función)
    let hit = null;
    try {
      hit = await findEarthIntersectionRange(orbitEl, dateJD, 365, 600);
    } catch {}

    // 2) Si no hay impacto real, calculamos candidato por nodo
    let lat_deg, lon_deg, angle_deg, velocity_ms, t_jd;

    /*if (hit) {
      const geo = eciToLatLon(hit.t_jd, hit.posECI);
      lat_deg = geo.lat_deg;
      lon_deg = geo.lon_deg;
      angle_deg = hit.angle_deg || 45;
      velocity_ms = hit.speed_ms || selected.velocity_ms || 20000;
      t_jd = hit.t_jd;
    } else {*/
      const node = findNodeImpactCandidate(orbitEl, dateJD);
      console.log("🚀 Impact candidate", node);
      if (!node) { setImpactData(null); return; }
      


      lat_deg = node.lat_deg;
      lon_deg = node.lon_deg;
      //angle_deg = computeEntryAngle(node.posECI, node.velECI);
      angle_deg = node.angle_deg;
      velocity_ms = node.speed_ms || selected.velocity_ms || 20000;
      t_jd = node.t_jd;
   // }

    const diameter_m = selected.diameter_m || 50;
    const density_kgm3 = selected?.density_kgm3 ?? 3000; // estándar
    const metrics = impactMetrics({ diameter_m, velocity_ms, angle_deg, density_kgm3 });
    const radii = impactRadii({ diameter_m, velocity_ms, angle_deg, density_kgm3 });


    setImpactData({
      lat: Number.isFinite(lat_deg) ? lat_deg : 0,
      lon: Number.isFinite(lon_deg) ? lon_deg : 0,
      t_jd,
      angle_deg,
      velocity_ms,
      density_kgm3,
      metrics,
      radii
    });
  })();
}, [orbitEl, selected, dateJD]);

useEffect(() => {
  if (manualMode && orbitEl && userPoint) {
    const diameter_m = orbitEl.diameter_m || selected?.diameter_m || 50;
    const velocity_ms = orbitEl.velocity_ms || selected?.velocity_ms || 20000;
    const angle_deg = userAngle || orbitEl.angle_deg || 45;
    const density_kgm3 = orbitEl.density_kgm3 || 3000;

    const metrics = impactMetrics({ diameter_m, velocity_ms, angle_deg, density_kgm3 });
    const radii = impactRadii({ diameter_m, velocity_ms, angle_deg, density_kgm3 });

    setRings({
      lat: userPoint.lat,
      lon: userPoint.lon,
      radii,
      metrics,
      velocity_ms,
      angle_deg,
    });
  }
}, [manualMode, orbitEl, userPoint, userAngle, selected]);



  // 4) Handler de mitigación → aplica Δv y fuerza recomputación
const handleApplyMitigation = (newOrbit) => {
  setOrbitEl(newOrbit);

  //if (manualMode) {
    // Recalcular candidato con la órbita mitigada
    const node = findNodeImpactCandidate(newOrbit, dateJD);
    if (node) {
      setUserPoint({
        ...newOrbit,
        lat: node.lat_deg,
        lon: node.lon_deg,
      });
      setUserAngle(node.angle_deg || 45);
    } else {
      // Si ya no hay impacto, borramos los rings
      setUserPoint(null);
      setRings(null);
    }
  //}
};





return (
  <div className="bg-space bg-cover bg-center bg-no-repeat h-screen w-screen">
    <div className="grid grid-cols-3 h-screen">
      <div className="col-span-2 p-3 flex flex-col gap-3">
        {/* Imagen de encabezado */}
      <div className="w-full flex justify-center mb-3">
        
      </div>
        <div className="flex items-center gap-4 bg-[#1e293b] text-white p-3 rounded shadow-md border border-gray-700">
          
          
        
          {/* Label e input */}
          <label className="text-sm font-bold text-cyan-300">ASTEROID:</label>
          <select
            onChange={(e) => handleSelectAsteroid(e.target.value)}
            className="bg-[#0f172a] text-white px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            {asteroids.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#0f172a] text-white">
                {a.name}
              </option>
            ))}
          </select>
          <img
            src="/assets/Novasteroid.png" 
            alt="Asteroid Header"
            className="w-52 h-auto object-contain"
          />
          {/* Botones modo */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setManualMode(false)}
              className={`px-4 py-2 rounded font-semibold tracking-wide transition ${
                !manualMode
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-[#0f172a] text-gray-300 border border-gray-600 hover:bg-gray-700"
              }`}
            >
              🌐 Automátic
            </button>
            <button
              onClick={() => setManualMode(true)}
              className={`px-4 py-2 rounded font-semibold tracking-wide transition ${
                manualMode
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                  : "bg-[#0f172a] text-gray-300 border border-gray-600 hover:bg-gray-700"
              }`}
            >
              🎛️ Manual
            </button>
          </div>
        </div>


        

        {manualMode ? (
          <>
           <ManualImpactLayout
            asteroid={selected}
            impactRings={rings}
            onSelectPoint={setUserPoint}
            userPoint={userPoint}
            onSimulate={setRings}
            samplesEarth={samplesEarth}
            samplesAsteroid={samplesAsteroid}
            orbitEl={orbitEl}
            onApplyMitigation={handleApplyMitigation}
          />

          </>
        ) : useEarthView ? (
          <>
            <ImpactAndOrbitPanels
              impactData={impactData}
              samplesEarth={samplesEarth}
              samplesAsteroid={samplesAsteroid}
            />

          </>


        ) : (
          <OrbitalViewer3D />
        )}
        
      </div>

      <div className="col-span-1 p-3 space-y-3 bg-[#0f172a] border-l border-cyan-700/40 overflow-y-auto text-cyan-200 font-mono">

        {manualMode ? (
          <>
            <MitigationStrategies orbitEl={orbitEl} onApply={handleApplyMitigation} />


            <div className="rounded border-t border-gray-300 pt-3">
              {userPoint ? (
                <UserImpactSimulator
                  asteroid={orbitEl}
                  lat={userPoint.lat}
                  lon={userPoint.lon}
                  impactData={rings}
                  onSimulate={setRings}
                />
              ) : (
                <p className="text-sm text-gray-600">
                  Selecciona un punto en el mapa para simular impacto.
                </p>
              )}
            </div>
          </>
        ) : impactData ? (
          <>
            <ImpactSimulator intersection={impactData} diameter_m={diameter_m} />
            <MitigationStrategies orbitEl={orbitEl} onApply={handleApplyMitigation} />
            
          </>
        ) : (
          <div className="p-6 rounded-lg shadow-md bg-[#1e293b]/80 border border-cyan-400 text-center text-cyan-200 font-mono">
            <p className="text-lg font-bold mb-2">🛰️ No Impact Detected</p>
          </div>
        )}
      </div>

    </div>
  </div>
  );

}



