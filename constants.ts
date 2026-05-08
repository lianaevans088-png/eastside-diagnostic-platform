import type { ChanceLevel, OfferStatus, RealismStatus, ReportStatus, Role, VerificationStatus } from '../types';

export const ROLES:{value:Role;label:string}[] = [
  {value:'admin',label:'Admin'}, {value:'manager',label:'Руководитель'}, {value:'mop',label:'МОП'},
  {value:'diagnostic',label:'Диагност'}, {value:'curator',label:'Куратор'}, {value:'client',label:'Клиент'}
];
export const REPORT_STATUSES:ReportStatus[] = ['Черновик МОП','Квалификация заполнена','Передано диагносту','Диагностика назначена','Диагностика проведена','Заключение в работе','Заключение готово','Отправлено клиенту','Офер сделан','Ожидается решение','Купил','Отказ','Нужен повторный контакт','Передано в сопровождение'];
export const CHANCE_LEVELS:ChanceLevel[] = ['Высокий шанс','Средний шанс','Условный шанс','Низкий шанс без подготовки','Шанс возможен только при изменении стратегии'];
export const REALISM_STATUSES:RealismStatus[] = ['Амбициозный','Целевой','Реалистичный','Безопасный','Резервный'];
export const VERIFICATION_STATUSES:VerificationStatus[] = ['Подтверждено','Требует проверки','Устарело'];
export const OFFER_STATUSES:OfferStatus[] = ['Не сделан','Офер сделан','Ожидается решение','Купил','Отказ'];
export const PROGRAM_LEVELS = ['Бакалавриат','Магистратура','PhD','Языковой год','Летняя программа','Профориентация','Школа'];
export const LANGUAGES = ['Английский','Китайский','Русский','Смешанный маршрут'];
export const COUNTRIES = ['Китай','Корея','Япония','Сингапур','Таиланд','Вьетнам','Другое'];
export const BUDGET_TYPES = ['Только грант','Частичное финансирование','Готовы к платному','Не определились'];
export const ROADMAP_STATUSES = ['Не начато','В работе','Готово','Риск задержки'];
