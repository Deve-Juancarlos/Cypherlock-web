/**
 * Escena 3D del hero: la tarjeta se acerca al lector, el LED pasa a cian y la
 * puerta se abre dejando salir luz calida.
 *
 * - three.js puro: una sola escena, sin estado React.
 * - Se pausa fuera de pantalla y con la pestana oculta.
 * - prefers-reduced-motion: un cuadro fijo con la puerta entreabierta.
 * - Sin WebGL no pinta nada: el hero funciona igual solo con texto.
 */
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { COLOR, construirPuerta, liberar } from './puertaModelo'

const CICLO = 7.2 // segundos por apertura completa
const GIRO_BASE = -0.38

const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const tramo = (t: number, a: number, b: number) => suave(Math.min(1, Math.max(0, (t - a) / (b - a))))

function montar(el: HTMLDivElement): (() => void) | undefined {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  } catch {
    return undefined
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(1.9, 0.55, 5.2)
  camera.lookAt(0.15, -0.05, 0)
  scene.add(new THREE.HemisphereLight(0xcfe8ee, 0x05080a, 1.3))
  const clave = new THREE.DirectionalLight(0xffffff, 2.8)
  clave.position.set(-2.5, 3, 4)
  const contra = new THREE.DirectionalLight(COLOR.ledAbierto, 2.4)
  contra.position.set(3, 1.5, -3)
  const calidez = new THREE.PointLight(COLOR.interior, 0, 5, 1.4)
  calidez.position.set(0.1, 0.2, 0.4)
  scene.add(clave, contra, calidez)

  const p = construirPuerta()
  p.raiz.rotation.y = GIRO_BASE
  scene.add(p.raiz)

  const reposo = new THREE.Vector3(1.75, 0.05, 0.6)
  const lector = new THREE.Vector3()
  const tmp = new THREE.Vector3()
  const ledCerrado = new THREE.Color(COLOR.ledCerrado)
  const ledAbierto = new THREE.Color(COLOR.ledAbierto)
  const luz = new THREE.Color(0xffffff)
  const puntero = { x: 0, y: 0 }

  const pintar = (t: number, dt: number) => {
    const c = t % CICLO
    const acercar = tramo(c, 1.0, 2.0) * (1 - tramo(c, 2.9, 3.9))
    const abrir = tramo(c, 2.5, 4.3) * (1 - tramo(c, 5.4, 6.8))
    const verde = c > 2.25 && c < 6.6 ? 1 : 0

    p.bisagra.rotation.y = -1.05 * abrir
    p.raiz.updateMatrixWorld()
    p.cerradura.localToWorld(lector.set(0, 0.12, 0.2))
    p.raiz.worldToLocal(lector)

    tmp.copy(reposo).setY(reposo.y + Math.sin(t * 1.6) * 0.03)
    p.tarjeta.position.lerpVectors(tmp, lector, acercar)
    p.tarjeta.rotation.set(-0.1 * (1 - acercar), -0.55 * (1 - acercar), 0.18 * (1 - acercar) + Math.sin(t * 1.2) * 0.04 * (1 - acercar))

    p.led.color.copy(ledCerrado).lerp(ledAbierto, verde)
    p.led.emissive.copy(p.led.color)
    calidez.intensity = abrir * 4
    ;(p.interior.material as THREE.MeshBasicMaterial).color.copy(luz).multiplyScalar(0.15 + 0.85 * abrir)
    ;(p.derrame.material as THREE.MeshBasicMaterial).opacity = abrir

    const k = 1 - Math.exp(-dt * 3)
    p.raiz.rotation.y += (GIRO_BASE + puntero.x * 0.12 - p.raiz.rotation.y) * k
    p.raiz.rotation.x += (puntero.y * 0.05 - p.raiz.rotation.x) * k
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
    if (reduce || raf || !visible || document.hidden) return
    reloj.getDelta()
    raf = requestAnimationFrame(bucle)
  }
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    reanudar()
  })
  io.observe(el)
  const onPointer = (e: PointerEvent) => {
    puntero.x = (e.clientX / window.innerWidth) * 2 - 1
    puntero.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  document.addEventListener('visibilitychange', reanudar)
  if (!reduce) window.addEventListener('pointermove', onPointer, { passive: true })
  if (reduce) pintar(3.6, 1)
  else reanudar()

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', reanudar)
    window.removeEventListener('pointermove', onPointer)
    liberar(scene)
    renderer.dispose()
    renderer.domElement.remove()
  }
}

export default function PuertaEscena({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => (host.current ? montar(host.current) : undefined), [])
  return <div ref={host} className={className} />
}
