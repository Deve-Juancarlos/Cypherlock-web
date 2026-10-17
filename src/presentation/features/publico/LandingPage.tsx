import { BandaNumero, Contacto } from './Contacto'
import { Hero } from './Hero'
import { LaApp } from './LaApp'
import { FormasDeAbrir, Instalacion, ParaQuien } from './Secciones'

export function LandingPage() {
  return (
    <>
      <title>CYPHERLOCK · Cerraduras inteligentes · CypherTech Perú</title>
      <Hero />
      <BandaNumero />
      <FormasDeAbrir />
      <LaApp />
      <Instalacion />
      <ParaQuien />
      <Contacto />
    </>
  )
}
