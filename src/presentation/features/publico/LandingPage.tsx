import { BandaNumero, Contacto } from './Contacto'
import { Hero } from './Hero'
import { LaApp } from './LaApp'
import { FormasDeAbrir, Instalacion, ParaQuien, Tecnologia } from './Secciones'

export function LandingPage() {
  return (
    <>
      <title>CYPHERLOCK · Cerraduras inteligentes · CypherTech Perú</title>
      <Hero />
      <FormasDeAbrir />
      <Tecnologia />
      <LaApp />
      <Instalacion />
      <BandaNumero />
      <ParaQuien />
      <Contacto />
    </>
  )
}
