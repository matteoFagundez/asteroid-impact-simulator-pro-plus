import { keplerToState, finiteVelocity, eciToLatLon } from "./orbital.js";

export function findNodeImpactCandidate(orbitEl, center_jd) {
  if (!orbitEl?.a_AU) {
    console.warn("❌ OrbitEl no tiene semieje mayor (a_AU)");
    return null;
  }

  // Orbital period en días
  const P = Math.pow(orbitEl.a_AU, 1.5) * 365.25;
  const start = center_jd;
  const end = center_jd + P;
  const stepDays = 1;

  let prev = keplerToState(orbitEl, start);
  let prevSign = Math.sign(prev.r_eci[2]);

  for (let jd = start + stepDays; jd <= end; jd += stepDays) {
    const cur = keplerToState(orbitEl, jd);
    const curSign = Math.sign(cur.r_eci[2]);

    if (curSign !== prevSign && curSign !== 0) {
      const { lat_deg, lon_deg } = eciToLatLon(jd, cur.r_eci);

      // ⚡ Calculamos velocidad con diferencias finitas
      const v = finiteVelocity(orbitEl, jd);

      const r = cur.r_eci;
      const rmag = Math.hypot(...r);
      const vmag = Math.hypot(...v);
      const rhat = r.map((ri) => ri / rmag);
      const vdotrhat = v[0]*rhat[0] + v[1]*rhat[1] + v[2]*rhat[2];
      let angle_deg = Math.asin(-vdotrhat / (vmag || 1e-9)) * 180 / Math.PI;

      return {
        t_jd: jd,
        lat_deg,
        lon_deg,
        angle_deg: isNaN(angle_deg) ? 45 : angle_deg,
        speed_ms: vmag,
        posECI: r,
        velECI: v
      };
    }

    prev = cur;
    prevSign = curSign;
  }

  console.warn("⚠️ No se encontró nodo en un periodo orbital");
  return null;
}
