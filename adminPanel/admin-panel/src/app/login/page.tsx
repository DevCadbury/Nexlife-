'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/auth/login', { email, password })
      router.replace('/admin')
    } catch (e: any) {
      setErr('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-sm border border-slate-800 rounded-xl p-5 bg-slate-900/50">
        <h1 className="font-extrabold mb-3">Sign in</h1>
        <input className="w-full mb-2 bg-slate-900 border border-slate-800 rounded p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full mb-2 bg-slate-900 border border-slate-800 rounded p-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="text-red-400 text-sm mb-2">{err}</div>}
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 rounded p-2 font-semibold">Login</button>
      </form>
    </div>
  )
}
