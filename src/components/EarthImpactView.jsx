
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


