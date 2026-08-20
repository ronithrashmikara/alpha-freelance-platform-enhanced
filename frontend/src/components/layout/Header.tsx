'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, ArrowUpRight, UserRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header(){
  const [open,setOpen]=useState(false); const {user,logout,loading}=useAuth(); const pathname=usePathname()
  const nav=user?[['Find work','/projects'],['Dashboard','/dashboard'],['Projects','/my-projects'],['Bids','/my-bids'],['Wallet','/wallet']]:[['Find talent','/register'],['Find work','/projects'],['How it works','/about']]
  const darkHome=pathname==='/'
  return <header className={`fixed inset-x-0 top-0 z-50 border-b ${darkHome?'border-white/15 bg-[#171a18]/70 text-white':'border-black/10 bg-[#f4f4f0]/90 text-[#171817]'} backdrop-blur-xl`}>
    <div className="site-container flex h-[74px] items-center justify-between">
      <Link href="/" className="group flex items-center gap-3" aria-label="Alpha home"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#ff6542] text-sm font-black text-[#171817]">A</span><span className="text-lg font-semibold tracking-[-.05em]">ALPHA<span className="text-[#ff6542]">.</span></span></Link>
      <nav className="hidden items-center gap-7 lg:flex">{nav.map(([label,href])=><Link key={href} href={href} className={`text-sm font-medium opacity-75 hover:opacity-100 ${pathname===href?'!opacity-100':''}`}>{label}</Link>)}</nav>
      <div className="hidden items-center gap-2 lg:flex">{!loading&&(user?<><Link href="/profile" className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-white/10"><UserRound size={17}/>{user.name}</Link><button onClick={()=>logout()} className="rounded-full border border-current/20 px-4 py-2 text-sm font-semibold">Log out</button></>:<><Link href="/login" className="px-4 py-2 text-sm font-semibold">Sign in</Link><Link href="/register" className="button button-coral !min-h-10 !py-2">Join Alpha <ArrowUpRight size={16}/></Link></>)}</div>
      <button className="grid h-10 w-10 place-items-center rounded-full border border-current/20 lg:hidden" onClick={()=>setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>{open?<X/>:<Menu/>}</button>
    </div>
    {open&&<div className={`${darkHome?'bg-[#171a18]':'bg-[#f4f4f0]'} border-t border-current/10 px-4 py-5 lg:hidden`}><nav className="flex flex-col">{nav.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="border-b border-current/10 py-4 text-lg font-medium">{label}</Link>)}{!loading&&(user?<><Link href="/profile" onClick={()=>setOpen(false)} className="py-4">Profile</Link><button onClick={()=>{logout();setOpen(false)}} className="py-4 text-left">Log out</button></>:<div className="mt-5 grid grid-cols-2 gap-2"><Link className="button border border-current/20" href="/login">Sign in</Link><Link className="button button-coral" href="/register">Join Alpha</Link></div>)}</nav></div>}
  </header>
}
