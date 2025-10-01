
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

  // 4) Handler de mitigación → aplica Δv y fuerza recomputación
  const handleApplyMitigation = (newOrbit) => {
    setOrbitEl(newOrbit);
  };

  const diameter_m = selected?.diameter_m || 50;
  const [userPoint, setUserPoint] = useState(null);
  const [rings, setRings] = useState(null);

return (
    <div className="grid grid-cols-3 h-screen">
      <div className="col-span-2 p-3 flex flex-col gap-3">
        <div className="p-3 bg-white rounded shadow flex gap-4 items-center">
          <label className="text-sm">Asteroide:</label>
          <select onChange={(e) => handleSelectAsteroid(e.target.value)}>
            {asteroids.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Botones para alternar */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setManualMode(false)}
              className={!manualMode ? "bg-blue-500 text-white px-3 py-1" : "px-3 py-1"}
            >
              Automático
            </button>
            <button
              onClick={() => setManualMode(true)}
              className={manualMode ? "bg-blue-500 text-white px-3 py-1" : "px-3 py-1"}
            >
              Manual
            </button>
          </div>
        </div>

        <TimeController
          timeScale={scale}
          onChangeScale={setScale}
          date={"2025-09-27T12:00"}
          onChangeDate={() => {}}
        />

        {manualMode ? (
          <>
            <ImpactMap onSelect={setUserPoint} impactRings={rings} />
              <div className="flex-1 min-h-0">
                <OrbitalViewerComponent 
                  samplesEarth={samplesEarth} 
                  samplesAsteroid={samplesAsteroid} 
                />
              </div>
          </>
        ) : useEarthView ? (
          <>
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0">
                <EarthImpactView impact={impactData} />
              </div>
              <div className="flex-1 min-h-0">
                <OrbitalViewerComponent 
                  samplesEarth={samplesEarth} 
                  samplesAsteroid={samplesAsteroid} 
                />
              </div>
            </div>
          </>


        ) : (
          <OrbitalViewer3D />
        )}
        
      </div>

      <div className="col-span-1 p-3 space-y-3 bg-gray-50 border-l">
        {manualMode ? (
          <div className="p-3 bg-white rounded shadow">
            <p className="text-sm">📍 Selecciona un punto en el mapa para simular el impacto.</p>

            {userPoint && (
              <><UserImpactSimulator
                asteroid={selected}
                lat={userPoint.lat}
                lon={userPoint.lon}
                onSimulate={setRings}
              />
              
              </>
              
            )}
          
          </div>
        ) : impactData ? (
          <ImpactSimulator intersection={impactData} diameter_m={diameter_m} />
        ) : (
          <div className="p-3 bg-white rounded shadow text-sm text-gray-600">
            Este asteroide no presenta impacto con la Tierra en la simulación.
          </div>
        )}
{/* Botones para alternar <Storytelling />
        <MitigationStrategies orbitEl={orbitEl} onApply={(o) => setOrbitEl(o)} />*/}
        <>
        <MitigationStrategies orbitEl={orbitEl} onApply={(o) => setOrbitEl(o)} />
        <DataVisualizer series={[{ t: 0, v: diameter_m }]} />
        </>
      </div>
    </div>
  );

}



