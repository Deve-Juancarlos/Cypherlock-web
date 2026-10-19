/**
 * Escenario del hero: plataforma metalica con anillos de senal, halo trasero,
 * particulas de polvo luminoso y un pulso que se expande al conceder acceso.
 */
import * as THREE from 'three'
import { COLOR } from './puertaModelo'

const PISO = -1.12
const PARTICULAS = 140

function halo(color: string) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 256
  const g = cv.getContext('2d')!
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, color)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const brillo = (opacity: number) =>
  new THREE.MeshBasicMaterial({ color: COLOR.ledAbierto, transparent: true, opacity, toneMapped: false, depthWrite: false })

function anillo(radio: number, grosor: number, opacity: number) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(radio, grosor, 8, 180), brillo(opacity))
  m.rotation.x = -Math.PI / 2
  m.position.y = PISO + 0.002
  return m
}

export function construirEscenario() {
  const raiz = new THREE.Group()

  // Plataforma: disco de metal oscuro con laca (refleja el entorno PBR)
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.58, 0.08, 128),
    new THREE.MeshPhysicalMaterial({ color: 0x0b1316, roughness: 0.32, metalness: 0.75, clearcoat: 1, clearcoatRoughness: 0.2 }),
  )
  base.position.y = PISO - 0.04
  base.receiveShadow = true

  const exterior = anillo(1.5, 0.008, 0.9)
  const interior = anillo(1.18, 0.003, 0.35)
  const pulso = anillo(0.4, 0.012, 0)

  // Halo detras de la puerta: contraluz de senal sobre la banda oscura
  const contraluz = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.2),
    new THREE.MeshBasicMaterial({ map: halo('rgba(44,212,230,0.45)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  contraluz.position.set(0, 0.1, -0.6)

  // Particulas que suben despacio dentro del cilindro del escenario
  const pos = new Float32Array(PARTICULAS * 3)
  const vel = new Float32Array(PARTICULAS)
  for (let i = 0; i < PARTICULAS; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 0.4 + Math.random() * 1.3
    pos.set([Math.cos(a) * r, PISO + Math.random() * 2.6, Math.sin(a) * r], i * 3)
    vel[i] = 0.05 + Math.random() * 0.12
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const polvo = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: COLOR.ledAbierto,
      size: 0.018,
      map: halo('rgba(255,255,255,1)'),
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  )

  raiz.add(base, exterior, interior, pulso, contraluz, polvo)

  let fase = 0
  let encendido = 0

  /** `verde` = 1 mientras el acceso esta concedido. */
  const animar = (t: number, dt: number, verde: number) => {
    encendido += (verde - encendido) * Math.min(1, dt * 4)

    // Pulso de escaneo: se expande desde la puerta mientras esta abierta
    fase = verde ? (fase + dt / 1.4) % 1 : 0
    pulso.scale.setScalar(1 + fase * 2.6)
    ;(pulso.material as THREE.MeshBasicMaterial).opacity = (1 - fase) * 0.8 * encendido

    ;(exterior.material as THREE.MeshBasicMaterial).opacity = 0.45 + 0.5 * encendido + Math.sin(t * 2) * 0.05
    ;(contraluz.material as THREE.MeshBasicMaterial).opacity = 0.55 + 0.45 * encendido
    interior.rotation.z = t * 0.12

    const p = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < PARTICULAS; i++) {
      let y = p.getY(i) + vel[i] * dt * (1 + encendido)
      if (y > PISO + 2.6) y = PISO
      p.setY(i, y)
    }
    p.needsUpdate = true
    polvo.rotation.y = t * 0.03
  }

  return { raiz, animar }
}
