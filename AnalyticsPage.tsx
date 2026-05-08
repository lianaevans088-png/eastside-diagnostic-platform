import type { ReactNode } from 'react';
import { CircleDollarSign, FileCheck2, GraduationCap, Target, TrendingUp, Users } from 'lucide-react';
import { useData } from '../app/DataContext';
import { analyticsFromLeads, formatMoney, topValues } from '../lib/helpers';
import { Card, CardHeader, ProgressBar, SectionHeader } from '../components/ui';

export default function AnalyticsPage() {
  const { leads } = useData();
  const a = analyticsFromLeads(leads);
  const topMajors = topValues(leads, l => l.qualification.targetMajor);
  const topCountries = topValues(leads, l => l.qualification.targetCountry);
  const topPains = topValues(leads, l => l.qualification.fears || l.qualification.whyAbroad);
  const topRisks = topValues(leads, l => l.report.chanceAssessment.risks);
  return <div>
    <SectionHeader title="Аналитика диагностик" subtitle="MVP-дашборд: продажи, клиенты, продукты, боли и риски. Расчеты строятся на текущих данных приложения." />
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<Users />} label="Всего лидов" value={`${a.total}`} />
      <Metric icon={<Target />} label="Диагностик назначено" value={`${a.diagnosticsScheduled}`} />
      <Metric icon={<FileCheck2 />} label="Заключений создано" value={`${a.reportsCreated}`} />
      <Metric icon={<CircleDollarSign />} label="Оплат получено" value={`${a.paid}`} />
      <Metric icon={<TrendingUp />} label="Диагностика → офер" value={`${a.diagnosticToOffer}%`} />
      <Metric icon={<TrendingUp />} label="Офер → покупка" value={`${a.offerToPayment}%`} />
      <Metric icon={<CircleDollarSign />} label="Средний чек" value={formatMoney(a.avgCheck)} />
      <Metric icon={<GraduationCap />} label="Оферов сделано" value={`${a.offersMade}`} />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <TopList title="Популярные направления" items={topMajors} />
      <TopList title="Популярные страны" items={topCountries} />
      <TopList title="Частые боли" items={topPains} />
      <TopList title="Частые риски" items={topRisks} />
    </div>
  </div>;
}
function Metric({ icon, label, value }: { icon:ReactNode; label:string; value:string }) {
  return <Card><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-eastside-sky text-eastside-blue">{icon}</div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-slate-950">{value}</p></Card>;
}
function TopList({ title, items }: { title:string; items:[string,number][] }) {
  const max = Math.max(1, ...items.map(([,v])=>v));
  return <Card><CardHeader title={title} /><div className="space-y-4">{items.map(([label,value]) => <div key={label}><div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-slate-700">{label}</span><span className="text-slate-500">{value}</span></div><ProgressBar value={(value/max)*100} /></div>)}</div></Card>;
}
