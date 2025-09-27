// src/components/EarthImpactView.jsx
/*import React, { useEffect, useRef } from "react";
import { Viewer, Cartesian3, Color, CallbackProperty } from "cesium";

export default function EarthImpactView({ impact }) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const viewer = new Viewer(container, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      sceneModePicker: false,
    });

    if (impact?.lat != null && impact?.lon != null) {
      // Cámara centrada
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(impact.lon, impact.lat, 200000),
      });

      // Radios base (en metros, con mínimos visibles)
      const rSev = Math.max(50000, impact.radii?.severe || 50000);
      const rMod = Math.max(rSev + 50000, impact.radii?.moderate || 150000);
      const rLig = Math.max(rMod + 50000, impact.radii?.light || 500000);

      const start = Date.now();

      // Generador único de radio dinámico
      const grow = (targetMeters, delayMs = 0, growMs = 3000) => {
        const start = performance.now() + delayMs;

        return new CallbackProperty(() => {
          const elapsed = performance.now() - start;
          if (elapsed < 0) return 1; // antes del inicio, radio mínimo

          const progress = Math.min(elapsed / growMs, 1); // clamp 0–1
          const r = targetMeters * progress;

          return Number.isFinite(r) && r > 0 ? r : 1;
        }, false);
      };
        
      const addRing = (viewer, impact, color, targetMeters, delayMs = 0) => {
  const safeMeters = Math.max(1, Number(targetMeters)); // asegurar positivo y > 0
  const radius = grow(safeMeters, delayMs, 3000);

  viewer.entities.add({
    position: Cartesian3.fromDegrees(impact.lon, impact.lat),
    ellipse: {
      semiMajorAxis: radius,
      semiMinorAxis: radius, // 👈 mismo callback, círculo perfecto
      material: Color.fromCssColorString(color).withAlpha(0.25),
      outline: true,
      outlineColor: Color.fromCssColorString(color),
      height: 0,
    },
  });
};



     addRing(viewer, impact, "#dc2626", impact.radii.severe, 0);     // rojo
addRing(viewer, impact, "#ea580c", impact.radii.moderate, 500); // naranja
addRing(viewer, impact, "#ca8a04", impact.radii.light, 1000);   // amarillo
console.log("Severe:", impact.radii.severe, "m");
console.log("Moderate:", impact.radii.moderate, "m");
console.log("Light:", impact.radii.light, "m");




      /*const addRing = (color, target, delayMs) => {
        const radius = grow(target, delayMs);
        viewer.entities.add({
          position: Cartesian3.fromDegrees(impact.lon, impact.lat),
          ellipse: {
            semiMajorAxis: radius,
            semiMinorAxis: new CallbackProperty(() => {
              const val = radius.getValue();
              return val * 0.99; // siempre un poquito menor
            }, false),
            material: Color.fromCssColorString(color).withAlpha(0.25),
            outline: true,
            outlineColor: Color.fromCssColorString(color),
          },
        });
      };

      // Secuencia escalonada
      addRing("#dc2626", rSev, 0);     // severo
      addRing("#ea580c", rMod, 2000);  // moderado
      addRing("#ca8a04", rLig, 4000);  // leve
   }

    return () => viewer.destroy();
  }, [impact?.lat, impact?.lon, impact?.radii]);

  return <div ref={ref} className="h-96 w-full rounded overflow-hidden" />;
}*/
/*
// src/components/EarthImpactView.jsx
import React, { useEffect, useRef } from "react";
import { Viewer, Cartesian3, Color, CallbackProperty } from "cesium";

export default function EarthImpactView({ impact }) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Crea viewer una vez por render del componente
    const viewer = new Viewer(container, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      sceneModePicker: false,
    });

    // Limpieza al desmontar/actualizar
    const disposers = [];
    const addDisposer = (fn) => disposers.push(fn);

    const destroy = () => {
      try { disposers.forEach((fn) => fn && fn()); } catch {}
      try { viewer && !viewer.isDestroyed() && viewer.destroy(); } catch {}
    };

    // Si no hay datos válidos, salir
    if (
      !impact ||
      !Number.isFinite(impact.lat) ||
      !Number.isFinite(impact.lon) ||
      !impact.radii
    ) {
      addDisposer(destroy);
      return () => destroy();
    }

    // Cámara
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(impact.lon, impact.lat, 220000),
    });

    // Helper para asegurar metros válidos
    const safeMeters = (m, fallback) => {
      const v = Number(m);
      if (!Number.isFinite(v) || v <= 0) return fallback;
      // Clamp por seguridad (2,000 km máx)
      return Math.max(100, Math.min(v, 2_000_000));
    };

    // Toma radios en METROS (asegúrate que impact.radii.* estén en m)
    const Rsevere  = safeMeters(impact.radii.severe, 50_000);
    const Rmoderate= safeMeters(impact.radii.moderate, 150_000);
    const Rlight   = safeMeters(impact.radii.light, 500_000);

    // Crea un anillo con animación 100% robusta (un solo valor por frame)
    const addRing = (colorHex, targetMeters, delayMs = 0, growMs = 3000) => {
      // Estado de animación compartido por ambos ejes
      const state = {
        start: performance.now() + delayMs,
        duration: Math.max(1, growMs),
        target: safeMeters(targetMeters, 10_000),
        current: 10,  // radio inicial seguro (>0)
        done: false,
      };

      const radiusProp = new CallbackProperty(() => {
        const r = state.current;
        return Number.isFinite(r) && r > 0 ? r : 10;
      }, false);

      const entity = viewer.entities.add({
        position: Cartesian3.fromDegrees(impact.lon, impact.lat),
        ellipse: {
          semiMajorAxis: radiusProp,
          semiMinorAxis: radiusProp, // mismo CallbackProperty → mismo valor
          material: Color.fromCssColorString(colorHex).withAlpha(0.25),
          outline: true,
          outlineColor: Color.fromCssColorString(colorHex),
          height: 0,
        },
      });

      // Actualizamos el radio UNA VEZ por frame antes del render
      const onTick = () => {
        if (state.done) return;
        const now = performance.now();
        const elapsed = now - state.start;

        if (elapsed <= 0) {
          state.current = 10; // antes del delay, mínimo seguro
          return;
        }
        const p = Math.min(elapsed / state.duration, 1);
        const r = state.target * p;

        state.current = Number.isFinite(r) && r > 0 ? r : 10;

        if (p >= 1) {
          state.done = true;
          viewer.clock.onTick.removeEventListener(onTick);
        }
      };

      viewer.clock.onTick.addEventListener(onTick);
      addDisposer(() => viewer.clock.onTick.removeEventListener(onTick));
      addDisposer(() => viewer.entities.remove(entity));
    };

    // Dibuja los 3 anillos (en metros, sin divisiones a km)
    addRing("#dc2626", Rsevere,   0,    1200); // severo
    addRing("#ea580c", Rmoderate, 400,  1500); // moderado
    addRing("#ca8a04", Rlight,    800,  1800); // leve

    addDisposer(destroy);
    return () => destroy();
  }, [impact?.lat, impact?.lon, impact?.radii?.severe, impact?.radii?.moderate, impact?.radii?.light]);

  return <div ref={ref} className="h-96 w-full rounded overflow-hidden" />;
}*/

// src/components/EarthImpactView.jsx
// src/components/EarthImpactView.jsx
import React, { useEffect, useRef } from "react";
import { Viewer, Cartesian3, Color, ConstantProperty } from "cesium";

export default function EarthImpactView({ impact }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const disposersRef = useRef([]);

  // Crear viewer una sola vez
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const viewer = new Viewer(el, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      sceneModePicker: false,
    });
    viewerRef.current = viewer;

    return () => {
      // cleanup total
      try { disposersRef.current.forEach(fn => fn && fn()); } catch {}
      disposersRef.current = [];
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  // Dibujar anillos cada vez que cambia el impacto
  useEffect(() => {
    const viewer = viewerRef.current;
    // limpiar anillos previos
    try { disposersRef.current.forEach(fn => fn && fn()); } catch {}
    disposersRef.current = [];

    if (
      !viewer ||
      !impact ||
      !Number.isFinite(impact.lat) ||
      !Number.isFinite(impact.lon) ||
      !impact.radii
    ) return;

    // Centrar cámara
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(impact.lon, impact.lat, 120000),
    });

    // Radios seguros (METROS)
    const safeMeters = (m, fallback) => {
      const v = Number(m);
      if (!Number.isFinite(v) || v <= 0) return fallback;
      return Math.max(100, Math.min(v, 2_000_000)); // 100 m .. 2000 km
    };

    const Rsevere   = safeMeters(impact.radii.severe,   50_000);
    const Rmoderate = safeMeters(impact.radii.moderate, 150_000);
    const Rlight    = safeMeters(impact.radii.light,    500_000);

    // Helper: único valor por frame, mismo para ambos ejes
    const addRing = (hex, targetMeters, delayMs = 0, growMs = 1500) => {
      const start = performance.now() + delayMs;
      const duration = Math.max(1, growMs);
      const target = safeMeters(targetMeters, 10_000);

      // Inicializamos como ConstantProperty para poder setear .setValue() en cada tick
      const semiMajor = new ConstantProperty(10);
      const semiMinor = new ConstantProperty(10);

      const entity = viewer.entities.add({
        position: Cartesian3.fromDegrees(impact.lon, impact.lat),
        ellipse: {
          semiMajorAxis: semiMajor,
          semiMinorAxis: semiMinor, // mismo valor → círculo perfecto
          material: Color.fromCssColorString(hex).withAlpha(0.25),
          outline: true,
          outlineColor: Color.fromCssColorString(hex),
          height: 0,
        },
      });

      const onTick = () => {
        const pnow = performance.now();
        const elapsed = pnow - start;
        if (elapsed <= 0) {
          semiMajor.setValue(10);
          semiMinor.setValue(10);
          return;
        }
        const t = Math.min(elapsed / duration, 1);
        const r = 10 + (target - 10) * t;
        const val = Number.isFinite(r) && r > 0 ? r : 10;
        // Un MISMO valor numérico para ambos ejes en este frame
        semiMajor.setValue(val);
        semiMinor.setValue(val);

        if (t >= 1) {
          viewer.clock.onTick.removeEventListener(onTick);
        }
      };

      viewer.clock.onTick.addEventListener(onTick);

      // Disposers para limpiar en siguientes renders o al desmontar
      disposersRef.current.push(() => viewer.clock.onTick.removeEventListener(onTick));
      disposersRef.current.push(() => viewer.entities.remove(entity));
    };

    // Anillos (usar SIEMPRE metros)
    addRing("#dc2626", Rsevere,   0,    1200); // severo
    addRing("#ea580c", Rmoderate, 400,  1500); // moderado
    addRing("#ca8a04", Rlight,    800,  1800); // leve
  }, [impact]);

  return <div ref={containerRef} className="h-96 w-full rounded overflow-hidden" />;
}


