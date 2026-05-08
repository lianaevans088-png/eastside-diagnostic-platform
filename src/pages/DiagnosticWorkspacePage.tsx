import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bot, Eye, Plus, Save, WandSparkles } from 'lucide-react';
import { useData } from '../app/DataContext';
import type { DiagnosticReport, PainSolution, RoadmapItem, UniversityRecommendation } from '../types';
import { CHANCE_LEVELS, OFFER_STATUSES, REALISM_STATUSES, ROADMAP_STATUSES, VERIFICATION_STATUSES } from '../lib/constants';
import { makeId } from '../lib/helpers';
import { Badge, Button, Card, CardHeader, Field, FormGrid, Input, SectionHeader, Select, StatusBadge, Tabs, Textarea, Timeline } from '../components/ui';

const tabs = [
  { value:'summary', label:'Сводка' }, { value:'mop', label:'Данные МОП' }, { value:'expert', label:'Экспертная диагностика' },
  { value:'chances', label:'Шансы и риски' }, { value:'pains', label:'Боли и решения' }, { value:'universities', label:'Университеты' },
  { value:'roadmap', label:'Дорожная карта' }, { value:'offer', label:'Офер' }, { value:'client', label:'Клиентская версия' }, { value:'internal', label:'Внутренние комментарии' }
];

export default function DiagnosticWorkspacePage() {
  const { id } = useParams();
  const { getLead, updateLead, updateLeadStatus, role } = useData();
  const lead = id ? getLead(id) : undefined;
  const [active, setActive] = useState('summary');
  const [saved, setSaved] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  if (!lead) return <div>Клиент не найден.</div>;
  const report = lead.report;
  const isClient = role === 'client';

  const setReport = (updater:(r:DiagnosticReport)=>DiagnosticReport) => {
    updateLead(lead.id, current => ({...current, report:{...updater(current.report), updatedAt:new Date().toISOString()}}));
    setSaved(true); window.setTimeout(()=>setSaved(false), 1000);
  };
  const setField = <K extends keyof DiagnosticReport>(key:K, value:DiagnosticReport[K]) => setReport(r => ({...r,[key]:value}));
  const setChanceField = <K extends keyof DiagnosticReport['chanceAssessment']>(key:K, value:DiagnosticReport['chanceAssessment'][K]) => setReport(r => ({...r, chanceAssessment:{...r.chanceAssessment,[key]:value}}));
  const setOfferField = <K extends keyof DiagnosticReport['offer']>(key:K, value:DiagnosticReport['offer'][K]) => setReport(r => ({...r, offer:{...r.offer,[key]:value}}));
  const addPain = () => setReport(r => ({...r, painSolutions:[...r.painSolutions,{id:makeId('pain'), pain:'', solution:'', eastsideAction:'', priority:'Средний', visibleToClient:true}]}));
  const updatePain = (item:PainSolution) => setReport(r => ({...r, painSolutions:r.painSolutions.map(p=>p.id===item.id ? item : p)}));
  const addUni = () => setReport(r => ({...r, universities:[...r.universities,{id:makeId('uni'), universityName:'', city:'', country:'Китай', direction:'', programName:'', language:'', programLevel:lead.qualification.programLevel, fundingType:'', tuitionEstimate:'', scholarshipAvailable:'', requirementsSummary:'', fitReason:'', realismStatus:'Реалистичный', risks:'', diagnosticComment:'', verificationStatus:'Требует проверки'}]}));
  const updateUni = (item:UniversityRecommendation) => setReport(r => ({...r, universities:r.universities.map(u=>u.id===item.id ? item : u)}));
  const addRoad = () => setReport(r => ({...r, roadmap:[...r.roadmap,{id:makeId('road'), month:'', title:'', description:'', responsibleRole:'EastSide + клиент', deadline:'', status:'Не начато', visibleToClient:true}]}));
  const updateRoad = (item:RoadmapItem) => setReport(r => ({...r, roadmap:r.roadmap.map(rd=>rd.id===item.id ? item : rd)}));
  const ai = (msg:string) => setAiMessage(msg);

  return <div>
    <SectionHeader title={`Рабочее пространство диагноста — ${lead.student.fullName}`} subtitle="Экспертный слой: шансы, стратегия, боли, университеты, дорожная карта и офер. Клиент видит только клиентскую версию." action={<div className="flex items-center gap-2"><StatusBadge status={lead.status} />{saved && <Badge tone="green">Сохранено</Badge>}</div>} />
    <div className="mb-5"><Tabs tabs={tabs} value={active} onChange={setActive} /></div>

    {active === 'summary' && <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2"><CardHeader title="Сводка клиента" />
        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Программа" value={lead.qualification.programLevel} /><Info label="Страна" value={lead.qualification.targetCountry} />
          <Info label="Направление" value={lead.qualification.targetMajor} /><Info label="Язык" value={lead.qualification.desiredLanguage} />
          <Info label="Средний балл" value={lead.qualification.averageGrade} /><Info label="Бюджет" value={lead.qualification.budgetType} />
        </div>
        <div className="mt-4"><Field label="Клиентское резюме"><Textarea value={report.clientSummary} onChange={e=>setField('clientSummary',e.target.value)} /></Field></div>
        <div className="mt-4 flex gap-3"><Button onClick={()=>updateLeadStatus(lead.id,'Заключение готово','Диагност','Заключение подготовлено')}><Save className="h-4 w-4" />Отметить готовым</Button><Link to={`/clients/${lead.id}/report`}><Button variant="secondary"><Eye className="h-4 w-4" />Клиентская версия</Button></Link></div>
      </Card>
      <Card className="bg-slate-950 text-white"><CardHeader title="AI-помощник, mock-режим" subtitle="Кнопки-заглушки под будущий AI-модуль." />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={()=>{ setField('clientSummary','AI-черновик: клиенту нужна управляемая стратегия поступления, проверка шансов, подбор университетов и дорожная карта подготовки. Перед отправкой клиенту диагност должен проверить факты и формулировки.'); ai('AI-резюме создано. Проверьте текст перед отправкой клиенту.'); }}><WandSparkles className="h-4 w-4" />Сформировать резюме</Button>
          <Button variant="secondary" onClick={()=>ai('Противоречия: язык обучения английский, но сертификат отсутствует; грант желателен, но бюджет не уточнен.')}><Bot className="h-4 w-4" />Найти противоречия</Button>
          <Button variant="secondary" onClick={()=>ai('Вопросы диагносту: готов ли клиент к языковому году? насколько гибок бюджет? какие дедлайны критичны?')}><Bot className="h-4 w-4" />Предложить вопросы</Button>
          <Button variant="secondary" onClick={()=>ai('Дорожная карта: язык → документы → портфель вузов → мотивационные письма → подача → интервью → виза.')}><Bot className="h-4 w-4" />Сгенерировать карту</Button>
          <Button variant="secondary" onClick={()=>ai('Офер: связать продукт EastSide с рисками выбора вузов, документов, гранта и дедлайнов.')}><Bot className="h-4 w-4" />Сформулировать офер</Button>
        </div>
        {aiMessage && <p className="mt-4 rounded-xl bg-white/10 p-3 text-sm text-blue-50">{aiMessage}</p>}
      </Card>
    </div>}

    {active === 'mop' && <Card><CardHeader title="Данные МОП" subtitle="Базовый слой, который диагност проверяет и уточняет." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Info label="Комментарий МОП" value={lead.qualification.mopComment} /><Info label="Почему за рубеж" value={lead.qualification.whyAbroad} /><Info label="Страхи" value={lead.qualification.fears} /><Info label="Сомнения" value={lead.qualification.doubts} /><Info label="Родительские приоритеты" value={lead.qualification.parentPriorities} /><Info label="Критерии выбора" value={lead.qualification.selectionCriteria} />
      </div>
    </Card>}

    {active === 'expert' && <Card><CardHeader title="Экспертная диагностика" />
      <div className="grid gap-4 md:grid-cols-2">
        {([
          ['currentSituation','Текущая образовательная ситуация'], ['currentPointA','Точка А'], ['targetPointB','Точка Б'], ['gapAnalysis','Разрыв'],
          ['limitations','Главные ограничения'], ['opportunities','Главные возможности']
        ] as [keyof DiagnosticReport,string][]).map(([key,label]) => <Field key={String(key)} label={label}><Textarea value={String(report[key] || '')} onChange={e=>setField(key, e.target.value as never)} /></Field>)}
        <Field label="Самостоятельность ученика"><Input value={report.studentAutonomy} onChange={e=>setField('studentAutonomy',e.target.value)} /></Field>
        <Field label="Вовлеченность родителей"><Input value={report.parentInvolvement} onChange={e=>setField('parentInvolvement',e.target.value)} /></Field>
        <Field label="Готовность семьи"><Input value={report.familyReadiness} onChange={e=>setField('familyReadiness',e.target.value)} /></Field>
      </div>
    </Card>}

    {active === 'chances' && <Card><CardHeader title="Оценка шансов и рисков" /><FormGrid>
      <Field label="Уровень шанса"><Select value={report.chanceAssessment.chanceLevel} onChange={e=>setChanceField('chanceLevel',e.target.value as DiagnosticReport['chanceAssessment']['chanceLevel'])}>{CHANCE_LEVELS.map(v=><option key={v}>{v}</option>)}</Select></Field>
      <Field label="Внутренний score 0–100"><Input type="number" value={report.chanceAssessment.chanceScore} onChange={e=>setChanceField('chanceScore',Number(e.target.value))} /></Field>
      <Field label="Уверенность оценки"><Input value={report.chanceAssessment.confidenceLevel} onChange={e=>setChanceField('confidenceLevel',e.target.value)} /></Field>
    </FormGrid>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(['why','positiveFactors','negativeFactors','requiredImprovements','criticalDeadlines','documentRequirements','examRequirements','risks'] as const).map(k => <Field key={k} label={{why:'Почему такие шансы',positiveFactors:'Что усиливает кандидата',negativeFactors:'Что ослабляет кандидата',requiredImprovements:'Что нужно улучшить',criticalDeadlines:'Критичные дедлайны',documentRequirements:'Нужные документы',examRequirements:'Экзамены',risks:'Риски'}[k]}><Textarea value={report.chanceAssessment[k]} onChange={e=>setChanceField(k,e.target.value)} /></Field>)}
      </div>
    </Card>}

    {active === 'pains' && <Card><CardHeader title="Боли и решения" action={<Button onClick={addPain}><Plus className="h-4 w-4" />Добавить боль</Button>} />
      <div className="space-y-4">{report.painSolutions.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="grid gap-4 md:grid-cols-2">
        <Field label="Боль клиента"><Textarea value={item.pain} onChange={e=>updatePain({...item,pain:e.target.value})} /></Field>
        <Field label="Решение в дорожной карте"><Textarea value={item.solution} onChange={e=>updatePain({...item,solution:e.target.value})} /></Field>
        <Field label="Как закрывает EastSide"><Textarea value={item.eastsideAction} onChange={e=>updatePain({...item,eastsideAction:e.target.value})} /></Field>
        <Field label="Приоритет"><Select value={item.priority} onChange={e=>updatePain({...item,priority:e.target.value as PainSolution['priority']})}><option>Высокий</option><option>Средний</option><option>Низкий</option></Select></Field>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={item.visibleToClient} onChange={e=>updatePain({...item,visibleToClient:e.target.checked})} /> Видно клиенту</label>
      </div></div>)}</div>
    </Card>}

    {active === 'universities' && <Card><CardHeader title="Предварительный подбор университетов" subtitle="Каждый университет имеет статус проверки. Неподтвержденные данные не выдаются как факт." action={<Button onClick={addUni}><Plus className="h-4 w-4" />Добавить вуз</Button>} />
      <div className="space-y-5">{report.universities.map(u => <div key={u.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <FormGrid>
          <Field label="Название университета"><Input value={u.universityName} onChange={e=>updateUni({...u,universityName:e.target.value})} /></Field>
          <Field label="Город"><Input value={u.city} onChange={e=>updateUni({...u,city:e.target.value})} /></Field>
          <Field label="Страна"><Input value={u.country} onChange={e=>updateUni({...u,country:e.target.value})} /></Field>
          <Field label="Направление"><Input value={u.direction} onChange={e=>updateUni({...u,direction:e.target.value})} /></Field>
          <Field label="Программа"><Input value={u.programName} onChange={e=>updateUni({...u,programName:e.target.value})} /></Field>
          <Field label="Язык"><Input value={u.language} onChange={e=>updateUni({...u,language:e.target.value})} /></Field>
          <Field label="Финансирование"><Input value={u.fundingType} onChange={e=>updateUni({...u,fundingType:e.target.value})} /></Field>
          <Field label="Стоимость"><Input value={u.tuitionEstimate} onChange={e=>updateUni({...u,tuitionEstimate:e.target.value})} /></Field>
          <Field label="Грант"><Input value={u.scholarshipAvailable} onChange={e=>updateUni({...u,scholarshipAvailable:e.target.value})} /></Field>
          <Field label="Реалистичность"><Select value={u.realismStatus} onChange={e=>updateUni({...u,realismStatus:e.target.value as UniversityRecommendation['realismStatus']})}>{REALISM_STATUSES.map(v=><option key={v}>{v}</option>)}</Select></Field>
          <Field label="Статус проверки"><Select value={u.verificationStatus} onChange={e=>updateUni({...u,verificationStatus:e.target.value as UniversityRecommendation['verificationStatus']})}>{VERIFICATION_STATUSES.map(v=><option key={v}>{v}</option>)}</Select></Field>
        </FormGrid>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Требования"><Textarea value={u.requirementsSummary} onChange={e=>updateUni({...u,requirementsSummary:e.target.value})} /></Field>
          <Field label="Почему подходит"><Textarea value={u.fitReason} onChange={e=>updateUni({...u,fitReason:e.target.value})} /></Field>
          <Field label="Риски"><Textarea value={u.risks} onChange={e=>updateUni({...u,risks:e.target.value})} /></Field>
          <Field label="Комментарий диагноста"><Textarea value={u.diagnosticComment} onChange={e=>updateUni({...u,diagnosticComment:e.target.value})} /></Field>
        </div>
      </div>)}</div>
    </Card>}

    {active === 'roadmap' && <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader title="Конструктор дорожной карты" action={<Button onClick={addRoad}><Plus className="h-4 w-4" />Добавить этап</Button>} />
      <div className="space-y-4">{report.roadmap.map(item => <div key={item.id} className="rounded-2xl border border-slate-200 p-4"><FormGrid>
        <Field label="Месяц"><Input value={item.month} onChange={e=>updateRoad({...item,month:e.target.value})} /></Field>
        <Field label="Задача"><Input value={item.title} onChange={e=>updateRoad({...item,title:e.target.value})} /></Field>
        <Field label="Ответственный"><Input value={item.responsibleRole} onChange={e=>updateRoad({...item,responsibleRole:e.target.value})} /></Field>
        <Field label="Дедлайн"><Input type="date" value={item.deadline} onChange={e=>updateRoad({...item,deadline:e.target.value})} /></Field>
        <Field label="Статус"><Select value={item.status} onChange={e=>updateRoad({...item,status:e.target.value})}>{ROADMAP_STATUSES.map(s=><option key={s}>{s}</option>)}</Select></Field>
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={item.visibleToClient} onChange={e=>updateRoad({...item,visibleToClient:e.target.checked})} /> Видно клиенту</label>
      </FormGrid><div className="mt-4"><Field label="Описание"><Textarea value={item.description} onChange={e=>updateRoad({...item,description:e.target.value})} /></Field></div></div>)}</div>
    </Card><Card><CardHeader title="Визуальный timeline" /><Timeline items={report.roadmap} /></Card></div>}

    {active === 'offer' && <Card><CardHeader title="Офер" subtitle="Офер вытекает из диагностики: цель → разрыв → риски → стратегия → продукт." /><FormGrid>
      <Field label="Рекомендуемый продукт"><Input value={report.offer.recommendedProduct} onChange={e=>setOfferField('recommendedProduct',e.target.value)} /></Field>
      <Field label="Тариф"><Input value={report.offer.tariff} onChange={e=>setOfferField('tariff',e.target.value)} /></Field>
      <Field label="Цена"><Input type="number" value={report.offer.price} onChange={e=>setOfferField('price',Number(e.target.value))} /></Field>
      <Field label="Варианты оплаты"><Input value={report.offer.paymentOptions} onChange={e=>setOfferField('paymentOptions',e.target.value)} /></Field>
      <Field label="Статус офера"><Select value={report.offer.offerStatus} onChange={e=>setOfferField('offerStatus',e.target.value as DiagnosticReport['offer']['offerStatus'])}>{OFFER_STATUSES.map(v=><option key={v}>{v}</option>)}</Select></Field>
      <Field label="Срок действия"><Input type="date" value={report.offer.validUntil} onChange={e=>setOfferField('validUntil',e.target.value)} /></Field>
    </FormGrid><div className="mt-4 grid gap-4 md:grid-cols-2">
      <Field label="Почему подходит"><Textarea value={report.offer.whyFits} onChange={e=>setOfferField('whyFits',e.target.value)} /></Field>
      <Field label="Что входит"><Textarea value={report.offer.includedServices} onChange={e=>setOfferField('includedServices',e.target.value)} /></Field>
      <Field label="Ожидаемый результат"><Textarea value={report.offer.expectedResult} onChange={e=>setOfferField('expectedResult',e.target.value)} /></Field>
      <Field label="Следующий шаг"><Textarea value={report.offer.nextStep} onChange={e=>setOfferField('nextStep',e.target.value)} /></Field>
    </div><div className="mt-4 flex gap-3"><Button onClick={()=>updateLeadStatus(lead.id,'Офер сделан','Диагност','Офер сформирован по итогам диагностики')}>Отметить “Офер сделан”</Button><Button variant="success" onClick={()=>updateLeadStatus(lead.id,'Купил','МОП','Клиент оплатил сопровождение')}>Отметить покупку</Button></div></Card>}

    {active === 'client' && <Card><CardHeader title="Клиентская версия" subtitle="Внутренние комментарии скрыты, университеты помечены статусом проверки." action={<Link to={`/clients/${lead.id}/report`}><Button><Eye className="h-4 w-4" />Открыть</Button></Link>} /><p className="text-sm text-slate-600">Клиент увидит резюме, цель, точку А/Б, шансы, риски, стратегию, предварительные университеты, дорожную карту, продукт EastSide и следующий шаг.</p></Card>}
    {active === 'internal' && !isClient && <Card><CardHeader title="Внутренние комментарии" subtitle="Этот блок не попадает в клиентскую версию." /><Field label="Комментарий диагноста / продажи / сопровождение"><Textarea value={report.internalComments} onChange={e=>setField('internalComments',e.target.value)} /></Field></Card>}
  </div>;
}
function Info({ label, value }: { label:string; value?:string }) {
  return <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm text-slate-800">{value || '—'}</p></div>;
}
