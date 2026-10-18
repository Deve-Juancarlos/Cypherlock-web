/** Puerta entreabierta del login, reutilizando el modelo del sitio público. */
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { construirPuerta, liberar, COLOR } from '../publico/puertaModelo'

export function LoginEscena3D({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;pointer-events:none'
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0f12, 0.08)
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50)
    camera.position.set(2.5, 1.2, 4)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0x131e23, 0.3))
    const luzCian = new THREE.DirectionalLight(COLOR.ledAbierto, 1.5)
    luzCian.position.set(-2, 3, 2)
    luzCian.castShadow = true
    luzCian.shadow.mapSize.set(512, 512)
    luzCian.shadow.bias = -0.0005
    const luzCobre = new THREE.DirectionalLight(0xb9541c, 1.2)
    luzCobre.position.set(2, -1, 2)
    const luzInterior = new THREE.PointLight(COLOR.interior, 3, 5)
    luzInterior.position.set(0.2, 0.3, 0.5)
    luzInterior.castShadow = true
    luzInterior.shadow.mapSize.set(256, 256)
    scene.add(luzCian, luzCobre, luzInterior)

    const puerta = construirPuerta()
    puerta.raiz.rotation.y = -0.3
    puerta.bisagra.rotation.y = -0.8
    puerta.tarjeta.visible = false
    puerta.led.color.setHex(COLOR.ledAbierto)
    puerta.led.emissive.setHex(COLOR.ledAbierto)
    puerta.luzLed.color.setHex(COLOR.ledAbierto)
    puerta.luzLed.intensity = 2.5
    scene.add(puerta.raiz)

    const particlesGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(80 * 3)
    for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 2
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particlesMat = new THREE.PointsMaterial({
      color: COLOR.interior, size: 0.02, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const particles = new THREE.Points(particlesGeo, particlesMat)
    scene.add(particles)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let mouseX = 0
    let mouseY = 0
    const pintar = (t: number) => {
      puerta.raiz.rotation.y = -0.3 + mouseX * 0.15
      puerta.raiz.rotation.x = mouseY * 0.05
      luzInterior.intensity = 3 + Math.sin(t * 1.5) * 0.8
      particles.rotation.y = t * 0.05
      renderer.render(scene, camera)
    }
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (reduceMotion) pintar(0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    let raf = 0
    let visible = false
    const clock = new THREE.Clock()
    const animate = () => {
      raf = 0
      if (!visible || document.hidden) return
      const t = clock.getElapsedTime()
      const pos = particlesGeo.attributes.position.array as Float32Array
      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3 + 1] += Math.sin(t + i) * 0.001
        if (pos[i * 3 + 1] > 1) pos[i * 3 + 1] = -1
      }
      particlesGeo.attributes.position.needsUpdate = true
      pintar(t)
      raf = requestAnimationFrame(animate)
    }
    const pausar = () => { cancelAnimationFrame(raf); raf = 0 }
    const reanudar = () => {
      if (!reduceMotion && visible && !document.hidden && !raf && el.clientWidth && el.clientHeight)
        raf = requestAnimationFrame(animate)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) reanudar()
      else pausar()
    })
    io.observe(el)

    const onPointerMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onVisibilityChange = () => { if (document.hidden) pausar(); else reanudar() }
    document.addEventListener('visibilitychange', onVisibilityChange)
    if (!reduceMotion) window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      pausar()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pointermove', onPointerMove)
      particlesGeo.dispose()
      particlesMat.dispose()
      liberar(scene)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={host} className={className} aria-hidden />
}
