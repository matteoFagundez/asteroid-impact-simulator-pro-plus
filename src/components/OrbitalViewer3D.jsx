import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function OrbitalViewer3D({ samplesAsteroid=[], samplesEarth=[] }){
  const ref = useRef(null)
  useEffect(()=>{
    const el = ref.current; if(!el) return
    const w = el.clientWidth || 800, h = 380
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000)
    camera.position.set(0, 2, 6)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h); el.innerHTML=''; el.appendChild(renderer.domElement)
    scene.add(new THREE.AmbientLight(0xffffff, 1))

    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffff00 }))
    scene.add(sun)

    const drawPath = (pts, color)=>{
      if(pts.length<2) return
      const g = new THREE.BufferGeometry().setFromPoints(pts.map(p=> new THREE.Vector3(p[0], p[2], p[1])))
      const m = new THREE.LineBasicMaterial({ color })
      const line = new THREE.Line(g, m)
      scene.add(line)
    }
    drawPath(samplesEarth, 0x0099ff)
    drawPath(samplesAsteroid, 0xff5555)

    const animate = ()=>{ requestAnimationFrame(animate); renderer.render(scene, camera) }
    animate()
    return ()=>{ renderer.dispose(); el.innerHTML='' }
  }, [samplesAsteroid, samplesEarth])
  return <div ref={ref} className="h-96 w-full bg-black rounded" />
}