'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href:'/admin', label:'Dashboard' },
  { href:'/admin/analytics', label:'Analytics' },
  { href:'/admin/inquiries', label:'Inquiries' },
  { href:'/admin/subscribers', label:'Subscribers' },
  { href:'/admin/campaigns', label:'Campaigns' },
  { href:'/admin/gallery', label:'Gallery' },
  { href:'/admin/staff', label:'Staff' },
  { href:'/admin/logs', label:'Logs' },
  { href:'/admin/export', label:'Export' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <aside className="border-r border-slate-800 bg-slate-900/60">
        <div className="p-4 border-b border-slate-800 font-extrabold">Nexlife CRM</div>
        <nav className="p-2 space-y-1">
          {tabs.map(t => (
            <Link key={t.href} href={t.href} className={`block px-3 py-2 rounded hover:bg-slate-800 ${path===t.href?'bg-slate-800':''}`}>{t.label}</Link>
          ))}
        </nav>
      </aside>
      <main>
        <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/60">
          <div className="font-extrabold">{tabs.find(t=>t.href===path)?.label || 'Dashboard'}</div>
          <form action="/logout" method="post"><button className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500">Logout</button></form>
        </header>
        <section className="p-6">{children}</section>
      </main>
    </div>
  )
}
