/** Contenido de las tarjetas y futuros paneles de detalle por tipo de inmueble. */
import { Home, Building2, KeyRound, type LucideIcon } from 'lucide-react'
import type { Tipo } from './solicitud/modelo'

export type TipoInmueble = Tipo

export interface Inmueble {
  id: TipoInmueble
  titulo: string
  icono: LucideIcon
  colorGradient: string
  iconoColor: string
  bgIcono: string
  resumen: string
  detalles: string[]
}

export const INMUEBLES: Inmueble[] = [
  {
    id: 'CASA',
    titulo: 'Casa',
    icono: Home,
    colorGradient: 'bg-gradient-to-r from-senal to-cobre',
    iconoColor: 'text-senal',
    bgIcono: 'bg-senal/10',
    resumen: 'Una o varias puertas. Cada persona de la familia con su propio acceso y su propio historial.',
    detalles: [
      'Asigna una tarjeta o registra el rostro de cada miembro de la familia.',
      'Recibe avisos en tu celular cuando alguien intenta entrar con una tarjeta o un rostro no reconocido.',
      'Desactiva una tarjeta perdida al instante desde la app, sin cambiar la chapa.',
      'Abre la puerta a distancia para familiares o visitas.',
    ],
  },
  {
    id: 'EDIFICIO',
    titulo: 'Edificio',
    icono: Building2,
    colorGradient: 'bg-gradient-to-r from-cobre to-hoja',
    iconoColor: 'text-cobre',
    bgIcono: 'bg-cobre/10',
    resumen: 'Cada departamento por separado: un vecino no ve ni abre lo que no le corresponde.',
    detalles: [
      'Configura el acceso de cada departamento por separado.',
      'Consulta el historial de entradas de tu puerta sin acceder a las de tus vecinos.',
      'Cada familia puede usar sus propias tarjetas y rostros registrados.',
      'Instalamos y probamos la cerradura, el lector y la cámara en tu puerta.',
    ],
  },
  {
    id: 'ALQUILER',
    titulo: 'Alquiler',
    icono: KeyRound,
    colorGradient: 'bg-gradient-to-r from-hoja to-senal',
    iconoColor: 'text-hoja',
    bgIcono: 'bg-hoja/10',
    resumen: 'Das acceso al inquilino y lo retiras cuando se muda, sin cambiar chapas ni recoger llaves.',
    detalles: [
      'Crea pases de un solo ingreso para visitas o técnicos.',
      'Retira el acceso del inquilino cuando se muda, sin recoger llaves.',
      'Revisa el historial de aperturas de la puerta desde la app.',
      'Evita cambiar la cerradura entre contratos por una llave no devuelta.',
    ],
  },
]
