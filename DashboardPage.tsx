import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useData } from '../app/DataContext';
import { COUNTRIES, PROGRAM_LEVELS, REPORT_STATUSES } from '../lib/constants';
import { formatDate, getLeadOfferStatus } from '../lib/helpers';
import { Badge, Button, Card, Input, SectionHeader, Select, StatusBadge } from '../components/ui';

export default function DashboardPage() {
  const { leads } = useData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [program, setProgram] = useState('');
  const [country, setCountry] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [chance, setChance] = useState('');
  const [offer, setOffer] = useState('');
  const diagnostics = Array.from(new Set(leads.map(l => l.assignedDiagnosticName)));
  const offers = Array.from(new Set(leads.map(l => l.report.offer.offerStatus)));
  const chances = Array.from(new Set(leads.map(l => l.report.chanceAssessment.chanceLevel)));

  const filtered = useMemo(() => leads.filter(lead => {
    const haystack = `${lead.student.fullName} ${lead.qualification.targetMajor} ${lead.qualification.targetCountry} ${lead.assignedDiagnosticName}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase()))
      && (!status || lead.status === status)
      && (!program || lead.qualification.programLevel === program)
      && (!country || lead.qualification.targetCountry === country)
      && (!diagnostic || lead.assignedDiagnosticName === diagnostic)
      && (!chance || lead.report.chanceAssessment.chanceLevel === chance)
      && (!offer || lead.report.offer.offerStatus === offer);
  }), [leads, query, status, program, country, diagnostic, chance, offer]);

  return <div>
    <SectionHeader title="Диагностические заключения EastSide" subtitle="Единый поток: первичная квалификация МОП → экспертная диагностика → дорожная карта → университеты → офер → клиентская версия." action={<Badge tone="blue">{filtered.length} клиентов</Badge>} />
    <Card className="mb-5">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
        <div className="relative lg:col-span-2"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по клиенту, направлению, стране" className="pl-9" /></div>
        <Select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Все статусы</option>{REPORT_STATUSES.map(s => <option key={s}>{s}</option>)}</Select>
        <Select value={program} onChange={e=>setProgram(e.target.value)}><option value="">Все программы</option>{PROGRAM_LEVELS.map(s => <option key={s}>{s}</option>)}</Select>
        <Select value={country} onChange={e=>setCountry(e.target.value)}><option value="">Все страны</option>{COUNTRIES.map(s => <option key={s}>{s}</option>)}</Select>
        <Select value={diagnostic} onChange={e=>setDiagnostic(e.target.value)}><option value="">Все диагносты</option>{diagnostics.map(s => <option key={s}>{s}</option>)}</Select>
        <Select value={chance} onChange={e=>setChance(e.target.value)}><option value="">Все шансы</option>{chances.map(s => <option key={s}>{s}</option>)}</Select>
        <Select value={offer} onChange={e=>setOffer(e.target.value)}><option value="">Все оферы</option>{offers.map(s => <option key={s}>{s}</option>)}</Select>
      </div>
    </Card>

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Ученик</th><th className="px-4 py-3">Программа</th><th className="px-4 py-3">Страна</th><th className="px-4 py-3">Направление</th><th className="px-4 py-3">Язык</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3">МОП</th><th className="px-4 py-3">Диагност</th><th className="px-4 py-3">Диагностика</th><th className="px-4 py-3">Офер</th><th className="px-4 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(lead => <tr key={lead.id} className="hover:bg-slate-50">
              <td className="px-4 py-4"><div className="font-bold text-slate-950">{lead.student.fullName}</div><div className="text-xs text-slate-500">{lead.student.gradeOrYear} · {lead.leadTemperature}</div></td>
              <td className="px-4 py-4">{lead.qualification.programLevel}</td>
              <td className="px-4 py-4">{lead.qualification.targetCountry}</td>
              <td className="px-4 py-4">{lead.qualification.targetMajor}</td>
              <td className="px-4 py-4">{lead.qualification.desiredLanguage}</td>
              <td className="px-4 py-4"><StatusBadge status={lead.status} /></td>
              <td className="px-4 py-4">{lead.assignedMopName}</td>
              <td className="px-4 py-4">{lead.assignedDiagnosticName}</td>
              <td className="px-4 py-4">{formatDate(lead.session.scheduledAt)}</td>
              <td className="px-4 py-4"><Badge tone={getLeadOfferStatus(lead)==='Купил'?'green':getLeadOfferStatus(lead)==='Отказ'?'red':'purple'}>{getLeadOfferStatus(lead)}</Badge></td>
              <td className="px-4 py-4"><Link to={`/clients/${lead.id}`}><Button variant="secondary">Открыть</Button></Link></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
}
