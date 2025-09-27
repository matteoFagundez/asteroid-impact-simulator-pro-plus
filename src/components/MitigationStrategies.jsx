// src/components/MitigationStrategies.jsx
import React, { useState } from 'react';
import { applyKineticImpactor, applyGravityTractor, applyNuclearStandoff } from '../lib/mitigation.js';

export default function MitigationStrategies({ orbitEl, onApply }) {
  const [dV, setDV] = useState(5);
  const [days, setDays] = useState(90);
  const [accel, setAccel] = useState(0.1);

  return (
    <div className="p-3 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Mitigación</h3>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block">Impacto cinético Δv (m/s):</label>
          <div className="flex gap-2">
            <input type="number" value={dV} onChange={e=>setDV(Number(e.target.value))} className="border p-1 rounded w-full"/>
            <button
              className="px-2 py-1 bg-blue-600 text-white rounded"
              onClick={()=> onApply(applyKineticImpactor(orbitEl, dV))}>
              Aplicar
            </button>
          </div>
        </div>
        <div>
          <label className="block">Tractor gravitatorio (días / mm·s⁻²):</label>
          <div className="flex gap-2">
            <input type="number" value={days} onChange={e=>setDays(Number(e.target.value))} className="border p-1 rounded w-1/2"/>
            <input type="number" value={accel} onChange={e=>setAccel(Number(e.target.value))} className="border p-1 rounded w-1/2"/>
          </div>
          <button
            className="mt-1 px-2 py-1 bg-purple-600 text-white rounded"
            onClick={()=> onApply(applyGravityTractor(orbitEl, days, accel))}>
            Aplicar
          </button>
        </div>
        <div>
          <label className="block">Explosión nuclear (standoff, demo):</label>
          <button
            className="mt-1 px-2 py-1 bg-rose-600 text-white rounded"
            onClick={()=> onApply(applyNuclearStandoff(orbitEl, 0.5))}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
