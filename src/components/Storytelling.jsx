import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const steps = [
  { title: 'Orbita', text: 'Visualiza la orbita heliocentrica y los parametros (a, e, i).' },
  { title: 'Encuentro', text: 'Selecciona la ventana de encuentro cercano con la Tierra.' },
  { title: 'Impacto', text: 'Calculamos angulo de entrada, energia y crater.' },
  { title: 'Mitigacion', text: 'Aplica Delta-v, tractor gravitatorio o nuclear y repropaga.' },
  { title: 'Resultados', text: 'Compara escenarios y genera visualizaciones para el publico.' }
]

export default function Storytelling(){
  const [idx, setIdx] = useState(0)
  const next = ()=> setIdx(i => Math.min(i+1, steps.length-1))
  const prev = ()=> setIdx(i => Math.max(i-1, 0))
  const s = steps[idx]
  return (
    <div className="p-3 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Storytelling</h3>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="text-sm"
        >
          <div className="font-bold">{s.title}</div>
          <div>{s.text}</div>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-2 mt-2">
        <button onClick={prev} className="px-2 py-1 bg-gray-200 rounded">Prev</button>
        <button onClick={next} className="px-2 py-1 bg-gray-800 text-white rounded">Next</button>
      </div>
    </div>
  )
}