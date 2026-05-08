import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarCheck, FileText, Route, Send, UserRoundCheck } from 'lucide-react';
import { useData } from '../app/DataContext';
import { completionScore, formatDate } from '../lib/helpers';
import { Button, Card, CardHeader, ProgressBar, SectionHeader, StatusBadge, StatusTimeline } from '../components/ui';

export default function ClientCardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLead, updateLeadStatus } = useData();
  const lead = id ? getLead(id) : undefined;
  if (!lead) return <div>Клиент не найден.</div>;
  const score = completionScore(lead);

  return <div>
    <SectionHeader title={lead.student.fullName} subtitle={`${lead.qualification.programLevel} · ${lead.qualification.targetCountry} · ${lead.qualification.targetMajor}`} action={<StatusBadge status={lead.status} />} />
    <div className="mb-6 grid gap-4 lg:grid-cols-4">
      <Card><p className="text-sm text-slate-500">Готовность заключения</p><p className="mt-2 text-3xl font-black">{score}%</p><div className="mt-3"><ProgressBar value={score} /></div></Card>
      <Card><p className="text-sm text-slate-500">Шанс</p><p className="mt-2 font-bold text-slate-950">{lead.report.chanceAssessment.chanceLevel}</p><p className="mt-1 text-xs text-slate-500">{lead.report.chanceAssessment.confidenceLevel}</p></Card>
      <Card><p className="text-sm text-slate-500">Дата диагностики</p><p className="mt-2 font-bold text-slate-950">{formatDate(lead.session.scheduledAt)}</p><p className="mt-1 text-xs text-slate-500">{lead.session.format}</p></Card>
      <Card><p className="text-sm text-slate-500">Офер</p><p className="mt-2 font-bold text-slate-950">{lead.report.offer.offerStatus}</p><p className="mt-1 text-xs text-slate-500">{lead.report.offer.tariff || 'Тариф не выбран'}</p></Card>
    </div>
    <Card className="mb-6"><CardHeader title="Быстрые действия" subtitle="Управление клиентом без потери контекста." />
      <div className="flex flex-wrap gap-3">
        <Link to={`/clients/${lead.id}/qualification`}><Button><UserRoundCheck className="h-4 w-4" />Заполнить квалификацию</Button></Link>
        <Button variant="secondary" onClick={()=>updateLeadStatus(lead.id,'Передано диагносту','МОП','Передано диагносту из карточки клиента')}><Send className="h-4 w-4" />Передать диагносту</Button>
        <Link to={`/clients/${lead.id}/diagnostic`}><Button variant="secondary"><Route className="h-4 w-4" />Открыть диагностику</Button></Link>
        <Button variant="secondary" onClick={()=>{updateLeadStatus(lead.id,'Заключение в работе','Диагност','Начата подготовка заключения'); navigate(`/clients/${lead.id}/diagnostic`);}}><CalendarCheck className="h-4 w-4" />Сформировать заключение</Button>
        <Link to={`/clients/${lead.id}/report`}><Button variant="success"><FileText className="h-4 w-4" />Клиентская версия</Button></Link>
      </div>
    </Card>
    <div className="grid gap-6 lg:grid-cols-2">
      <InfoCard title="Основная информация" rows={[['Класс / курс',lead.student.gradeOrYear],['Возраст',String(lead.student.age)],['Город / страна',`${lead.student.city}, ${lead.student.country}`],['Школа / вуз',lead.student.currentSchool],['Кто принимает решение',lead.student.decisionRole]]} />
      <InfoCard title="Контакты" rows={[['Родитель',lead.parent.fullName],['Телефон',lead.parent.phone],['Мессенджер',lead.parent.messenger],['Email',lead.parent.email],['Контакт ученика',lead.student.studentContact]]} />
      <InfoCard title="Образовательный запрос" rows={[['Страна',lead.qualification.targetCountry],['Приоритет Китая',lead.qualification.chinaPriority],['Уровень программы',lead.qualification.programLevel],['Год поступления',lead.qualification.desiredIntakeYear],['Язык',lead.qualification.desiredLanguage],['Направление',lead.qualification.targetMajor]]} />
      <InfoCard title="Академический профиль" rows={[['Средний балл',lead.qualification.averageGrade],['Сильные предметы',lead.qualification.strongSubjects],['Слабые предметы',lead.qualification.weakSubjects],['Портфолио',lead.qualification.portfolio],['Мотивация',lead.qualification.motivation]]} />
      <InfoCard title="Языковой профиль" rows={[['Английский',lead.qualification.englishLevel],['Экзамен',lead.qualification.englishExam],['Китайский',lead.qualification.chineseLevel],['HSK',lead.qualification.hsk],['Готовность учить китайский',lead.qualification.readyToLearnChinese]]} />
      <InfoCard title="Финансы и боли" rows={[['Финансовый сценарий',lead.qualification.budgetType],['Бюджет',lead.qualification.budgetAmount],['Срочность',lead.qualification.urgency],['Страхи',lead.qualification.fears],['Критерии выбора',lead.qualification.selectionCriteria]]} />
      <Card className="lg:col-span-2"><CardHeader title="История статусов" /><StatusTimeline items={lead.statusHistory} /></Card>
    </div>
  </div>;
}
function InfoCard({ title, rows }: { title:string; rows:[string,string|undefined][] }) {
  return <Card><CardHeader title={title} />{rows.map(([l,v]) => <div key={l} className="mb-3 border-b border-slate-100 pb-3 last:mb-0 last:border-b-0 last:pb-0"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{l}</p><p className="mt-1 text-sm text-slate-800">{v || '—'}</p></div>)}</Card>;
}
