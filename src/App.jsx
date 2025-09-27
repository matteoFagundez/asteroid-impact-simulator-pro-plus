
// src/App.jsx
import React, { useEffect, useMemo, useState } from 'react';
import TimeController from './components/TimeController.jsx';
import OrbitalViewer3D from './components/OrbitalViewer3D.jsx';
import EarthImpactView from './components/EarthImpactView.jsx';
import ImpactSimulator from './components/ImpactSimulator.jsx';
import MitigationStrategies from './components/MitigationStrategies.jsx';
import DataVisualizer from './components/DataVisualizer.jsx';
import Storytelling from './components/Storytelling.jsx';

import { fetchAsteroids, fetchOrbitElements } from './services/nasa.js';
import { keplerToState, earthStateApprox, computeEntryAngle,  findEarthIntersection, eciToLatLon } from './lib/orbital.js';
import { impactMetrics, impactRadii } from './lib/impactPhysics.js';
import { findNodeImpactCandidate } from './lib/nodeImpact.js';


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

  /*
  // 3) Recalcula impacto
  useEffect(() => {
    if (!orbitEl || !selected) { setImpactData(null); return; }

    const intersection = findEarthIntersection(orbitEl, dateJD, dateJD + 10, 600);

    if (!intersection) {
      setImpactData(null); // no hay impacto
      return;
    }

    // Convertir ECI → lat/lon
    const { lat_deg, lon_deg } = eciToLatLon(intersection.t_jd, intersection.posECI);

    const angle_deg = intersection.angle_deg || 45;

    const metrics = impactMetrics({
      diameter_m: selected.diameter_m,
      velocity_ms: selected.velocity_ms,
      angle_deg
    });

    const radii = impactRadii({
      diameter_m: selected.diameter_m,
      angle_deg
    });

    setImpactData({
      lat: lat_deg,
      lon: lon_deg,
      t_jd: intersection.t_jd,
      angle_deg,
      velocity_ms: selected.velocity_ms,
      metrics,
      radii
    });
  }, [orbitEl, dateJD, selected]);
*/
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

  return (
    <div className="grid grid-cols-3 h-screen">
      <div className="col-span-2 p-3 flex flex-col gap-3">
        <div className="p-3 bg-white rounded shadow">
          <div className="flex gap-2 items-center">
            <label className="text-sm">Asteroide:</label>
            <select onChange={e => handleSelectAsteroid(e.target.value)}>
              {asteroids.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <div className="ml-4 text-sm text-gray-600">
              i={orbitEl?.i_deg?.toFixed?.(2)}°, e={orbitEl?.e?.toFixed?.(3)} | a={orbitEl?.a_AU} AU
            </div>
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm">Earth view</label>
              <input type="checkbox" checked={useEarthView} onChange={e=>setUseEarthView(e.target.checked)} />
            </div>
          </div>
        </div>

        <TimeController
          timeScale={scale}
          onChangeScale={setScale}
          date={"2025-09-27T12:00"}
          onChangeDate={()=>{}}
        />

        {useEarthView ? (
          <EarthImpactView impact={impactData} />
        ) : (
          <OrbitalViewer3D samplesAsteroid={samplesAsteroid} samplesEarth={samplesEarth} />
        )}
      </div>

      <div className="col-span-1 p-3 space-y-3 bg-gray-50 border-l">
        {impactData ? (
          <ImpactSimulator
            intersection={{
              t_jd: impactData.t_jd,
              angle_deg: impactData.angle_deg,
              speed_ms: impactData.velocity_ms,
              metrics: impactData.metrics,
              radii: impactData.radii,
              date_str: jdToDate(impactData.t_jd) // mostrar fecha estimada
            }}
            diameter_m={diameter_m}
          />
        ) : (
          <div className="p-3 bg-white rounded shadow text-sm text-gray-600">
            Este asteroide no presenta impacto con la Tierra en la simulación.
          </div>
        )}

        <MitigationStrategies orbitEl={orbitEl} onApply={handleApplyMitigation} />

        <DataVisualizer series={[
          {t:0,v:diameter_m},
          {t:1,v:diameter_m*(impactData? 1.0:1.0)},
          {t:2,v:diameter_m*(impactData? 1.1:1.0)},
        ]} />

        <Storytelling />
      </div>
    </div>
  );
}



