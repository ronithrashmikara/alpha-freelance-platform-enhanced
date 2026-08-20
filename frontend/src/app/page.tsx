import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, Check, CircleDollarSign, Globe2, ShieldCheck, Sparkles, Star } from 'lucide-react'

const talent = [
  { name: 'Aisha Raman', role: 'Product designer', image: '/media/profile-aisha.png', rate: '$78/hr', skills: ['Product strategy', 'Figma'] },
  { name: 'Malcolm Reed', role: 'Full-stack engineer', image: '/media/profile-malcolm.png', rate: '$92/hr', skills: ['Next.js', 'Laravel'] },
  { name: 'Yuki Tanaka', role: 'Growth strategist', image: '/media/profile-yuki.png', rate: '$84/hr', skills: ['Go-to-market', 'Research'] },
]

export default function Home() {
  return (
    <main className="bg-[#f4f4f0] text-[#161716]">
      <section className="hero-shell">
        <div className="hero-media" aria-hidden="true">
          <video autoPlay muted loop playsInline poster="/media/alpha-studio-hero.png"><source src="/media/alpha-studio-loop.mp4" type="video/mp4" /></video>
          <div className="hero-shade" />
        </div>
        <div className="site-container relative z-10 flex min-h-[780px] items-end pb-12 pt-32 md:min-h-[86dvh] md:pb-16">
          <div className="max-w-[760px] text-white">
            <div className="eyebrow eyebrow-dark"><span className="live-dot" /> Verified talent, ready now</div>
            <h1 className="display-title mt-7">Build the thing<br />people remember.</h1>
            <p className="mt-7 max-w-[590px] text-lg leading-8 text-white/78 md:text-xl">A focused freelance marketplace for ambitious teams. Find proven specialists, agree on clear milestones, and keep every payment protected.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link className="button button-coral" href="/register">Start a project <ArrowUpRight size={18} /></Link><Link className="button button-ghost-dark" href="/projects">Explore live work</Link></div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/70"><span className="inline-flex items-center gap-2"><Check size={15} /> No platform fee to join</span><span className="inline-flex items-center gap-2"><Check size={15} /> Escrow protection</span><span className="inline-flex items-center gap-2"><Check size={15} /> Human support</span></div>
          </div>
          <div className="hero-proof hidden lg:flex items-center gap-4">
            <div className="flex -space-x-3">{talent.map((person) => <Image key={person.name} src={person.image} alt="" width={48} height={48} className="h-12 w-12 rounded-full border-2 border-[#262825] object-cover" />)}</div>
            <div><div className="flex gap-0.5 text-[#ff6b4a]">{Array.from({length:5}).map((_,i)=><Star key={i} size={13} fill="currentColor" />)}</div><p className="mt-1 text-xs text-white/65">Trusted by 12,000+ builders</p></div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#ff6542]"><div className="site-container grid grid-cols-2 divide-x divide-black/15 md:grid-cols-4">{[['18k','specialists'],['4.9/5','average rating'],['48h','to first shortlist'],['94%','repeat clients']].map(([value,label])=><div key={label} className="px-5 py-7 first:pl-0 md:py-9"><strong className="text-3xl tracking-[-.06em] md:text-4xl">{value}</strong><span className="mt-1 block text-xs font-semibold uppercase tracking-[.13em] text-black/60">{label}</span></div>)}</div></section>

      <section className="section-pad"><div className="site-container">
        <div className="section-heading"><div><div className="eyebrow">Talent, without the theatre</div><h2 className="section-title mt-4">Work with people<br />who ship.</h2></div><p>Detailed profiles, verified work history, and transparent rates make a shortlist feel less like a gamble.</p></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">{talent.map((person) => <article className="talent-card" key={person.name}><div className="relative aspect-[4/4.8] overflow-hidden"><Image src={person.image} alt={`${person.name}, ${person.role}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 hover:scale-[1.025]" /><span className="availability"><span className="live-dot" /> Available</span></div><div className="p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold tracking-[-.035em]">{person.name} <BadgeCheck className="inline text-[#ff6542]" size={18} /></h3><p className="mt-1 text-sm text-black/55">{person.role}</p></div><span className="font-mono text-sm font-semibold">{person.rate}</span></div><div className="mt-5 flex flex-wrap gap-2">{person.skills.map(s=><span className="skill-tag" key={s}>{s}</span>)}</div><Link href="/register" className="mt-6 flex items-center justify-between border-t border-black/10 pt-5 text-sm font-semibold">View profile <ArrowUpRight size={17} /></Link></div></article>)}</div>
      </div></section>

      <section className="section-pad bg-[#1e211f] text-white"><div className="site-container grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
        <div><div className="eyebrow eyebrow-dark">A calmer way to deliver</div><h2 className="section-title mt-5">From brief<br />to done.</h2><p className="mt-6 max-w-md text-white/58 leading-7">One clear workflow keeps scope, conversation and money in the same place. Less chasing. More useful work.</p><Link href="/about" className="button button-ghost-dark mt-8">See how Alpha works</Link></div>
        <div className="process-list">{[[Sparkles,'Write a sharper brief','Turn an early idea into a clear scope, skill list and realistic milestone plan.'],[BriefcaseBusiness,'Choose with context','Compare relevant work, availability, rates and proposals side by side.'],[ShieldCheck,'Fund work safely','Secure the budget in escrow and release it when each agreed milestone lands.'],[CircleDollarSign,'Close the loop','Review the outcome, keep the relationship, and rehire in a few clicks.']].map(([Icon,title,body],i)=>{const IconComp=Icon as typeof Sparkles; return <div className="process-row" key={String(title)}><span className="process-number">0{i+1}</span><IconComp size={23} /><div><h3>{String(title)}</h3><p>{String(body)}</p></div></div>})}</div>
      </div></section>

      <section className="section-pad"><div className="site-container grid items-center gap-12 lg:grid-cols-2"><div className="relative overflow-hidden rounded-[20px] bg-[#dcded8]"><Image src="/media/alpha-studio-hero.png" alt="Creative team planning a digital product together" width={1584} height={1024} className="aspect-[4/3] w-full object-cover object-[66%_center]" /></div><div className="lg:pl-10"><div className="eyebrow">Made for real working relationships</div><blockquote className="mt-6 text-[clamp(2rem,4vw,3.7rem)] font-medium leading-[1.04] tracking-[-.06em]">“The shortlist felt considered. We hired in two days, and the first milestone landed early.”</blockquote><div className="mt-8 flex items-center gap-4"><Image src="/media/profile-yuki.png" alt="Yuki Tanaka" width={52} height={52} className="h-13 w-13 rounded-full object-cover"/><div><strong>Yuki Tanaka</strong><p className="text-sm text-black/50">Founder, Fieldnote</p></div></div></div></div></section>

      <section className="px-4 pb-4 md:px-6 md:pb-6"><div className="rounded-[20px] bg-[#ff6542] px-6 py-16 text-center md:py-24"><div className="mx-auto max-w-3xl"><Globe2 className="mx-auto" size={32}/><h2 className="section-title mt-6">Your next great collaborator is already here.</h2><p className="mx-auto mt-5 max-w-xl text-black/60">Post a project in minutes or build a profile that makes the right clients stop scrolling.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/register" className="button button-ink">Join Alpha</Link><Link href="/projects" className="button button-outline-ink">Browse projects</Link></div></div></div></section>
    </main>
  )
}
