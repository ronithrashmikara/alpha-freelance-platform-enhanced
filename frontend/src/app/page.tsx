import Hero from '@/components/sections/Hero'
import Stats from '@/components/sections/Stats'
import Features from '@/components/sections/Features'
import Testimonials from '@/components/sections/Testimonials'
import CTA from '@/components/sections/CTA'

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <CTA />
    </main>
  )
}
