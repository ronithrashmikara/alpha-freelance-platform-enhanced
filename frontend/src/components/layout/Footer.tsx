import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function Footer(){
  return <footer className="bg-[#171917] px-4 text-white md:px-6"><div className="mx-auto max-w-[1380px] py-14 md:py-20">
    <div className="grid gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.4fr_.6fr_.6fr]">
      <div><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#ff6542] font-black text-black">A</span><span className="text-xl font-semibold tracking-[-.05em]">ALPHA.</span></Link><p className="mt-6 max-w-md text-sm leading-7 text-white/50">Independent talent and serious teams, brought together by clear scope, protected payments and work worth showing.</p></div>
      <div><h3 className="eyebrow eyebrow-dark">Explore</h3><div className="mt-5 flex flex-col gap-3 text-sm text-white/65"><Link href="/projects">Browse projects</Link><Link href="/register">Join as talent</Link><Link href="/about">How it works</Link><Link href="/login">Sign in</Link></div></div>
      <div><h3 className="eyebrow eyebrow-dark">Workspace</h3><div className="mt-5 flex flex-col gap-3 text-sm text-white/65"><Link href="/dashboard">Dashboard</Link><Link href="/wallet">Wallet</Link><Link href="/reviews">Reviews</Link><Link href="/disputes">Support</Link></div></div>
    </div>
    <div className="flex flex-col gap-4 pt-7 text-xs text-white/40 md:flex-row md:items-center md:justify-between"><p>© {new Date().getFullYear()} Alpha Marketplace. Built for better work.</p><Link href="/register" className="inline-flex items-center gap-2 text-white/75">Start something good <ArrowUpRight size={14}/></Link></div>
  </div></footer>
}
