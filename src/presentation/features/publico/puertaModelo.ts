/**
 * Modelo 3D de la puerta CYPHERLOCK.
 * Versión optimizada con luz real en el LED y cleanup robusto para Vite HMR.
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export const COLOR = {
  hoja: 0x35505b,
  tablero: 0x2a414b,
  marco: 0x1c2b31,
  acero: 0xa9bcc2,
  carcasa: 0x0d1417,
  ledCerrado: 0xff6b6b,
  ledAbierto: 0x2cd4e6,
  interior: 0xf2ae7a,
}

function lienzo(w: number, h: number, pintar: (g: CanvasRenderingContext2D) => void) {
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  pintar(cv.getContext('2d')!)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const texturaTarjeta = () =>
  lienzo(512, 320, (g) => {
    g.fillStyle = '#e9eef0'
    g.fillRect(0, 0, 512, 320)
    g.fillStyle = '#0a0f12'
    g.fillRect(0, 250, 512, 70)
    g.fillStyle = '#2cd4e6'
    g.fillRect(0, 244, 512, 6)
    g.fillStyle = '#c9b27a'
    g.fillRect(40, 100, 70, 54)
    g.fillStyle = '#0a0f12'
    g.font = '600 34px "IBM Plex Sans", sans-serif'
    g.fillText('CYPHERLOCK', 40, 66)
    g.fillStyle = '#a7b6bb'
    g.font = '500 20px "IBM Plex Mono", monospace'
    g.fillText('RFID · ACCESO', 40, 294)
  })

const halo = (centro: string) =>
  lienzo(256, 256, (g) => {
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, centro)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
  })

function caja(w: number, h: number, d: number, r: number, mat: THREE.Material) {
  return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), mat)
}

function plano(w: number, h: number, mapa: THREE.Texture, aditivo = false) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      map: mapa,
      transparent: true,
      depthWrite: false,
      blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending,
    }),
  )
  m.rotation.x = -Math.PI / 2
  return m
}

export function construirPuerta() {
  const raiz = new THREE.Group()
  const mat = {
    hoja: new THREE.MeshStandardMaterial({ color: COLOR.hoja, roughness: 0.45, metalness: 0.35 }),
    tablero: new THREE.MeshStandardMaterial({ color: COLOR.tablero, roughness: 0.55, metalness: 0.3 }),
    marco: new THREE.MeshStandardMaterial({ color: COLOR.marco, roughness: 0.6, metalness: 0.2 }),
    acero: new THREE.MeshStandardMaterial({ color: COLOR.acero, roughness: 0.25, metalness: 0.9 }),
    carcasa: new THREE.MeshStandardMaterial({ color: COLOR.carcasa, roughness: 0.3, metalness: 0.6 }),
    vidrio: new THREE.MeshStandardMaterial({ color: 0x050809, roughness: 0.05, metalness: 0.3 }),
    led: new THREE.MeshStandardMaterial({ color: COLOR.ledCerrado, emissive: COLOR.ledCerrado, emissiveIntensity: 2.4 }),
  }

  // Marco
  for (const x of [-0.56, 0.56]) {
    const jamba = caja(0.12, 2.24, 0.22, 0.02, mat.marco)
    jamba.position.x = x
    jamba.castShadow = true
    jamba.receiveShadow = true
    raiz.add(jamba)
  }
  const dintel = caja(1.24, 0.12, 0.22, 0.02, mat.marco)
  dintel.position.y = 1.12
  dintel.castShadow = true
  dintel.receiveShadow = true
  raiz.add(dintel)

  // Interior iluminado
  const luzPasillo = lienzo(64, 256, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, '#5a4636')
    grad.addColorStop(0.65, '#e9c9a6')
    grad.addColorStop(1, '#fff1e2')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 256)
  })
  const interior = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.1), new THREE.MeshBasicMaterial({ map: luzPasillo }))
  interior.position.set(0, -0.04, -0.09)
  interior.receiveShadow = true
  raiz.add(interior)

  // Hoja con bisagra
  const bisagra = new THREE.Group()
  bisagra.position.x = -0.5
  raiz.add(bisagra)

  const hoja = new THREE.Group()
  hoja.position.set(0.5, -0.04, 0)
  bisagra.add(hoja)

  const meshHoja = caja(1.0, 2.1, 0.07, 0.012, mat.hoja)
  meshHoja.castShadow = true
  meshHoja.receiveShadow = true
  hoja.add(meshHoja)

  for (const [y, h] of [[0.5, 0.78], [-0.5, 0.86]] as const) {
    const t = caja(0.66, h, 0.02, 0.006, mat.tablero)
    t.position.set(-0.08, y, 0.034)
    t.castShadow = true
    hoja.add(t)
  }

  // Cerradura
  const cerradura = new THREE.Group()
  cerradura.position.set(0.36, 0.02, 0.05)
  hoja.add(cerradura)
  cerradura.add(caja(0.15, 0.46, 0.05, 0.02, mat.carcasa))

  const lector = caja(0.11, 0.15, 0.012, 0.01, mat.vidrio)
  lector.position.set(0, 0.12, 0.028)

  const ledMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 16), mat.led)
  ledMesh.rotation.x = Math.PI / 2
  ledMesh.position.set(0, 0.215, 0.028)

  const manija = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 20), mat.acero)
  manija.rotation.z = Math.PI / 2
  manija.position.set(-0.07, -0.1, 0.075)
  manija.castShadow = true

  const soporte = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 20), mat.acero)
  soporte.rotation.x = Math.PI / 2
  soporte.position.set(0.02, -0.1, 0.045)

  cerradura.add(lector, ledMesh, manija, soporte)

  // LUZ REAL DEL LED (Mejora Visual Clave)
  const luzLed = new THREE.PointLight(COLOR.ledCerrado, 0, 1.8, 2)
  luzLed.position.set(0, 0.215, 0.04)
  cerradura.add(luzLed)

  // Piso: sombra y derrame de luz
  const sombra = plano(2.6, 1.4, halo('rgba(0,0,0,0.6)'))
  sombra.position.set(0.1, -1.1, 0.15)
  sombra.receiveShadow = true

  const derrame = plano(1.3, 1.5, halo('rgba(242,174,122,0.6)'), true)
  derrame.position.set(0.15, -1.095, 0.55)

  raiz.add(sombra, derrame)

  // Tarjeta RFID
  const tarjeta = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.214, 0.008, 2, 0.014), [
    mat.carcasa, mat.carcasa, mat.carcasa, mat.carcasa,
    new THREE.MeshStandardMaterial({ map: texturaTarjeta(), roughness: 0.4, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: 0xe9eef0, roughness: 0.5 }),
  ])
  tarjeta.castShadow = true
  tarjeta.receiveShadow = true
  raiz.add(tarjeta)

  return { raiz, bisagra, cerradura, tarjeta, led: mat.led, luzLed, interior, derrame }
}

export function liberar(scene: THREE.Scene) {
  scene.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose()
      const materials = Array.isArray(o.material) ? o.material : [o.material]
      for (const m of materials) {
        // Type guard seguro para materiales con texturas
        if ('map' in m && (m as any).map) (m as any).map.dispose()
        if ('emissiveMap' in m && (m as any).emissiveMap) (m as any).emissiveMap.dispose()
        m.dispose()
      }
    } else if (o instanceof THREE.DirectionalLight || o instanceof THREE.PointLight || o instanceof THREE.SpotLight) {
      // Verificación segura de que la luz tiene mapa de sombras
      if (o.shadow.map) {
        o.shadow.map.dispose()
      }
    }
  })
}
