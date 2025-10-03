// Redesigned MitigationStrategies.jsx
import React, { useState } from "react";
import {
  applyKineticImpactor,
  applyGravityTractor,
  applyNuclearStandoff,
} from "../lib/mitigation.js";

export default function MitigationStrategies({ orbitEl, onApply }) {
  const [dV, setDV] = useState(5);
  const [days, setDays] = useState(90);
  const [accel, setAccel] = useState(0.1);
  const [efficiency, setEfficiency] = useState(0.5);

  return (
    <div className="bg-[#10141a] text-white rounded-xl p-4 shadow-inner">
      <h3 className="text-teal-400 font-bold text-md mb-3 tracking-wide">
        MITIGATION
      </h3>

      {/* KINETIC */}
      <div className="mb-4">
        <button
          onClick={() => onApply(applyKineticImpactor(orbitEl, dV))}
          className="flex items-center justify-between w-full border border-blue-500 text-blue-400 px-3 py-2 rounded-md hover:bg-blue-600/20"
        >
          <span className="flex items-center gap-2">
            <img src="/assets/icons/Impact.png" alt="Impacto Cinético" className="w-12 h-12 mr-2 rounded shadow-md" />
            KINETIC IMPACT
          </span>
        </button>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={dV}
          onChange={(e) => setDV(parseFloat(e.target.value))}
          className="w-full accent-blue-500 mt-2"
        />
        <div className="text-xs text-right text-blue-300">Δv = {dV} m/s</div>
      </div>

      {/* GRAVITY */}
      <div className="mb-4">
        <button
          onClick={() => onApply(applyGravityTractor(orbitEl, days, accel))}
          className="flex items-center justify-between w-full border border-yellow-500 text-yellow-400 px-3 py-2 rounded-md hover:bg-yellow-600/20"
        >
          <span className="flex items-center gap-2">
             <img src="/assets/icons/Gravity.png" alt="Impacto Cinético" className="w-12 h-12 mr-2 rounded shadow-md" />
            GRAVITY TRACTOR
          </span>
        </button>
        <div className="flex gap-2 mt-2">
          <input
            type="range"
            min="0"
            max="365"
            step="1"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="w-full accent-yellow-500"
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={accel}
            onChange={(e) => setAccel(parseFloat(e.target.value))}
            className="w-full accent-yellow-500"
          />
        </div>
        <div className="text-xs text-yellow-300 mt-1">
          {days} days / {accel.toFixed(2)} mm/s²
        </div>
      </div>

      {/* NUCLEAR */}
      <div>
        <button
          onClick={() => onApply(applyNuclearStandoff(orbitEl, efficiency))}
          className="flex items-center justify-between w-full border border-rose-600 text-red-400 px-3 py-2 rounded-md hover:bg-red-600/20"
        >
          <span className="flex items-center gap-2">
             <img src="/assets/icons/Nuclear.png" alt="Impacto Cinético" className="w-12 h-12 mr-2 rounded shadow-md" />
            NUCLEAR EXPLOSION
          </span>
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={efficiency}
          onChange={(e) => setEfficiency(parseFloat(e.target.value))}
          className="w-full accent-red-500 mt-2"
        />
        <div className="text-xs text-red-300">Efficiency = {efficiency}</div>
      </div>
    </div>
  );
}