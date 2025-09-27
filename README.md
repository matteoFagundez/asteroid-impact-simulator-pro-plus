# Asteroid Impact Simulator — Pro Plus

Avanzado con mecánica orbital (Kepler 2-body), orrery 3D, globo Cesium, mitigación interactiva y storytelling.

## Requisitos
- Node 18+
- (Opcional) `.env` con `VITE_NASA_API_KEY`

## Instalar y correr
```bash
npm install
npm run dev
```
Abrir http://localhost:5173

## Componentes clave
- `lib/orbital.js`: propagación, velocidad, intersección Tierra, ángulo de entrada.
- `lib/impactPhysics.js`: energía, Mw, diámetro de cráter.
- `lib/mitigation.js`: Δv (cinético), tractor gravitatorio, nuclear (Δv equivalente).
- `components/OrbitalViewer3D.jsx`: órbitas heliocéntricas en Three.js.
- `components/EarthImpactView.jsx`: globo Cesium con onda sísmica animada (lat/lon demo).
- `components/TimeController.jsx`: velocidad (1x/10x/100x) y fecha/hora.
- `components/ImpactSimulator.jsx`: calcula métricas cuando hay intersección.
- `components/MitigationStrategies.jsx`: aplica estrategias y repropaga.
- `components/Storytelling.jsx`: modo guiado (Framer Motion).

## Notas
- Cesium está habilitado mediante `vite-plugin-cesium` y se importa su CSS en `main.jsx`.
- La lat/lon de impacto en `EarthImpactView` es de ejemplo (Buenos Aires). Para convertir ECI->lat/lon, añade un paso geocéntrico con rotación de la Tierra (WGS84) y tiempo sidéreo.
- La intersección Tierra es aproximada (demo); para precisión, usa SBDB + SGP4/DE y marco geocéntrico adecuado.
