import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { Inbox, X } from 'lucide-react';
import type { ReportStatus, RoadmapItem, StatusHistoryItem } from '../../types';
import { cn, formatDate, statusTone } from '../../lib/helpers';

export function Button({ children, className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'primary'|'secondary'|'ghost'|'danger'|'success' }) {
  const variants = {
    primary:'bg-eastside-navy text-white hover:bg-slate-800',
    secondary:'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50',
    ghost:'bg-transparent text-slate-600 hover:bg-slate-100',
    danger:'bg-red-600 text-white hover:bg-red-700',
    success:'bg-emerald-600 text-white hover:bg-emerald-700'
  };
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50', variants[variant], className)} {...props}>{children}</button>;
}
export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-soft', className)} {...props}>{children}</div>;
}
export function CardHeader({ title, subtitle, action }: { title:string; subtitle?:string; action?:ReactNode }) {
  return <div className="mb-4 flex items-start justify-between gap-4"><div><h3 className="text-lg font-bold text-slate-950">{title}</h3>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>{action}</div>;
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-eastside-blue/20 transition placeholder:text-slate-400 focus:border-eastside-blue focus:ring-4', props.className)} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-eastside-blue/20 transition placeholder:text-slate-400 focus:border-eastside-blue focus:ring-4', props.className)} />;
}
export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-eastside-blue/20 transition focus:border-eastside-blue focus:ring-4', props.className)}>{children}</select>;
}
export function Badge({ children, tone='gray', className }: { children:ReactNode; tone?: 'gray'|'blue'|'green'|'yellow'|'red'|'purple'; className?:string }) {
  const tones = { gray:'bg-slate-100 text-slate-700', blue:'bg-blue-100 text-blue-700', green:'bg-emerald-100 text-emerald-700', yellow:'bg-amber-100 text-amber-800', red:'bg-red-100 text-red-700', purple:'bg-violet-100 text-violet-700' };
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}>{children}</span>;
}
export function StatusBadge({ status }: { status: ReportStatus }) { return <Badge tone={statusTone(status)}>{status}</Badge>; }
export function SectionHeader({ title, subtitle, action }: { title:string; subtitle?:string; action?:ReactNode }) {
  return <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-eastside-blue">EastSide diagnostic platform</p><h1 className="mt-1 text-2xl font-black text-slate-950 md:text-3xl">{title}</h1>{subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>}</div>{action}</div>;
}
export function Tabs({ tabs, value, onChange }: { tabs:{value:string;label:string}[]; value:string; onChange:(v:string)=>void }) {
  return <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">{tabs.map(t => <button key={t.value} onClick={()=>onChange(t.value)} className={cn('min-w-fit rounded-xl px-3 py-2 text-sm font-semibold transition', value===t.value ? 'bg-eastside-navy text-white' : 'text-slate-600 hover:bg-slate-100')}>{t.label}</button>)}</div>;
}
export function EmptyState({ title, text }: { title:string; text:string }) {
  return <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Inbox className="mb-3 h-10 w-10 text-slate-400" /><h3 className="text-lg font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p></div>;
}
export function ProgressBar({ value }: { value:number }) {
  return <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-eastside-blue transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}
export function Field({ label, children, hint }: { label:string; children:ReactNode; hint?:string }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{children}{hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}</label>;
}
export function FormGrid({ children }: { children:ReactNode }) { return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>; }

export function Timeline({ items }: { items:RoadmapItem[] }) {
  return <div className="space-y-3">{items.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-wide text-eastside-blue">{item.month}</p><h4 className="mt-1 font-bold text-slate-950">{item.title}</h4></div><Badge tone={item.status === 'Готово' ? 'green' : item.status === 'Риск задержки' ? 'red' : 'blue'}>{item.status}</Badge></div><p className="mt-2 text-sm text-slate-600">{item.description}</p><p className="mt-3 text-xs text-slate-500">Ответственный: {item.responsibleRole} · Дедлайн: {formatDate(item.deadline)}</p></div>)}</div>;
}
export function StatusTimeline({ items }: { items:StatusHistoryItem[] }) {
  return <div className="space-y-3">{items.map(item => <div key={item.id} className="border-l-2 border-eastside-blue pl-4"><div className="flex flex-wrap items-center gap-2"><Badge tone="blue">{item.status}</Badge><span className="text-xs text-slate-500">{formatDate(item.date)} · {item.actor}</span></div><p className="mt-1 text-sm text-slate-600">{item.comment}</p></div>)}</div>;
}


export function Modal({ open, title, children, onClose }: { open:boolean; title:string; children:ReactNode; onClose:()=>void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Закрыть"><X className="h-5 w-5" /></button>
      </div>
      {children}
    </div>
  </div>;
}
