
// src/services/nasa.js
/*import axios from "axios";

export async function fetchAsteroids(apiKey) {
  try {
    const url = `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=0F0V1Q57AyIuiOhu51CJXBF3unSZ80Dk5NP7KHoj&page=0&size=20`;
    const res = await axios.get(url);

    const list = res.data.near_earth_objects.map(n => {
      // diámetro promedio en metros
      const minDiam = n.estimated_diameter?.meters?.estimated_diameter_min || 50;
      const maxDiam = n.estimated_diameter?.meters?.estimated_diameter_max || 60;
      const diameter_m = Math.round((minDiam + maxDiam) / 2);

      // velocidad relativa (primer acercamiento disponible)
      const vel_kms = n.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second
        ? parseFloat(n.close_approach_data[0].relative_velocity.kilometers_per_second)
        : 20;
      const velocity_ms = vel_kms * 1000;

      return {
        id: n.id,
        name: n.name,
        // Orbital elements simplificados (se pueden extender con n.orbital_data si querés más precisión)
        a_AU: parseFloat(n.orbital_data?.semi_major_axis) || 1.0,
        e: parseFloat(n.orbital_data?.eccentricity) || 0.1,
        i_deg: parseFloat(n.orbital_data?.inclination) || 5,
        omega_deg: parseFloat(n.orbital_data?.ascending_node_longitude) || 80,
        w_deg: parseFloat(n.orbital_data?.perihelion_argument) || 120,
        M0_deg: parseFloat(n.orbital_data?.mean_anomaly) || 0,
        epoch_jd: parseFloat(n.orbital_data?.epoch_jd) || 2460000.5,
        diameter_m,     // metros
        vel_kms,        // km/s (para UI)
        velocity_ms     // m/s (para cálculos)
      };
    });

    return list;
  } catch (e) {
    console.error("NASA fetch failed:", e?.message);
    return [];
  }
}
*/

// src/services/nasa.js
import axios from "axios";

export async function fetchAsteroids(apiKey) {
  try {
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];
    const endDate = new Date(today.getTime() + 7 * 86400000)
      .toISOString()
      .split("T")[0];

    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=0F0V1Q57AyIuiOhu51CJXBF3unSZ80Dk5NP7KHoj`;
    const res = await axios.get(url);

    const candidates = [];

    Object.values(res.data.near_earth_objects).forEach((arr) => {
      arr.forEach((n) => {
        const ca = n.close_approach_data.find((c) => c.orbiting_body === "Earth");
        if (!ca) return;

        candidates.push({
          id: n.id,
          name: n.name,
          diameter_m: Math.round(
            ((n.estimated_diameter?.meters?.estimated_diameter_min || 50) +
              (n.estimated_diameter?.meters?.estimated_diameter_max || 60)) / 2
          ),
          velocity_ms: ca.relative_velocity?.kilometers_per_second
            ? Number(ca.relative_velocity.kilometers_per_second) * 1000
            : 20000,
          miss_distance_km: Number(ca.miss_distance.kilometers),
          approach_date: ca.close_approach_date_full,
          // orbital elements todavía no → se completan luego
        });
      });
    });

    return candidates;
  } catch (e) {
    console.error("NASA fetch failed:", e?.message);
    return [];
  }
}

/**
 * Cargar elementos orbitales completos desde la SBDB API
 */
export async function fetchOrbitElements(asteroidId) {
  try {
    const url = `https://corsproxy.io/?https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${asteroidId}&phys-par=0`;
    const res = await axios.get(url);

    const orbit = res.data.orbit;

    // Extraer elementos orbitales
    const el = orbit.elements.reduce((acc, e) => {
      acc[e.name] = parseFloat(e.value);
      return acc;
    }, {});

    // Epoch viene separado, normalmente en Julian Date (JD)
    let epoch_jd = undefined;
    if (orbit.epoch && orbit.epoch.value) {
      epoch_jd = parseFloat(orbit.epoch.value);
    }else{
      epoch_jd = 2459396.5;
    }

    return {
      a_AU: el.a,
      e: el.e,
      i_deg: el.i,
      omega_deg: el.om,
      w_deg: el.w,
      M0_deg: el.ma,
      epoch_jd
    };
  } catch (e) {
    console.error("SBDB fetch failed:", e?.message);
    return null;
  }
}

