import { useParams } from 'react-router-dom';
import { Download, ShieldCheck } from 'lucide-react';
import { useData } from '../app/DataContext';
import { formatDate, formatMoney } from '../lib/helpers';
import { Badge, Button, Card, CardHeader, SectionHeader, Timeline } from '../components/ui';

export default function ClientReportPage() {
  const { id } = useParams();
  const { getLead, updateLeadStatus } = useData();
  const lead = id ? getLead(id) : undefined;
  if (!lead) return <div>Заключение не найдено.</div>;
  const report = lead.report;
  const visiblePains = report.painSolutions.filter(p => p.visibleToClient);
  const visibleRoadmap = report.roadmap.filter(r => r.visibleToClient);
  const print = () => { updateLeadStatus(lead.id, 'Отправлено клиенту', 'Система', 'Клиентская версия открыта/отправлена.'); window.print(); };

  return <div>
    <div className="no-print"><SectionHeader title="Клиентская версия диагностического заключения" subtitle="Без внутренних комментариев, служебных CRM-полей и скрытых заметок продаж." action={<Button onClick={print}><Download className="h-4 w-4" />Скачать / распечатать PDF</Button>} /></div>
    <div className="print-page mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-10">
      <section className="rounded-3xl bg-gradient-to-br from-eastside-navy to-blue-700 p-8 text-white">
        <img src="/logo-placeholder.svg" alt="EastSide" className="mb-10 h-12 w-auto" />
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-200">Персональное диагностическое заключение</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight">Ваша стратегия поступления за рубеж</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <CoverInfo label="Ученик" value={lead.student.fullName} />
          <CoverInfo label="Направление" value={lead.qualification.targetMajor} />
          <CoverInfo label="Дата" value={formatDate(lead.session.completedAt || lead.session.scheduledAt)} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader title="Краткое резюме" /><p className="leading-7 text-slate-700">{report.clientSummary || 'Резюме будет сформировано диагностом после консультации.'}</p></Card>
        <Card><CardHeader title="Предварительная оценка" /><Badge tone="blue">{report.chanceAssessment.chanceLevel}</Badge><p className="mt-4 text-sm leading-6 text-slate-600">{report.chanceAssessment.why}</p></Card>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <ReportBlock title="Исходная ситуация" text={report.currentSituation || `${lead.student.gradeOrYear}, направление: ${lead.qualification.targetMajor}, язык: ${lead.qualification.desiredLanguage}.`} />
        <ReportBlock title="Цель клиента" text={`Поступление: ${lead.qualification.programLevel}. Страна: ${lead.qualification.targetCountry}. Год: ${lead.qualification.desiredIntakeYear}. Финансовый сценарий: ${lead.qualification.budgetType}.`} />
        <ReportBlock title="Точка А" text={report.currentPointA} />
        <ReportBlock title="Точка Б" text={report.targetPointB} />
        <ReportBlock title="Разрыв" text={report.gapAnalysis} />
        <ReportBlock title="Возможности" text={report.opportunities} />
      </section>

      <section className="mt-6"><Card><CardHeader title="Шансы, риски и что усиливает заявку" />
        <div className="grid gap-4 md:grid-cols-3">
          <Mini title="Усиливает" text={report.chanceAssessment.positiveFactors} tone="green" />
          <Mini title="Ослабляет" text={report.chanceAssessment.negativeFactors} tone="yellow" />
          <Mini title="Что улучшить" text={report.chanceAssessment.requiredImprovements} tone="blue" />
        </div>
        <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-800"><b>Ключевые риски:</b> {report.chanceAssessment.risks}</div>
      </Card></section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <ReportBlock title="Рекомендуемая стратегия" text={report.strategySummary || report.mainStrategy} />
        <ReportBlock title="Резервная стратегия" text={report.backupStrategy} />
        <ReportBlock title="Языковая стратегия" text={report.languageStrategy} />
        <ReportBlock title="Финансовая стратегия" text={report.fundingStrategy} />
        <ReportBlock title="План по портфолио" text={report.portfolioStrategy} />
        <ReportBlock title="План по документам" text={report.documentStrategy} />
      </section>

      <section className="mt-6 page-break"><Card><CardHeader title="Предварительный подбор университетов" subtitle="Финальный список формируется после проверки актуальных программ, требований, дедлайнов и финансовых условий." />
        <div className="grid gap-4 md:grid-cols-2">
          {report.universities.map(u => <div key={u.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-black text-slate-950">{u.universityName || 'Университет не указан'}</h4><Badge tone={u.verificationStatus==='Подтверждено'?'green':u.verificationStatus==='Устарело'?'red':'yellow'}>{u.verificationStatus}</Badge></div>
            <p className="mt-1 text-sm text-slate-500">{u.city}, {u.country} · {u.programLevel} · {u.language}</p>
            <div className="mt-3 flex flex-wrap gap-2"><Badge tone="blue">{u.realismStatus}</Badge><Badge>{u.fundingType || 'финансирование уточняется'}</Badge></div>
            <p className="mt-3 text-sm leading-6 text-slate-700"><b>Почему подходит:</b> {u.fitReason || 'Требуется дополнительная проверка.'}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600"><b>Риски:</b> {u.risks || 'Нет данных.'}</p>
          </div>)}
          {!report.universities.length && <p className="text-sm text-slate-500">Предварительные университеты будут добавлены после диагностики.</p>}
        </div>
      </Card></section>

      <section className="mt-6"><Card><CardHeader title="Дорожная карта" subtitle="Помесячный план подготовки и поступления." /><Timeline items={visibleRoadmap} /></Card></section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <Card><CardHeader title="Как EastSide закрывает ваши боли" /><div className="space-y-4">{visiblePains.map(p => <div key={p.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold text-slate-950">{p.pain}</p><p className="mt-2 text-sm text-slate-700"><b>Решение:</b> {p.solution}</p><p className="mt-2 text-sm text-slate-700"><b>EastSide:</b> {p.eastsideAction}</p></div>)}</div></Card>
        <Card><CardHeader title="Рекомендованный продукт EastSide" />
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-eastside-blue" /><h4 className="font-black text-slate-950">{report.offer.recommendedProduct || 'Продукт будет предложен после диагностики'}</h4></div>
          <p className="mt-4 text-sm leading-6 text-slate-700">{report.offer.whyFits}</p>
          <div className="mt-4 rounded-2xl bg-eastside-sky p-4"><p className="text-sm font-bold text-eastside-navy">Тариф: {report.offer.tariff}</p><p className="mt-1 text-2xl font-black text-eastside-navy">{formatMoney(report.offer.price)}</p></div>
          <p className="mt-4 text-sm leading-6 text-slate-700"><b>Что входит:</b> {report.offer.includedServices}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700"><b>Ожидаемый результат:</b> {report.offer.expectedResult}</p>
        </Card>
      </section>

      <section className="mt-6 rounded-3xl bg-slate-950 p-6 text-white"><h3 className="text-2xl font-black">Следующие шаги</h3><p className="mt-3 max-w-3xl leading-7 text-slate-200">{report.offer.nextStep || 'Подтвердить маршрут, согласовать формат сопровождения и запустить подготовку документов.'}</p></section>
    </div>
  </div>;
}
function CoverInfo({ label, value }: { label:string; value:string }) { return <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-200">{label}</p><p className="mt-1 font-bold">{value}</p></div>; }
function ReportBlock({ title, text }: { title:string; text?:string }) { return <Card><CardHeader title={title} /><p className="text-sm leading-6 text-slate-700">{text || 'Будет дополнено диагностом.'}</p></Card>; }
function Mini({ title, text, tone }: { title:string; text:string; tone:'green'|'yellow'|'blue' }) {
  const bg = tone==='green' ? 'bg-emerald-50 text-emerald-800' : tone==='yellow' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800';
  return <div className={`${bg} rounded-2xl p-4`}><p className="font-bold">{title}</p><p className="mt-2 text-sm leading-6">{text}</p></div>;
}
