'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, Check, Eye, EyeOff, ShieldCheck, Sparkles, UserRoundSearch } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

type Role = 'consumer' | 'provider'

export default function RegisterPage(){
  const router=useRouter(); const {refreshUser}=useAuth()
  const [step,setStep]=useState<1|2>(1)
  const [formData,setFormData]=useState({name:'',email:'',password:'',confirmPassword:'',role:'consumer' as Role})
  const [showPassword,setShowPassword]=useState(false); const [showConfirm,setShowConfirm]=useState(false); const [isLoading,setIsLoading]=useState(false); const [error,setError]=useState('')

  const change=(e:React.ChangeEvent<HTMLInputElement>)=>setFormData({...formData,[e.target.name]:e.target.value})
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');if(formData.password!==formData.confirmPassword){setError('Passwords do not match');return}setIsLoading(true);try{const response=await apiClient.register({name:formData.name,email:formData.email,password:formData.password,password_confirmation:formData.confirmPassword,role:formData.role});if(response.token){apiClient.setToken(response.token);await refreshUser()}router.push(formData.role==='consumer'?'/create-project':'/projects')}catch(err:any){setError(err.message||'Registration failed')}finally{setIsLoading(false)}}

  return <main className="min-h-[calc(100dvh-74px)] bg-[#f4f4f0]">
    <div className="grid min-h-[calc(100dvh-74px)] lg:grid-cols-[.92fr_1.08fr]">
      <aside className="relative hidden overflow-hidden bg-[#1d201e] text-white lg:block">
        <Image src="/media/alpha-studio-hero.png" alt="" fill priority sizes="45vw" className="object-cover object-[64%_center] opacity-58"/><div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(19,22,20,.98),rgba(19,22,20,.18)_72%)]"/>
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14"><div className="eyebrow eyebrow-dark"><span className="live-dot"/> Find talent on Alpha</div><div className="max-w-xl"><p className="text-[clamp(3.2rem,5vw,6.4rem)] font-semibold leading-[.88] tracking-[-.075em]">The right person changes the shape of the work.</p><div className="mt-9 flex items-center gap-4"><div className="flex -space-x-3">{['/media/profile-aisha.png','/media/profile-malcolm.png','/media/profile-yuki.png'].map(src=><Image key={src} src={src} alt="" width={46} height={46} className="h-12 w-12 rounded-full border-2 border-[#1d201e] object-cover"/>)}</div><div><p className="text-sm font-semibold">18,000+ verified specialists</p><p className="text-xs text-white/48">Product, engineering, design and growth</p></div></div></div></div>
      </aside>

      <section className="flex items-center px-4 py-12 sm:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-[690px]">
          <div className="mb-10 flex items-center justify-between"><div className="flex items-center gap-2"><span className={`h-1.5 w-12 rounded-full ${step>=1?'bg-[#ff6542]':'bg-black/10'}`}/><span className={`h-1.5 w-12 rounded-full ${step>=2?'bg-[#ff6542]':'bg-black/10'}`}/></div><span className="font-mono text-[11px] uppercase tracking-[.12em] text-black/42">Step {step} of 2</span></div>

          {step===1?<>
            <div className="eyebrow">Choose your path</div><h1 className="mt-4 text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[.93] tracking-[-.065em]">How will you use Alpha?</h1><p className="mt-5 max-w-xl leading-7 text-black/52">Pick a starting point. You can still collaborate, hire and build your reputation from either account type.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <button type="button" onClick={()=>setFormData({...formData,role:'consumer'})} className={`group min-h-[270px] rounded-[18px] border p-6 text-left ${formData.role==='consumer'?'border-[#ff6542] bg-white shadow-[0_16px_50px_rgba(32,35,32,.08)]':'border-black/12 bg-transparent hover:bg-white'}`}>
                <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#ff6542]"><UserRoundSearch size={22}/></span>{formData.role==='consumer'&&<span className="flex items-center gap-1 text-xs font-semibold"><Check size={14}/> Selected</span>}</div><h2 className="mt-9 text-2xl font-semibold tracking-[-.045em]">I’m hiring talent</h2><p className="mt-3 text-sm leading-6 text-black/50">Post a clear project, compare proposals and pay through protected milestones.</p>
              </button>
              <button type="button" onClick={()=>setFormData({...formData,role:'provider'})} className={`group min-h-[270px] rounded-[18px] border p-6 text-left ${formData.role==='provider'?'border-[#ff6542] bg-white shadow-[0_16px_50px_rgba(32,35,32,.08)]':'border-black/12 bg-transparent hover:bg-white'}`}>
                <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#202320] text-white"><BriefcaseBusiness size={22}/></span>{formData.role==='provider'&&<span className="flex items-center gap-1 text-xs font-semibold"><Check size={14}/> Selected</span>}</div><h2 className="mt-9 text-2xl font-semibold tracking-[-.045em]">I’m finding work</h2><p className="mt-3 text-sm leading-6 text-black/50">Discover serious briefs, send informed proposals and work against funded scope.</p>
              </button>
            </div>
            <button onClick={()=>setStep(2)} className="button button-ink mt-7 w-full md:w-auto">Continue as {formData.role==='consumer'?'a client':'talent'} <ArrowRight size={17}/></button>
          </>:<>
            <button onClick={()=>{setError('');setStep(1)}} className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-black"><ArrowLeft size={16}/> Change account type</button>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="eyebrow">Create your account</div><h1 className="mt-4 text-[clamp(2.7rem,5vw,4.6rem)] font-semibold leading-[.93] tracking-[-.065em]">A better project starts here.</h1></div><span className="w-fit rounded-full bg-[#ffdfd7] px-3 py-2 text-xs font-semibold">{formData.role==='consumer'?'Client account':'Talent account'}</span></div>
            {error&&<div role="alert" className="mt-7 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            <form onSubmit={submit} className="mt-9">
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" name="name" type="text" placeholder="Your name" value={formData.name} onChange={change}/><Field label="Email address" name="email" type="email" placeholder="you@company.com" value={formData.email} onChange={change}/></div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2"><PasswordField label="Password" name="password" placeholder="At least 8 characters" value={formData.password} show={showPassword} setShow={setShowPassword} onChange={change}/><PasswordField label="Confirm password" name="confirmPassword" placeholder="Repeat password" value={formData.confirmPassword} show={showConfirm} setShow={setShowConfirm} onChange={change}/></div>
              <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-black/55"><input required type="checkbox" className="mt-1 h-4 w-4 accent-[#ff6542]"/><span>I agree to Alpha’s account and marketplace terms.</span></label>
              <button type="submit" disabled={isLoading} className="button button-coral mt-7 w-full disabled:cursor-not-allowed disabled:opacity-55">{isLoading?'Creating your account…':'Create account'} <ArrowRight size={17}/></button>
            </form>
            <div className="mt-7 grid gap-3 border-t border-black/10 pt-6 sm:grid-cols-3">{[[BadgeCheck,'Verified profiles'],[ShieldCheck,'Protected scope'],[Sparkles,'Clear matching']].map(([Icon,label])=>{const I=Icon as typeof BadgeCheck;return <span key={String(label)} className="flex items-center gap-2 text-xs font-medium text-black/50"><I size={15} className="text-[#d84c31]"/>{String(label)}</span>})}</div>
          </>}
          <p className="mt-8 text-sm text-black/48">Already have an account? <Link href="/login" className="font-semibold text-black underline decoration-[#ff6542] decoration-2 underline-offset-4">Sign in</Link></p>
        </div>
      </section>
    </div>
  </main>
}

function Field({label,...props}:{label:string,name:string,type:string,placeholder:string,value:string,onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void}){return <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[.08em] text-black/55">{label}</span><input {...props} required className="h-13 w-full border border-black/15 bg-white px-4 text-sm outline-none focus:border-[#ff6542] focus:ring-2 focus:ring-[#ff6542]/15"/></label>}
function PasswordField({label,show,setShow,...props}:{label:string,name:string,placeholder:string,value:string,show:boolean,setShow:(v:boolean)=>void,onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void}){return <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[.08em] text-black/55">{label}</span><span className="relative block"><input {...props} type={show?'text':'password'} minLength={8} required className="h-13 w-full border border-black/15 bg-white px-4 pr-12 text-sm outline-none focus:border-[#ff6542] focus:ring-2 focus:ring-[#ff6542]/15"/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-black/40">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>}
