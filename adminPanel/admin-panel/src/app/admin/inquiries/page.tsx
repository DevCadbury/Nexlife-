'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function Inquiries(){
  const [items,setItems]=useState<any[]>([])
  const [q,setQ]=useState('')
  const [status,setStatus]=useState('')
  async function load(){ const r = await api.get('/inquiries',{ params:{ limit:200, ...(status&&{status}), ...(q&&{q}) } }); setItems(r.data.items||[]) }
  useEffect(()=>{ load() },[])
  async function mark(id:string,s:string){ await api.patch(`/inquiries/${id}/status`,{ status:s }); load() }
  async function reply(id:string){ const subject = prompt('Subject'); if(!subject) return; const message = prompt('Message'); if(!message) return; await api.post(`/inquiries/${id}/reply`,{ subject,message }); await mark(id,'replied') }
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select className="bg-slate-900 border border-slate-800 rounded px-2" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All</option><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option>
        </select>
        <input className="bg-slate-900 border border-slate-800 rounded px-2" placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
        <button className="rounded bg-indigo-600 px-3" onClick={load}>Apply</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-slate-400"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Phone</th><th className="p-2">Message</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {items.map(i=> (
              <tr key={i._id} className="border-t border-slate-800">
                <td className="p-2">{i.name}</td>
                <td className="p-2 text-cyan-300">{i.email}</td>
                <td className="p-2">{i.phone||''}</td>
                <td className="p-2">{String(i.message||'').slice(0,80)}</td>
                <td className="p-2">{i.status}</td>
                <td className="p-2">
                  <button className="text-indigo-400" onClick={()=>mark(i._id,'read')}>Mark read</button>
                  <button className="ml-2 text-emerald-400" onClick={()=>reply(i._id)}>Reply</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
