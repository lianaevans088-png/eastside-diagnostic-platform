import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send } from 'lucide-react';
import { useData } from '../app/DataContext';
import type { Lead, Parent, QualificationForm, Student } from '../types';
import { BUDGET_TYPES, COUNTRIES, LANGUAGES, PROGRAM_LEVELS } from '../lib/constants';
import { Button, Card, CardHeader, Field, FormGrid, Input, SectionHeader, Select, Textarea } from '../components/ui';

export default function QualificationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLead, updateLead, updateLeadStatus } = useData();
  const lead = id ? getLead(id) : undefined;
  const [student, setStudent] = useState<Student | undefined>(() => lead ? structuredClone(lead.student) : undefined);
  const [parent, setParent] = useState<Parent | undefined>(() => lead ? structuredClone(lead.parent) : undefined);
  const [qualification, setQualification] = useState<QualificationForm | undefined>(() => lead ? structuredClone(lead.qualification) : undefined);
  const completion = useMemo(() => {
    const required = [student?.fullName, student?.gradeOrYear, qualification?.programLevel, qualification?.targetCountry, qualification?.desiredIntakeYear, qualification?.desiredLanguage, qualification?.targetMajor, qualification?.averageGrade, qualification?.budgetType, qualification?.fears];
    return Math.round((required.filter(Boolean).length / required.length) * 100);
  }, [student, qualification]);
  if (!lead || !student || !parent || !qualification) return <div>Клиент не найден.</div>;

  const ss = <K extends keyof Student>(k:K,v:Student[K]) => setStudent(c => c ? ({...c,[k]:v}) : c);
  const sp = <K extends keyof Parent>(k:K,v:Parent[K]) => setParent(c => c ? ({...c,[k]:v}) : c);
  const sq = <K extends keyof QualificationForm>(k:K,v:QualificationForm[K]) => setQualification(c => c ? ({...c,[k]:v}) : c);
  const save = (nextStatus?: Lead['status']) => {
    updateLead(lead.id, current => ({...current, student, parent, qualification}));
    if (nextStatus) updateLeadStatus(lead.id, nextStatus, 'МОП', nextStatus==='Передано диагносту' ? 'Первичная квалификация заполнена и передана диагносту.' : 'Квалификация сохранена.');
  };
  return <div>
    <SectionHeader title="Первичная квалификация МОП" subtitle="Быстрый базовый слой. МОП не делает экспертных выводов, а готовит данные для диагностики." action={<div className="rounded-full bg-eastside-sky px-4 py-2 text-sm font-bold text-eastside-blue">Заполнено: {completion}%</div>} />
    <div className="space-y-6">
      <Card><CardHeader title="Данные ученика" /><FormGrid>
        <Field label="ФИО ученика"><Input value={student.fullName} onChange={e=>ss('fullName',e.target.value)} /></Field>
        <Field label="Возраст"><Input type="number" value={student.age} onChange={e=>ss('age',Number(e.target.value))} /></Field>
        <Field label="Класс / курс"><Input value={student.gradeOrYear} onChange={e=>ss('gradeOrYear',e.target.value)} /></Field>
        <Field label="Город"><Input value={student.city} onChange={e=>ss('city',e.target.value)} /></Field>
        <Field label="Страна"><Input value={student.country} onChange={e=>ss('country',e.target.value)} /></Field>
        <Field label="Школа / вуз"><Input value={student.currentSchool} onChange={e=>ss('currentSchool',e.target.value)} /></Field>
        <Field label="Кто принимает решение"><Input value={student.decisionRole} onChange={e=>ss('decisionRole',e.target.value)} /></Field>
        <Field label="Контакт ученика"><Input value={student.studentContact} onChange={e=>ss('studentContact',e.target.value)} /></Field>
        <Field label="Контакт родителя"><Input value={parent.phone} onChange={e=>sp('phone',e.target.value)} /></Field>
      </FormGrid></Card>
      <Card><CardHeader title="Образовательный запрос" /><FormGrid>
        <Field label="Страна интереса"><Select value={qualification.targetCountry} onChange={e=>sq('targetCountry',e.target.value)}>{COUNTRIES.map(v=><option key={v}>{v}</option>)}</Select></Field>
        <Field label="Приоритет Китая"><Select value={qualification.chinaPriority} onChange={e=>sq('chinaPriority',e.target.value)}><option>Высокий</option><option>Средний</option><option>Низкий</option></Select></Field>
        <Field label="Уровень программы"><Select value={qualification.programLevel} onChange={e=>sq('programLevel',e.target.value)}>{PROGRAM_LEVELS.map(v=><option key={v}>{v}</option>)}</Select></Field>
        <Field label="Желаемый год поступления"><Input value={qualification.desiredIntakeYear} onChange={e=>sq('desiredIntakeYear',e.target.value)} /></Field>
        <Field label="Желаемый язык обучения"><Select value={qualification.desiredLanguage} onChange={e=>sq('desiredLanguage',e.target.value)}>{LANGUAGES.map(v=><option key={v}>{v}</option>)}</Select></Field>
        <Field label="Реальный язык обучения"><Input value={qualification.realLanguage} onChange={e=>sq('realLanguage',e.target.value)} /></Field>
        <Field label="Направление"><Input value={qualification.targetMajor} onChange={e=>sq('targetMajor',e.target.value)} /></Field>
        <Field label="Выбранные вузы"><Input value={qualification.existingUniversityPreferences} onChange={e=>sq('existingUniversityPreferences',e.target.value)} /></Field>
        <Field label="Понимание по грантам"><Input value={qualification.grantUnderstanding} onChange={e=>sq('grantUnderstanding',e.target.value)} /></Field>
      </FormGrid></Card>
      <Card><CardHeader title="Академический и языковой профиль" /><FormGrid>
        <Field label="Средний балл"><Input value={qualification.averageGrade} onChange={e=>sq('averageGrade',e.target.value)} /></Field>
        <Field label="Сильные предметы"><Input value={qualification.strongSubjects} onChange={e=>sq('strongSubjects',e.target.value)} /></Field>
        <Field label="Слабые предметы"><Input value={qualification.weakSubjects} onChange={e=>sq('weakSubjects',e.target.value)} /></Field>
        <Field label="Портфолио"><Input value={qualification.portfolio} onChange={e=>sq('portfolio',e.target.value)} /></Field>
        <Field label="Английский"><Input value={qualification.englishLevel} onChange={e=>sq('englishLevel',e.target.value)} /></Field>
        <Field label="IELTS / TOEFL / Duolingo"><Input value={qualification.englishExam} onChange={e=>sq('englishExam',e.target.value)} /></Field>
        <Field label="Китайский"><Input value={qualification.chineseLevel} onChange={e=>sq('chineseLevel',e.target.value)} /></Field>
        <Field label="HSK"><Input value={qualification.hsk} onChange={e=>sq('hsk',e.target.value)} /></Field>
        <Field label="Готовность учить китайский"><Select value={qualification.readyToLearnChinese} onChange={e=>sq('readyToLearnChinese',e.target.value)}><option>Да</option><option>Нет</option><option>Сомневаются</option></Select></Field>
      </FormGrid><div className="mt-4"><Field label="Мотивация"><Textarea value={qualification.motivation} onChange={e=>sq('motivation',e.target.value)} /></Field></div></Card>
      <Card><CardHeader title="Финансы и боли" /><FormGrid>
        <Field label="Формат финансирования"><Select value={qualification.budgetType} onChange={e=>sq('budgetType',e.target.value)}>{BUDGET_TYPES.map(v=><option key={v}>{v}</option>)}</Select></Field>
        <Field label="Бюджет семьи"><Input value={qualification.budgetAmount} onChange={e=>sq('budgetAmount',e.target.value)} /></Field>
        <Field label="Готовность инвестировать"><Input value={qualification.readyToInvest} onChange={e=>sq('readyToInvest',e.target.value)} /></Field>
        <Field label="Срочность"><Input value={qualification.urgency} onChange={e=>sq('urgency',e.target.value)} /></Field>
      </FormGrid><div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Почему хотят за рубеж"><Textarea value={qualification.whyAbroad} onChange={e=>sq('whyAbroad',e.target.value)} /></Field>
        <Field label="Чего боятся"><Textarea value={qualification.fears} onChange={e=>sq('fears',e.target.value)} /></Field>
        <Field label="Сомнения"><Textarea value={qualification.doubts} onChange={e=>sq('doubts',e.target.value)} /></Field>
        <Field label="Негативный опыт"><Textarea value={qualification.negativeExperience} onChange={e=>sq('negativeExperience',e.target.value)} /></Field>
        <Field label="Что важно родителям"><Textarea value={qualification.parentPriorities} onChange={e=>sq('parentPriorities',e.target.value)} /></Field>
        <Field label="Что важно ученику"><Textarea value={qualification.studentPriorities} onChange={e=>sq('studentPriorities',e.target.value)} /></Field>
        <Field label="Критерии выбора"><Textarea value={qualification.selectionCriteria} onChange={e=>sq('selectionCriteria',e.target.value)} /></Field>
        <Field label="Комментарий МОП"><Textarea value={qualification.mopComment} onChange={e=>sq('mopComment',e.target.value)} /></Field>
      </div></Card>
      <div className="sticky bottom-4 z-20 flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur">
        <Button variant="secondary" onClick={()=>save('Квалификация заполнена')}><Save className="h-4 w-4" />Сохранить черновик</Button>
        <Button onClick={()=>{ save('Передано диагносту'); navigate(`/clients/${lead.id}/diagnostic`); }}><Send className="h-4 w-4" />Передать диагносту</Button>
      </div>
    </div>
  </div>;
}
