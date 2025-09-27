// src/lib/orbital.js
const MU_SUN = 1.32712440018e20; // m^3/s^2
const AU = 1.495978707e11; // m
const RE = 6371e3; // Earth radius (spherical approx)
const DEG = Math.PI/180;

// --- NUEVO: utilidades de tiempo sideral / rotación terrestre ---
const OMEGA_E = 7.2921159e-5; // rad/s

function jdToGMST(jd) {
  // IAU 1982 approx (suficiente para visualización)
  const T = (jd - 2451545.0) / 36525.0;
  let gmst = 67310.54841 +
             (876600.0 * 3600 + 8640184.812866) * T +
             0.093104 * T * T -
             6.2e-6 * T * T * T;
  gmst = ((gmst % 86400) + 86400) % 86400;
  return (gmst / 86400) * 2 * Math.PI; // rad
}

export function eciToLatLon(jd, r_eci) {
  // 1) ECI -> ECEF (rotación por GMST)
  const theta = jdToGMST(jd);
  const cosT = Math.cos(theta), sinT = Math.sin(theta);
  const x =  cosT * r_eci[0] + sinT * r_eci[1];
  const y = -sinT * r_eci[0] + cosT * r_eci[1];
  const z =  r_eci[2];
  // 2) ECEF -> geodésicas (esfera simple)
  const lon = Math.atan2(y, x);               // rad
  const hyp = Math.hypot(x, y);
  const lat = Math.atan2(z, hyp);             // rad
  return { lat_deg: Number.isFinite(lat*180/Math.PI) ? (lat*180/Math.PI) : 0,
  lon_deg: Number.isFinite(lon*180/Math.PI) ? (lon*180/Math.PI) : 0 };
}

// --- Kepler propagator ---
export function keplerToState({ a_AU, e, i_deg, omega_deg, w_deg, M0_deg, epoch_jd }, t_jd){
  const a = a_AU * AU;
  const i = i_deg * DEG;
  const Omega = omega_deg * DEG;
  const w = w_deg * DEG;
  const M0 = M0_deg * DEG;
  const day = 86400;
  const dt = (t_jd - epoch_jd) * day;
  const n = Math.sqrt(MU_SUN / Math.pow(a,3));
  const M = M0 + n * dt;
  let E = M;
  for(let k=0;k<12;k++){ E = M + e*Math.sin(E); }
  const cosE = Math.cos(E), sinE = Math.sin(E);
  const sqrt1me2 = Math.sqrt(1-e*e);
  const nu = Math.atan2( sqrt1me2*sinE, cosE - e );
  const r = a*(1 - e*cosE);
  const x_pf = r*Math.cos(nu);
  const y_pf = r*Math.sin(nu);
  const z_pf = 0;
  const cO=Math.cos(Omega), sO=Math.sin(Omega);
  const ci=Math.cos(i), si=Math.sin(i);
  const cw=Math.cos(w), sw=Math.sin(w);
  const R11=cO*cw - sO*sw*ci; const R12=-cO*sw - sO*cw*ci; const R13=sO*si;
  const R21=sO*cw + cO*sw*ci; const R22=-sO*sw + cO*cw*ci; const R23=-cO*si;
  const R31=sw*si;            const R32=cw*si;             const R33=ci;
  const x = R11*x_pf + R12*y_pf + R13*z_pf;
  const y = R21*x_pf + R22*y_pf + R23*z_pf;
  const z = R31*x_pf + R32*y_pf + R33*z_pf;
  return { r_eci: [x,y,z], nu, r };
}

export function earthStateApprox(t_jd){
  const a_AU = 1, e = 0.0167, i_deg=0, omega_deg=0, w_deg=102.9, M0_deg=0, epoch_jd = 2451545.0;
  return keplerToState({ a_AU, e, i_deg, omega_deg, w_deg, M0_deg, epoch_jd }, t_jd);
}

export function finiteVelocity(el, t_jd, dt_s=60){
  const day=86400;
  const s1 = keplerToState(el, t_jd - dt_s/day);
  const s2 = keplerToState(el, t_jd + dt_s/day);
  return [(s2.r_eci[0]-s1.r_eci[0])/(2*dt_s), (s2.r_eci[1]-s1.r_eci[1])/(2*dt_s), (s2.r_eci[2]-s1.r_eci[2])/(2*dt_s)];
}

export function entryAngleFromGeometry(v_vec, normal_vec){
  const dot = v_vec[0]*normal_vec[0]+v_vec[1]*normal_vec[1]+v_vec[2]*normal_vec[2];
  const nv = Math.hypot(...v_vec);
  const nn = Math.hypot(...normal_vec);
  const cosTheta = dot/(nv*nn);
  const theta = Math.acos(Math.max(-1,Math.min(1,cosTheta)));
  const angleFromHorizontal = (Math.PI/2 - theta) * 180/Math.PI;
  return Math.max(5, Math.min(90, angleFromHorizontal));
}

export function findEarthIntersection(asteroidEl, tStart_jd, tEnd_jd, step_s=600){
  const day=86400;
  let t = tStart_jd;
  while(t <= tEnd_jd){
    const ast = keplerToState(asteroidEl, t);
    const ear = earthStateApprox(t);
    const dx = ast.r_eci[0]-ear.r_eci[0];
    const dy = ast.r_eci[1]-ear.r_eci[1];
    const dz = ast.r_eci[2]-ear.r_eci[2];
    const d = Math.hypot(dx,dy,dz);
    if(d < RE){
      const v = finiteVelocity(asteroidEl, t);
      const n = [dx/d, dy/d, dz/d];
      const angle = entryAngleFromGeometry(v, n);
      return { t_jd: t, posECI: [dx,dy,dz], angle_deg: angle, speed_ms: Math.hypot(...v) };
    }
    t += step_s/day;
  }
  return null;
}
export function computeEntryAngle(r_eci, v_eci) {
  const rmag = Math.hypot(...r_eci);
  if (rmag === 0) return 45; // fallback
  
  const n = r_eci.map(c => c / rmag); // normalizada
  const vmag = Math.hypot(...v_eci);
  if (vmag === 0) return 45;

  const dot = v_eci[0]*n[0] + v_eci[1]*n[1] + v_eci[2]*n[2];
  const cosTheta = dot / vmag;

  // ángulo con la vertical
  const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta)));

  // Convertimos a ángulo desde el horizonte
  return 90 - (theta * 180 / Math.PI);
}

export async function findEarthIntersectionRange(orbitEl, center_jd, span_days = 365, step_s = 600) {
  // intentamos barrer desde center_jd - span_days a center_jd + span_days
  const day = 86400;
  const start = center_jd - span_days;
  const end = center_jd + span_days;
  let t = start;
  while (t <= end) {
    const hit = findEarthIntersection(orbitEl, t, t + (step_s / day) * 10, step_s);
    if (hit) return hit;
    // avanzamos por bloques de, por ejemplo, 1 día (puedes ajustar)
    t += 1;
  }
  return null;
}
