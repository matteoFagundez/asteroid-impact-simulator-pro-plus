import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function OrbitalViewerComponent({ samplesEarth = [], samplesAsteroid = [] }) {
  const mountRef = useRef();

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFF2F2);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.replaceChildren(renderer.domElement);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    scene.add(sun);

    const light = new THREE.PointLight(0xffffff, 90);
    light.position.set(0, 0, 0);
    scene.add(light);

    const loader = new THREE.TextureLoader();

    const earthTexture = loader.load(
      "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
    );

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 64, 64),
      new THREE.MeshPhongMaterial({
        map: earthTexture
      })
    );

    scene.add(earth);


    const asteroidTexture = loader.load(
      //"https://threejs.org/examples/textures/planets/moon_1024.jpg"
      "/textures/asteroid2.png"
    );

    const asteroid = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 64, 64),
      new THREE.MeshPhongMaterial({
        map: asteroidTexture,
        bumpMap: asteroidTexture, 
        bumpScale: 0.05,
        emissive: new THREE.Color(0x333333)
        }),
    );

    scene.add(asteroid);


    // Trayecxtorias
    const scaleFactor = 5;
    if (samplesEarth.length > 1) {
      const earthPath = new THREE.BufferGeometry().setFromPoints(
        samplesEarth.map((p) => new THREE.Vector3(p[0] * scaleFactor, p[1] * scaleFactor, p[2] * scaleFactor))
      );
      scene.add(new THREE.Line(earthPath, new THREE.LineBasicMaterial({ color: 0x22c55e })));
    }
    if (samplesAsteroid.length > 1) {
    const astPath = new THREE.BufferGeometry().setFromPoints(
        samplesAsteroid.map((p) =>
        new THREE.Vector3(p[0] * scaleFactor, p[1] * scaleFactor, p[2] * scaleFactor)
        )
    );
    scene.add(new THREE.Line(astPath, new THREE.LineBasicMaterial({ color: 0xf97316 })));
    }


    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;

    let t = 0;
    const speed = 0.01;

    const animate = () => {
      requestAnimationFrame(animate);

      if (samplesEarth.length > 0) {
        const idx = Math.floor(t) % samplesEarth.length;
        earth.position.set(
          samplesEarth[idx][0] * scaleFactor,
          samplesEarth[idx][1] * scaleFactor,
          samplesEarth[idx][2] * scaleFactor
        );
      }

      if (asteroid && samplesAsteroid.length > 0) {
        const idx = Math.floor(t) % samplesAsteroid.length;
        asteroid.position.set(
          samplesAsteroid[idx][0] * scaleFactor,
          samplesAsteroid[idx][1] * scaleFactor,
          samplesAsteroid[idx][2] * scaleFactor
        );
      }

      t += speed;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
    };
  }, [samplesEarth, samplesAsteroid]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "600px" }}
      className="rounded overflow-hidden"
    />
  );
}
