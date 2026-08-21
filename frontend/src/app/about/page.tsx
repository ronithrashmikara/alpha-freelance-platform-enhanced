import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, BriefcaseBusiness, Check, CircleDollarSign, MessageSquareText, Search, ShieldCheck, Sparkles } from 'lucide-react'

const steps = [
  { number:'01', icon:Search, title:'Start with the work', body:'Describe the outcome, budget and timing. Alpha turns a loose idea into a brief that good specialists can act on.' },
  { number:'02', icon:BriefcaseBusiness, title:'Build a considered shortlist', body:'Review relevant work, rates, availability and proposals together—without opening twenty tabs.' },
  { number:'03', icon:MessageSquareText, title:'Agree on the details', body:'Set milestones, delivery dates and what “done” means before anyone starts billing time.' },
  { number:'04', icon:ShieldCheck, title:'Fund the milestone', body:'Your budget sits in protected escrow and is released only when the agreed work lands.' },
]

export default function AboutPage(){
  return <main className="bg-[#f4f4f0] text-[#171817]">
    <section className="relative overflow-hidden bg-[#1d201e] text-white">
      <div className="absolute inset-0"><video autoPlay muted loop playsInline poster="/media/alpha-studio-hero.png" className="h-full w-full object-cover object-center opacity-45"><source src="/media/alpha-studio-loop.mp4" type="video/mp4"/></video><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,21,19,.96),rgba(18,21,19,.52)_62%,rgba(18,21,19,.2))]"/></div>
      <div className="site-container relative flex min-h-[760px] items-end pb-16 pt-36 md:min-h-[84dvh] md:pb-20">
        <div className="max-w-4xl"><div className="eyebrow eyebrow-dark"><span className="live-dot"/> How Alpha works</div><h1 className="display-title mt-7">Better work starts<br/>with less guesswork.</h1><div className="mt-8 grid max-w-3xl gap-6 md:grid-cols-[1fr_auto]"><p className="max-w-xl text-lg leading-8 text-white/68">Alpha gives clients and independent specialists one clear path from first brief to final payment.</p><a href="#process" className="button button-ghost-dark">See the process <ArrowDown size={17}/></a></div></div>
      </div>
    </section>

    <section className="border-b border-black/10 bg-[#ff6542]"><div className="site-container grid gap-0 md:grid-cols-3">{[['48h','Average time to shortlist'],['4.9/5','Average collaboration rating'],['94%','Clients who hire again']].map(([value,label])=><div key={label} className="border-b border-black/15 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0"><strong className="text-4xl tracking-[-.06em]">{value}</strong><span className="ml-4 text-xs font-semibold uppercase tracking-[.1em] text-black/55">{label}</span></div>)}</div></section>

    <section id="process" className="section-pad scroll-mt-20"><div className="site-container">
      <div className="section-heading"><div><div className="eyebrow">One workflow, four clear moves</div><h2 className="section-title mt-5">From “maybe”<br/>to shipped.</h2></div><p>Each step reduces ambiguity before it becomes rework. The result is a calmer project and a fairer relationship.</p></div>
      <div className="mt-14 border-t border-black/15">{steps.map(({number,icon:Icon,title,body})=><article key={number} className="grid gap-5 border-b border-black/15 py-8 md:grid-cols-[80px_70px_1fr_1fr] md:items-start md:py-10"><span className="font-mono text-xs text-[#d84c31]">{number}</span><Icon size={27}/><h3 className="text-2xl font-semibold tracking-[-.045em] md:text-3xl">{title}</h3><p className="max-w-lg leading-7 text-black/55">{body}</p></article>)}</div>
    </div></section>

    <section className="section-pad bg-[#dfe1db]"><div className="site-container grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
      <div className="relative overflow-hidden rounded-[20px]"><Image src="/media/alpha-studio-hero.png" alt="A product team collaborating around a digital prototype" width={1584} height={1024} className="aspect-[5/4] w-full object-cover object-[70%_center]"/><div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-white/90 p-4 backdrop-blur"><div><p className="text-xs font-semibold uppercase tracking-[.1em] text-black/45">Milestone 02</p><p className="mt-1 font-semibold">Prototype approved</p></div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#ff6542]"><Check size={18}/></span></div></div>
      <div className="lg:pl-8"><div className="eyebrow">Protection without friction</div><h2 className="section-title mt-5">Money moves when the work does.</h2><p className="mt-7 max-w-lg text-lg leading-8 text-black/55">Clients fund an agreed milestone before work begins. Specialists can focus knowing the budget exists. Release happens when the outcome is accepted, with a dispute path if something goes off course.</p><div className="mt-9 space-y-4 border-t border-black/15 pt-6">{['Scope and payment stay connected','Every milestone has a visible status','Both sides keep a shared project record'].map(x=><p key={x} className="flex items-center gap-3 text-sm font-medium"><Check size={16} className="text-[#d84c31]"/>{x}</p>)}</div></div>
    </div></section>

    <section className="section-pad"><div className="site-container grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
      <div><div className="eyebrow">Built for both sides</div><h2 className="section-title mt-5">Same table.<br/>Clear stakes.</h2></div>
      <div className="grid gap-px overflow-hidden rounded-[20px] border border-black/10 bg-black/10 md:grid-cols-2"><article className="bg-white p-8 md:p-10"><Sparkles size={25}/><h3 className="mt-8 text-3xl font-semibold tracking-[-.05em]">For clients</h3><p className="mt-4 leading-7 text-black/52">Turn an idea into a useful brief, compare qualified proposals and keep delivery visible without micromanaging.</p><Link href="/register" className="mt-8 inline-flex items-center gap-2 font-semibold">Find talent <ArrowUpRight size={17}/></Link></article><article className="bg-[#202320] p-8 text-white md:p-10"><CircleDollarSign size={25} className="text-[#ff6542]"/><h3 className="mt-8 text-3xl font-semibold tracking-[-.05em]">For specialists</h3><p className="mt-4 leading-7 text-white/52">Find serious projects, bid with context and work against funded milestones rather than vague promises.</p><Link href="/register" className="mt-8 inline-flex items-center gap-2 font-semibold">Join as talent <ArrowUpRight size={17}/></Link></article></div>
    </div></section>

    <section className="px-4 pb-4 md:px-6 md:pb-6"><div className="rounded-[20px] bg-[#ff6542] px-6 py-16 text-center md:py-24"><h2 className="section-title mx-auto max-w-4xl">Bring the brief.<br/>Meet the person who gets it.</h2><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/register" className="button button-ink">Start on Alpha</Link><Link href="/projects" className="button button-outline-ink">Browse open work</Link></div></div></section>
  </main>
}
