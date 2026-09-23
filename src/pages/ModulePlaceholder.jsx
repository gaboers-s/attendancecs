import { Construction } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

export default function ModulePlaceholder() {
  return <MainLayout><main className="mx-auto max-w-7xl px-5 py-10 lg:px-10"><div className="flex min-h-105 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center"><div className="rounded-full bg-blue-50 p-4 text-blue-600"><Construction size={25} /></div><h1 className="mt-5 text-xl font-semibold text-slate-950">Module coming next</h1><p className="mt-2 max-w-sm text-sm text-slate-500">This area is ready for the club workflow and will use the same dashboard navigation.</p></div></main></MainLayout>
}
