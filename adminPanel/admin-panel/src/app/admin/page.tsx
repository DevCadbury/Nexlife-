'use client'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, ArcElement, Legend, Tooltip } from 'chart.js'
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement, Legend, Tooltip)

export default function Dashboard(){
  const { data:ov } = useSWR('/analytics/overview', fetcher)
  const { data:sub } = useSWR('/analytics/submissions?range=7', fetcher)
  const labels = sub?.series?.map((p:any)=>p._id)||[]
  const counts = sub?.series?.map((p:any)=>p.count)||[]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {['submissions','replies','totalCampaigns','totalImages','totalLikes'].map((k)=> (
          <div key={k} className="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
            <div className="text-slate-400 text-sm">{k}</div>
            <div className="text-2xl font-extrabold">{ov?.[k] ?? 0}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
        <div className="font-semibold mb-2">Submissions (7d)</div>
        <Line data={{ labels, datasets:[{ label:'Total', data:counts, borderColor:'#6366f1' }] }} options={{ plugins:{ legend:{ labels:{ color:'#cbd5e1' } }}, scales:{ x:{ ticks:{ color:'#94a3b8'}}, y:{ ticks:{ color:'#94a3b8'} } } }} />
      </div>
    </div>
  )
}
