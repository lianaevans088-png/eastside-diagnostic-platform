import type { Lead, OfferStatus, ReportStatus } from '../types';

export const cn = (...classes:Array<string|false|null|undefined>) => classes.filter(Boolean).join(' ');
export const makeId = (prefix='id') => `${prefix}_${Math.random().toString(36).slice(2,10)}`;
export const formatMoney = (v:number) => new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(v || 0);
export const formatDate = (d?:string) => d ? new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(d)) : '—';
export const getLeadOfferStatus = (l:Lead):OfferStatus => l.report.offer.offerStatus;

export function statusTone(status:ReportStatus): 'gray'|'blue'|'green'|'yellow'|'red'|'purple' {
  if (status === 'Купил' || status === 'Передано в сопровождение') return 'green';
  if (status === 'Отказ') return 'red';
  if (status === 'Ожидается решение' || status === 'Нужен повторный контакт') return 'yellow';
  if (status === 'Офер сделан' || status === 'Отправлено клиенту') return 'purple';
  if (status.includes('Диагностика') || status.includes('Заключение') || status === 'Передано диагносту') return 'blue';
  return 'gray';
}
export function completionScore(lead:Lead) {
  const checks = [lead.qualification.targetCountry, lead.qualification.programLevel, lead.qualification.targetMajor, lead.qualification.averageGrade, lead.qualification.englishLevel || lead.qualification.chineseLevel, lead.report.currentPointA, lead.report.targetPointB, lead.report.chanceAssessment.why, lead.report.painSolutions.length>=2, lead.report.universities.length>=2, lead.report.roadmap.length>=3, lead.report.offer.recommendedProduct];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
export function analyticsFromLeads(leads:Lead[]) {
  const total = leads.length;
  const scheduledStatuses = ['Диагностика назначена','Диагностика проведена','Заключение в работе','Заключение готово','Отправлено клиенту','Офер сделан','Ожидается решение','Купил','Передано в сопровождение'];
  const doneStatuses = scheduledStatuses.filter(s => s !== 'Диагностика назначена');
  const diagnosticsScheduled = leads.filter(l => scheduledStatuses.includes(l.status)).length;
  const diagnosticsCompleted = leads.filter(l => doneStatuses.includes(l.status)).length;
  const reportsCreated = leads.filter(l => l.report.clientSummary || l.status.includes('Заключение') || ['Отправлено клиенту','Офер сделан','Купил'].includes(l.status)).length;
  const offersMade = leads.filter(l => l.report.offer.offerStatus !== 'Не сделан').length;
  const paid = leads.filter(l => ['Купил','Передано в сопровождение'].includes(l.status) || l.report.offer.offerStatus === 'Купил').length;
  const revenue = leads.reduce((s,l)=> s + (['Купил','Передано в сопровождение'].includes(l.status) || l.report.offer.offerStatus === 'Купил' ? l.report.offer.price : 0), 0);
  return {total, diagnosticsScheduled, diagnosticsCompleted, reportsCreated, offersMade, paid, diagnosticToOffer: diagnosticsCompleted ? Math.round(offersMade/diagnosticsCompleted*100) : 0, offerToPayment: offersMade ? Math.round(paid/offersMade*100):0, avgCheck: paid ? Math.round(revenue/paid):0};
}
export function topValues(leads:Lead[], getter:(l:Lead)=>string, limit=5) {
  const m = new Map<string,number>();
  leads.forEach(l => { const v = getter(l) || 'Не указано'; m.set(v, (m.get(v)||0)+1); });
  return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]).slice(0,limit);
}
