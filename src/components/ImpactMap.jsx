// src/components/ImpactMap.jsx
import React, { useEffect, useRef } from "react";
import {
  Viewer,
  Cartesian3,
  Color,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartographic,
  Math as CesiumMath,
  ConstantProperty
} from "cesium";

export default function ImpactMap({ onSelect, impactRings }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
    useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !onSelect) return;

    /*
    // Limpia entidades previas cuando no hay rings
    if (!impactRings) {
        viewer.entities.removeAll();
    }*/

    }, [impactRings]);
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

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click) => {
      const pos = viewer.camera.pickEllipsoid(click.position);
      if (pos) {
        const carto = Cartographic.fromCartesian(pos);
        const lat = CesiumMath.toDegrees(carto.latitude);
        const lon = CesiumMath.toDegrees(carto.longitude);

        if (onSelect) onSelect({ lat, lon });
        // 👉 Dibuja un punto en la posición seleccionada
        viewer.entities.removeAll();
        viewer.entities.add({
        position: Cartesian3.fromDegrees(lon, lat),
        point: {
            pixelSize: 10,
            color: Color.YELLOW,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
        },
        });
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
  }, [onSelect]);
useEffect(() => {
  const viewer = viewerRef.current;
  if (!viewer || !impactRings) return;

  viewer.entities.removeAll();

  const { lat, lon, radii } = impactRings || {};
if (!lat || !lon || !radii) return;

const { severe, moderate, light } = radii;


  // Validar que los radios sean números válidos
  const safe = (val) => (Number.isFinite(val) && val > 0 ? val : null);

  const rings = [
    { r: safe(severe), color: "#dc2626" },
    { r: safe(moderate), color: "#ea580c" },
    { r: safe(light), color: "#ca8a04" },
  ];

  // marcador central
  viewer.entities.add({
    position: Cartesian3.fromDegrees(lon, lat),
    point: {
      pixelSize: 10,
      color: Color.RED,
      outlineColor: Color.WHITE,
      outlineWidth: 2,
    },
  });

  rings.forEach(({ r, color }) => {
    if (!r) return; // 🚨 evitar undefined
    viewer.entities.add({
      position: Cartesian3.fromDegrees(lon, lat),
      ellipse: {
        semiMajorAxis: r,
        semiMinorAxis: r,
        material: Color.fromCssColorString(color).withAlpha(0.25),
        outline: true,
        outlineColor: Color.fromCssColorString(color),
        height: 0,
      },
    });
  });

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(lon, lat, 200000),
  });
}, [impactRings]);


  return <div ref={containerRef} className="h-96 w-full rounded overflow-hidden" />;
}
