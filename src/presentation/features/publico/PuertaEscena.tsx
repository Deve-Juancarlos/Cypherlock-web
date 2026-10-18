/**
 * Escena 3D del hero: Tarjeta interactiva, LED con luz real, sombras suaves y entorno PBR.
 * Optimizado para Vite + React.
 */
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { COLOR, construirPuerta, liberar } from './puertaModelo'

const CICLO = 7.2
const GIRO_BASE = -0.38

// Easing cúbico suave para movimientos cinematográficos
const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const tramo = (t: number, a: number, b: number) => suave(Math.min(1, Math.max(0, (t - a) / (b - a))))

function montar(el: HTMLDivElement): (() => void) | undefined {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
  } catch {
    return undefined
  }

  // Configuración visual de alto nivel
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()

  // Entorno PBR para reflejos metálicos realistas (Vite compatible)
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()
  const environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = environment.texture

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(1.9, 0.55, 5.2)
  camera.lookAt(0.15, -0.05, 0)

  // Iluminación
  scene.add(new THREE.HemisphereLight(0xcfe8ee, 0x05080a, 1.2))

  const clave = new THREE.DirectionalLight(0xffffff, 2.5)
  clave.position.set(-2.5, 3, 4)
  clave.castShadow = true
  clave.shadow.mapSize.set(1024, 1024)
  clave.shadow.bias = -0.0005
  clave.shadow.radius = 4 // Suavizado extra de sombras

  const contra = new THREE.DirectionalLight(COLOR.ledAbierto, 1.8)
  contra.position.set(3, 1.5, -3)

  const calidez = new THREE.PointLight(COLOR.interior, 0, 6, 1.5)
  calidez.position.set(0.1, 0.2, 0.4)
  calidez.castShadow = true // La luz que sale proyecta sombras de la puerta
  calidez.shadow.mapSize.set(512, 512)

  scene.add(clave, contra, calidez)

  const p = construirPuerta()
  p.raiz.rotation.y = GIRO_BASE
  scene.add(p.raiz)

  // Estado de animación
  const reposo = new THREE.Vector3(1.75, 0.05, 0.6)
  const lector = new THREE.Vector3()
  const tmp = new THREE.Vector3()
  const ledCerrado = new THREE.Color(COLOR.ledCerrado)
  const ledAbierto = new THREE.Color(COLOR.ledAbierto)
  const luz = new THREE.Color(0xffffff)
  const puntero = { x: 0, y: 0 }
  const tiltObjetivo = { x: 0, y: 0 }

  const pintar = (t: number, dt: number) => {
    const c = t % CICLO
    const acercar = tramo(c, 1.0, 2.0) * (1 - tramo(c, 2.9, 3.9))
    const abrir = tramo(c, 2.5, 4.3) * (1 - tramo(c, 5.4, 6.8))
    const verde = c > 2.25 && c < 6.6 ? 1 : 0

    // 1. Animación de la puerta
    p.bisagra.rotation.y = -1.05 * abrir
    p.raiz.updateMatrixWorld()
    p.cerradura.localToWorld(lector.set(0, 0.12, 0.2))
    p.raiz.worldToLocal(lector)

    // 2. Animación de la tarjeta con Micro-Tilt (Inclinación interactiva)
    tmp.copy(reposo).setY(reposo.y + Math.sin(t * 1.6) * 0.03)
    p.tarjeta.position.lerpVectors(tmp, lector, acercar)

    // Rotación base + micro-tilt suave basado en el mouse
    const tiltX = THREE.MathUtils.lerp(p.tarjeta.rotation.x, tiltObjetivo.x, dt * 5)
    const tiltY = THREE.MathUtils.lerp(p.tarjeta.rotation.y, tiltObjetivo.y, dt * 5)

    p.tarjeta.rotation.set(
      -0.1 * (1 - acercar) + tiltX * 0.3,
      -0.55 * (1 - acercar) + tiltY * 0.3,
      0.18 * (1 - acercar) + Math.sin(t * 1.2) * 0.04 * (1 - acercar),
    )

    // 3. Sincronización de luces y materiales
    p.led.color.copy(ledCerrado).lerp(ledAbierto, verde)
    p.led.emissive.copy(p.led.color)

    // La luz real del LED se enciende cuando está verde/abierto
    p.luzLed.color.copy(p.led.color)
    p.luzLed.intensity = THREE.MathUtils.lerp(p.luzLed.intensity, verde * 3.5, dt * 5)

    calidez.intensity = THREE.MathUtils.lerp(calidez.intensity, abrir * 5, dt * 5)
    ;(p.interior.material as THREE.MeshBasicMaterial).color.copy(luz).multiplyScalar(0.15 + 0.85 * abrir)
    ;(p.derrame.material as THREE.MeshBasicMaterial).opacity = abrir * 0.8

    // 4. Paralaje suave de toda la escena con el mouse
    const k = 1 - Math.exp(-dt * 4)
    p.raiz.rotation.y += (GIRO_BASE + puntero.x * 0.08 - p.raiz.rotation.y) * k
    p.raiz.rotation.x += (puntero.y * 0.04 - p.raiz.rotation.x) * k

    renderer.render(scene, camera)
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const ajustar = () => {
    const { clientWidth: w, clientHeight: h } = el
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    if (reduce) pintar(3.6, 1)
  }

  const ro = new ResizeObserver(ajustar)
  ro.observe(el)
  ajustar()

  let raf = 0
  let visible = true
  const reloj = new THREE.Clock()

  const bucle = () => {
    raf = 0
    if (!visible || document.hidden) return
    pintar(reloj.elapsedTime, Math.min(reloj.getDelta(), 0.05))
    raf = requestAnimationFrame(bucle)
  }

  const reanudar = () => {
    if (reduce || !visible || document.hidden) return
    reloj.getDelta()
    if (!raf) raf = requestAnimationFrame(bucle)
  }

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (!visible || document.hidden) {
      cancelAnimationFrame(raf)
      raf = 0
    } else reanudar()
  }, { threshold: 0.1 })
  io.observe(el)

  const onPointer = (e: PointerEvent) => {
    // Normalizar coordenadas del mouse de -1 a 1
    puntero.x = (e.clientX / window.innerWidth) * 2 - 1
    puntero.y = (e.clientY / window.innerHeight) * 2 - 1

    // Calcular tilt objetivo para la tarjeta (invertido para efecto natural)
    tiltObjetivo.x = -puntero.y * 0.15
    tiltObjetivo.y = puntero.x * 0.15
  }

  const alCambiarVisibilidad = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf)
      raf = 0
    } else reanudar()
  }
  document.addEventListener('visibilitychange', alCambiarVisibilidad)
  if (!reduce) {
    window.addEventListener('pointermove', onPointer, { passive: true })
    reanudar()
  } else {
    pintar(3.6, 1) // Cuadro fijo para accesibilidad
  }

  // Cleanup profesional (Crítico para Vite HMR)
  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', alCambiarVisibilidad)
    window.removeEventListener('pointermove', onPointer)

    liberar(scene)
    environment.dispose()
    pmremGenerator.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}

export default function PuertaEscena({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = host.current ? montar(host.current) : undefined
    return () => cleanup?.()
  }, [])

  return <div ref={host} className={className} />
}
