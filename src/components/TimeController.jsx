import React from 'react'

export default function TimeController({ timeScale=1, onChangeScale, date, onChangeDate }){
  return (
    <div className="p-3 bg-white rounded shadow mb-3">
      <h3 className="font-semibold mb-2">Tiempo de simulacion</h3>
      <div className="flex items-center gap-2">
        <label>Velocidad:</label>
        <select value={timeScale} onChange={e=>onChangeScale(Number(e.target.value))} className="border p-1 rounded">
          <option value={1}>1x</option>
          <option value={10}>10x</option>
          <option value={100}>100x</option>
        </select>
      </div>
      <div className="mt-2">
        <label className="block">Fecha/hora:</label>
        <input type="datetime-local" value={date} onChange={e=>onChangeDate(e.target.value)} className="border p-1 rounded w-full" />
      </div>
    </div>
  )
}