import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  ChanceAssessment,
  DiagnosticReport,
  DiagnosticSession,
  Lead,
  Offer,
  Parent,
  PainSolution,
  Product,
  QualificationForm,
  ReportStatus,
  RoadmapItem,
  Role,
  Student,
  UniversityRecommendation
} from '../types';
import { mockLeads, products as mockProducts } from '../lib/mockData';
import { makeId } from '../lib/helpers';
import { dataMode, isSupabaseConfigured, supabase } from '../lib/supabase';

interface DataContextValue {
  role: Role;
  setRole: (role: Role) => void;
  leads: Lead[];
  products: Product[];
  dataMode: string;
  getLead: (id: string) => Lead | undefined;
  updateLead: (id: string, updater: (lead: Lead) => Lead) => void;
  updateLeadStatus: (id: string, status: ReportStatus, actor?: string, comment?: string) => void;
  resetMockData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);
const STORAGE_KEY = 'eastside_diagnostic_platform_leads_v1';
const DEFAULT_MOP_ID = '11111111-1111-1111-1111-111111111111';
const DEFAULT_DIAGNOSTIC_ID = '22222222-2222-2222-2222-222222222222';

const emptyParent = (): Parent => ({
  id: makeId('parent'), fullName: '', phone: '', messenger: '', email: '', relationship: '', decisionInfluence: '', mainConcerns: ''
});
const emptyStudent = (): Student => ({
  id: makeId('student'), fullName: '', age: 0, gradeOrYear: '', city: '', country: '', currentSchool: '', decisionRole: '', studentContact: ''
});
const emptyQualification = (): QualificationForm => ({
  programLevel: '', targetCountry: '', chinaPriority: '', desiredIntakeYear: '', desiredLanguage: '', realLanguage: '', targetMajor: '',
  existingUniversityPreferences: '', grantUnderstanding: '', averageGrade: '', strongSubjects: '', weakSubjects: '', classProfile: '', competitions: '', portfolio: '', motivation: '',
  englishLevel: '', englishExam: '', chineseLevel: '', hsk: '', readyToLearnChinese: '', budgetType: '', budgetAmount: '', readyToInvest: '', urgency: '',
  whyAbroad: '', fears: '', doubts: '', negativeExperience: '', parentPriorities: '', studentPriorities: '', selectionCriteria: '', mopComment: ''
});
const emptySession = (leadId: string): DiagnosticSession => ({ id: makeId('session'), scheduledAt: '', format: '', sessionStatus: 'не назначена', notes: `lead:${leadId}` });
const emptyChance = (): ChanceAssessment => ({
  chanceLevel: 'Средний шанс', chanceScore: 50, why: '', positiveFactors: '', negativeFactors: '', requiredImprovements: '', criticalDeadlines: '', documentRequirements: '', examRequirements: '', risks: '', confidenceLevel: ''
});
const emptyOffer = (): Offer => ({
  recommendedProduct: '', tariff: '', price: 0, paymentOptions: '', whyFits: '', includedServices: '', expectedResult: '', nextStep: '', offerStatus: 'Не сделан', validUntil: '', rejectionReason: ''
});
const emptyReport = (leadId: string, studentId: string): DiagnosticReport => ({
  id: makeId('report'), status: 'Черновик МОП', clientSummary: '', currentSituation: '', currentPointA: '', targetPointB: '', gapAnalysis: '', limitations: '', opportunities: '',
  studentAutonomy: '', parentInvolvement: '', familyReadiness: '', strategySummary: '', mainStrategy: '', backupStrategy: '', languageStrategy: '', fundingStrategy: '', portfolioStrategy: '', documentStrategy: '', preparationPlan: '',
  chanceAssessment: emptyChance(), painSolutions: [], universities: [], roadmap: [], offer: emptyOffer(), diagnosticConclusion: '', internalComments: `lead:${leadId}; student:${studentId}`, updatedAt: new Date().toISOString()
});

const s = (value: unknown): string => value == null ? '' : String(value);
const n = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const leadTemperature = (value: unknown): Lead['leadTemperature'] => {
  const raw = s(value).toLowerCase();
  if (raw.includes('гор')) return 'Горячий';
  if (raw.includes('теп') || raw.includes('тёп')) return 'Теплый';
  return 'Холодный';
};

function productFromDb(row: any): Product {
  return {
    id: s(row.id),
    name: s(row.name),
    category: s(row.category),
    targetClient: s(row.target_client),
    includedServices: s(row.included_services),
    price: n(row.price),
    duration: s(row.duration),
    successCriteria: s(row.success_criteria)
  };
}
function parentFromDb(row: any): Parent {
  if (!row) return emptyParent();
  return { id: s(row.id), fullName: s(row.full_name), phone: s(row.phone), messenger: s(row.messenger), email: s(row.email), relationship: s(row.relationship), decisionInfluence: s(row.decision_influence), mainConcerns: s(row.main_concerns) };
}
function studentFromDb(row: any): Student {
  if (!row) return emptyStudent();
  return { id: s(row.id), fullName: s(row.full_name), age: n(row.age), gradeOrYear: s(row.grade_or_year), city: s(row.city), country: s(row.country), currentSchool: s(row.current_school), decisionRole: s(row.decision_role), studentContact: s(row.student_contact) };
}
function qualificationFromDb(row: any): QualificationForm {
  if (!row) return emptyQualification();
  return {
    programLevel: s(row.program_level), targetCountry: s(row.target_country), chinaPriority: s(row.china_priority), desiredIntakeYear: s(row.desired_intake_year), desiredLanguage: s(row.desired_language), realLanguage: s(row.real_study_language), targetMajor: s(row.target_major),
    existingUniversityPreferences: s(row.existing_university_preferences), grantUnderstanding: s(row.scholarship_understanding), averageGrade: s(row.average_grade), strongSubjects: s(row.strong_subjects), weakSubjects: s(row.weak_subjects), classProfile: s(row.school_profile), competitions: s(row.competitions), portfolio: s(row.portfolio_status), motivation: s(row.motivation),
    englishLevel: s(row.english_level), englishExam: s(row.english_exam), chineseLevel: s(row.chinese_level), hsk: s(row.hsk_status), readyToLearnChinese: s(row.ready_to_learn_chinese), budgetType: s(row.budget_type), budgetAmount: s(row.budget_amount), readyToInvest: s(row.ready_to_invest_preparation), urgency: s(row.urgency),
    whyAbroad: s(row.why_abroad), fears: s(row.fears), doubts: s(row.doubts), negativeExperience: s(row.negative_experience), parentPriorities: s(row.parent_priorities), studentPriorities: s(row.student_priorities), selectionCriteria: s(row.choice_criteria), mopComment: s(row.mop_comment)
  };
}
function sessionFromDb(row: any, leadId: string): DiagnosticSession {
  if (!row) return emptySession(leadId);
  return { id: s(row.id), scheduledAt: s(row.scheduled_at), completedAt: s(row.completed_at), format: s(row.format), durationMinutes: n(row.duration_minutes), sessionStatus: s(row.session_status), notes: s(row.notes) };
}
function chanceFromDb(row: any): ChanceAssessment {
  if (!row) return emptyChance();
  return { chanceLevel: (s(row.chance_level) || 'Средний шанс') as ChanceAssessment['chanceLevel'], chanceScore: n(row.chance_score), why: s(row.why), positiveFactors: s(row.positive_factors), negativeFactors: s(row.negative_factors), requiredImprovements: s(row.required_improvements), criticalDeadlines: s(row.critical_deadlines), documentRequirements: s(row.document_requirements), examRequirements: s(row.exam_requirements), risks: s(row.risks), confidenceLevel: s(row.confidence_level) };
}
function uniFromDb(row: any): UniversityRecommendation {
  return { id: s(row.id), universityName: s(row.university_name), city: s(row.city), country: s(row.country), direction: s(row.direction), programName: s(row.program_name), language: s(row.language), programLevel: s(row.program_level), fundingType: s(row.funding_type), tuitionEstimate: s(row.tuition_estimate), scholarshipAvailable: s(row.scholarship_available), requirementsSummary: s(row.requirements_summary), fitReason: s(row.fit_reason), realismStatus: (s(row.realism_status) || 'Реалистичный') as UniversityRecommendation['realismStatus'], risks: s(row.risks), diagnosticComment: s(row.diagnostic_comment), verificationStatus: (s(row.verification_status) || 'Требует проверки') as UniversityRecommendation['verificationStatus'] };
}
function roadmapItemFromDb(row: any): RoadmapItem {
  return { id: s(row.id), month: s(row.month), title: s(row.title), description: s(row.description), responsibleRole: s(row.responsible_role), deadline: s(row.deadline), status: s(row.status), visibleToClient: Boolean(row.is_client_visible) };
}
function offerFromDb(row: any, product?: Product): Offer {
  if (!row) return emptyOffer();
  return { recommendedProduct: product?.name || '', tariff: s(row.tariff), price: n(row.price), paymentOptions: s(row.payment_options), whyFits: s(row.offer_reason), includedServices: s(row.included_services), expectedResult: s(row.expected_result), nextStep: s(row.next_step), offerStatus: (s(row.offer_status) || 'Не сделан') as Offer['offerStatus'], validUntil: s(row.valid_until), rejectionReason: s(row.rejection_reason) };
}
function reportFromDb(row: any, leadId: string, studentId: string, chance: ChanceAssessment, painSolutions: PainSolution[], universities: UniversityRecommendation[], roadmap: RoadmapItem[], offer: Offer, internalComments: string): DiagnosticReport {
  if (!row) return emptyReport(leadId, studentId);
  return {
    id: s(row.id), status: (s(row.status) || 'Черновик МОП') as ReportStatus, clientSummary: s(row.client_summary), currentSituation: s(row.current_situation), currentPointA: s(row.current_point_a), targetPointB: s(row.target_point_b), gapAnalysis: s(row.gap_analysis), limitations: s(row.limitations), opportunities: s(row.opportunities),
    studentAutonomy: s(row.student_independence), parentInvolvement: s(row.parent_involvement), familyReadiness: s(row.family_readiness), strategySummary: s(row.strategy_summary), mainStrategy: s(row.primary_strategy), backupStrategy: s(row.reserve_strategy), languageStrategy: s(row.language_strategy), fundingStrategy: s(row.funding_strategy), portfolioStrategy: s(row.portfolio_strategy), documentStrategy: s(row.document_strategy), preparationPlan: s(row.timeline_strategy),
    chanceAssessment: chance, painSolutions, universities, roadmap, offer, diagnosticConclusion: s(row.diagnostic_conclusion), internalComments, updatedAt: s(row.updated_at || row.created_at || new Date().toISOString())
  };
}

async function loadFromSupabase(): Promise<{ leads: Lead[]; products: Product[] }> {
  if (!supabase) return { leads: mockLeads, products: mockProducts };
  const [users, productsRes, parents, students, leadsRes, qualifications, sessions, reports, chances, pains, solutions, universities, roadmaps, roadmapItems, offers, comments, history] = await Promise.all([
    supabase.from('users').select('*'), supabase.from('products').select('*'), supabase.from('parents').select('*'), supabase.from('students').select('*'), supabase.from('leads').select('*'), supabase.from('qualification_forms').select('*'), supabase.from('diagnostic_sessions').select('*'), supabase.from('diagnostic_reports').select('*'), supabase.from('chance_assessments').select('*'), supabase.from('pain_points').select('*'), supabase.from('solutions').select('*'), supabase.from('university_recommendations').select('*'), supabase.from('roadmaps').select('*'), supabase.from('roadmap_items').select('*'), supabase.from('offers').select('*'), supabase.from('internal_comments').select('*'), supabase.from('report_status_history').select('*').order('created_at', { ascending: true })
  ]);
  const responses = [users, productsRes, parents, students, leadsRes, qualifications, sessions, reports, chances, pains, solutions, universities, roadmaps, roadmapItems, offers, comments, history];
  const firstError = responses.find(r => r.error)?.error;
  if (firstError) throw firstError;

  const userRows = users.data || [];
  const productRows = (productsRes.data || []).map(productFromDb);
  const parentRows = parents.data || [];
  const studentRows = students.data || [];
  const leadRows = leadsRes.data || [];
  const qualificationRows = qualifications.data || [];
  const sessionRows = sessions.data || [];
  const reportRows = reports.data || [];
  const chanceRows = chances.data || [];
  const painRows = pains.data || [];
  const solutionRows = solutions.data || [];
  const universityRows = universities.data || [];
  const roadmapRows = roadmaps.data || [];
  const roadmapItemRows = roadmapItems.data || [];
  const offerRows = offers.data || [];
  const commentRows = comments.data || [];
  const historyRows = history.data || [];

  const composed = leadRows.map((leadRow: any): Lead => {
    const studentRow = studentRows.find((x: any) => x.id === leadRow.student_id);
    const parentRow = parentRows.find((x: any) => x.id === leadRow.parent_id);
    const reportRow = reportRows.find((x: any) => x.lead_id === leadRow.id);
    const reportId = reportRow?.id;
    const offerRow = offerRows.find((x: any) => x.report_id === reportId);
    const product = productRows.find(x => x.id === offerRow?.recommended_product_id);
    const reportRoadmaps = roadmapRows.filter((x: any) => x.report_id === reportId);
    const reportRoadmapIds = reportRoadmaps.map((x: any) => x.id);
    const painSolutions = painRows.filter((p: any) => p.report_id === reportId).map((p: any): PainSolution => {
      const sol = solutionRows.find((x: any) => x.pain_point_id === p.id) || {};
      return { id: s(p.id), pain: s(p.pain_text), solution: s(sol.solution_text), eastsideAction: s(sol.eastside_action), priority: (s(p.priority) || 'Средний') as PainSolution['priority'], visibleToClient: Boolean(p.is_client_visible) };
    });
    const report = reportFromDb(
      reportRow,
      s(leadRow.id),
      s(studentRow?.id),
      chanceFromDb(chanceRows.find((x: any) => x.report_id === reportId)),
      painSolutions,
      universityRows.filter((x: any) => x.report_id === reportId).map(uniFromDb),
      roadmapItemRows.filter((x: any) => reportRoadmapIds.includes(x.roadmap_id)).map(roadmapItemFromDb),
      offerFromDb(offerRow, product),
      s(commentRows.find((x: any) => x.report_id === reportId)?.text)
    );
    const mop = userRows.find((x: any) => x.id === leadRow.assigned_mop_id);
    const diagnostic = userRows.find((x: any) => x.id === leadRow.assigned_diagnostic_id);
    return {
      id: s(leadRow.id), source: s(leadRow.source), status: (s(leadRow.status) || report.status) as ReportStatus, leadTemperature: leadTemperature(leadRow.lead_temperature), assignedMopName: s(mop?.full_name || 'Анна МОП'), assignedDiagnosticName: s(diagnostic?.full_name || 'Виталий Диагност'), nextActionAt: s(leadRow.next_action_at),
      student: studentFromDb(studentRow), parent: parentFromDb(parentRow), qualification: qualificationFromDb(qualificationRows.find((x: any) => x.lead_id === leadRow.id)), session: sessionFromDb(sessionRows.find((x: any) => x.lead_id === leadRow.id), s(leadRow.id)), report,
      statusHistory: historyRows.filter((x: any) => x.lead_id === leadRow.id).map((x: any) => ({ id: s(x.id), status: s(x.status) as ReportStatus, date: s(x.created_at), actor: 'Система', comment: s(x.comment) })),
      createdAt: s(leadRow.created_at), updatedAt: s(leadRow.updated_at)
    };
  });

  return { leads: composed.length ? composed : mockLeads, products: productRows.length ? productRows : mockProducts };
}

async function persistLead(lead: Lead, availableProducts: Product[]) {
  if (!supabase) return;
  const now = new Date().toISOString();

  await supabase.from('parents').upsert({ id: lead.parent.id, full_name: lead.parent.fullName, phone: lead.parent.phone, messenger: lead.parent.messenger, email: lead.parent.email, relationship: lead.parent.relationship, decision_influence: lead.parent.decisionInfluence, main_concerns: lead.parent.mainConcerns, updated_at: now });
  await supabase.from('students').upsert({ id: lead.student.id, full_name: lead.student.fullName, age: lead.student.age, grade_or_year: lead.student.gradeOrYear, city: lead.student.city, country: lead.student.country, current_school: lead.student.currentSchool, decision_role: lead.student.decisionRole, student_contact: lead.student.studentContact, parent_id: lead.parent.id, updated_at: now });
  await supabase.from('leads').upsert({ id: lead.id, source: lead.source, status: lead.status, student_id: lead.student.id, parent_id: lead.parent.id, assigned_mop_id: DEFAULT_MOP_ID, assigned_diagnostic_id: DEFAULT_DIAGNOSTIC_ID, lead_temperature: lead.leadTemperature, next_action_at: lead.nextActionAt || null, updated_at: now });

  await supabase.from('qualification_forms').delete().eq('lead_id', lead.id);
  await supabase.from('qualification_forms').insert({ lead_id: lead.id, program_level: lead.qualification.programLevel, target_country: lead.qualification.targetCountry, china_priority: lead.qualification.chinaPriority, desired_intake_year: parseInt(lead.qualification.desiredIntakeYear || '0') || null, desired_language: lead.qualification.desiredLanguage, target_major: lead.qualification.targetMajor, existing_university_preferences: lead.qualification.existingUniversityPreferences, scholarship_understanding: lead.qualification.grantUnderstanding, average_grade: lead.qualification.averageGrade, strong_subjects: lead.qualification.strongSubjects, weak_subjects: lead.qualification.weakSubjects, school_profile: lead.qualification.classProfile, competitions: lead.qualification.competitions, portfolio_status: lead.qualification.portfolio, motivation: lead.qualification.motivation, english_level: lead.qualification.englishLevel, english_exam: lead.qualification.englishExam, chinese_level: lead.qualification.chineseLevel, hsk_status: lead.qualification.hsk, ready_to_learn_chinese: lead.qualification.readyToLearnChinese, real_study_language: lead.qualification.realLanguage, budget_type: lead.qualification.budgetType, budget_amount: n(lead.qualification.budgetAmount) || null, ready_to_invest_preparation: lead.qualification.readyToInvest, urgency: lead.qualification.urgency, why_abroad: lead.qualification.whyAbroad, fears: lead.qualification.fears, doubts: lead.qualification.doubts, negative_experience: lead.qualification.negativeExperience, parent_priorities: lead.qualification.parentPriorities, student_priorities: lead.qualification.studentPriorities, choice_criteria: lead.qualification.selectionCriteria, mop_comment: lead.qualification.mopComment });

  await supabase.from('diagnostic_sessions').delete().eq('lead_id', lead.id);
  await supabase.from('diagnostic_sessions').insert({ id: lead.session.id, lead_id: lead.id, diagnostic_id: DEFAULT_DIAGNOSTIC_ID, scheduled_at: lead.session.scheduledAt || null, completed_at: lead.session.completedAt || null, format: lead.session.format, duration_minutes: lead.session.durationMinutes || null, session_status: lead.session.sessionStatus, notes: lead.session.notes });

  await supabase.from('diagnostic_reports').upsert({ id: lead.report.id, lead_id: lead.id, student_id: lead.student.id, session_id: lead.session.id, status: lead.report.status, client_summary: lead.report.clientSummary, current_situation: lead.report.currentSituation, current_point_a: lead.report.currentPointA, target_point_b: lead.report.targetPointB, gap_analysis: lead.report.gapAnalysis, limitations: lead.report.limitations, opportunities: lead.report.opportunities, student_independence: lead.report.studentAutonomy, parent_involvement: lead.report.parentInvolvement, family_readiness: lead.report.familyReadiness, strategy_summary: lead.report.strategySummary, primary_strategy: lead.report.mainStrategy, reserve_strategy: lead.report.backupStrategy, language_strategy: lead.report.languageStrategy, funding_strategy: lead.report.fundingStrategy, portfolio_strategy: lead.report.portfolioStrategy, document_strategy: lead.report.documentStrategy, timeline_strategy: lead.report.preparationPlan, diagnostic_conclusion: lead.report.diagnosticConclusion, created_by: DEFAULT_DIAGNOSTIC_ID, approved_by: '33333333-3333-3333-3333-333333333333', updated_at: now });

  await Promise.all([
    supabase.from('chance_assessments').delete().eq('report_id', lead.report.id),
    supabase.from('pain_points').delete().eq('report_id', lead.report.id),
    supabase.from('solutions').delete().eq('report_id', lead.report.id),
    supabase.from('university_recommendations').delete().eq('report_id', lead.report.id),
    supabase.from('roadmaps').delete().eq('report_id', lead.report.id),
    supabase.from('offers').delete().eq('report_id', lead.report.id),
    supabase.from('internal_comments').delete().eq('report_id', lead.report.id)
  ]);

  await supabase.from('chance_assessments').insert({ report_id: lead.report.id, chance_level: lead.report.chanceAssessment.chanceLevel, chance_score: lead.report.chanceAssessment.chanceScore, why: lead.report.chanceAssessment.why, positive_factors: lead.report.chanceAssessment.positiveFactors, negative_factors: lead.report.chanceAssessment.negativeFactors, required_improvements: lead.report.chanceAssessment.requiredImprovements, critical_deadlines: lead.report.chanceAssessment.criticalDeadlines, exam_requirements: lead.report.chanceAssessment.examRequirements, document_requirements: lead.report.chanceAssessment.documentRequirements, risks: lead.report.chanceAssessment.risks, confidence_level: lead.report.chanceAssessment.confidenceLevel });

  for (const item of lead.report.painSolutions) {
    await supabase.from('pain_points').insert({ id: item.id, report_id: lead.report.id, pain_category: 'диагностика', pain_text: item.pain, priority: item.priority, severity: item.priority === 'Высокий' ? 5 : item.priority === 'Средний' ? 3 : 1, is_client_visible: item.visibleToClient });
    await supabase.from('solutions').insert({ report_id: lead.report.id, pain_point_id: item.id, solution_text: item.solution, eastside_action: item.eastsideAction, is_client_visible: item.visibleToClient });
  }

  if (lead.report.universities.length) await supabase.from('university_recommendations').insert(lead.report.universities.map(u => ({ id: u.id, report_id: lead.report.id, university_name: u.universityName, city: u.city, country: u.country, direction: u.direction, program_name: u.programName, program_level: u.programLevel, language: u.language, funding_type: u.fundingType, tuition_estimate: n(u.tuitionEstimate) || null, scholarship_available: u.scholarshipAvailable, requirements_summary: u.requirementsSummary, fit_reason: u.fitReason, realism_status: u.realismStatus, risks: u.risks, verification_status: u.verificationStatus, diagnostic_comment: u.diagnosticComment, is_client_visible: true })));

  const roadmapId = makeId('roadmap');
  await supabase.from('roadmaps').insert({ id: roadmapId, report_id: lead.report.id, roadmap_type: 'Поступление', start_month: lead.report.roadmap[0]?.month || '', end_month: lead.report.roadmap[lead.report.roadmap.length - 1]?.month || '', owner: 'EastSide + семья', priority: 'Высокий' });
  if (lead.report.roadmap.length) await supabase.from('roadmap_items').insert(lead.report.roadmap.map(item => ({ id: item.id, roadmap_id: roadmapId, month: item.month, title: item.title, description: item.description, responsible_role: item.responsibleRole, deadline: item.deadline || null, status: item.status, is_client_visible: item.visibleToClient })));

  const product = availableProducts.find(p => p.name === lead.report.offer.recommendedProduct);
  await supabase.from('offers').insert({ report_id: lead.report.id, recommended_product_id: product?.id || null, tariff: lead.report.offer.tariff, price: lead.report.offer.price || null, payment_options: lead.report.offer.paymentOptions, offer_reason: lead.report.offer.whyFits, included_services: lead.report.offer.includedServices, expected_result: lead.report.offer.expectedResult, next_step: lead.report.offer.nextStep, valid_until: lead.report.offer.validUntil || null, offer_status: lead.report.offer.offerStatus, rejection_reason: lead.report.offer.rejectionReason });

  if (lead.report.internalComments) await supabase.from('internal_comments').insert({ report_id: lead.report.id, author_id: DEFAULT_DIAGNOSTIC_ID, comment_type: 'internal', text: lead.report.internalComments, visibility: 'team_only' });
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('manager');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (isSupabaseConfigured) return mockLeads;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return mockLeads;
    try { return JSON.parse(stored) as Lead[]; } catch { return mockLeads; }
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    loadFromSupabase()
      .then(result => { if (active) { setLeads(result.leads); setProducts(result.products); } })
      .catch(error => {
        console.error('Supabase load error:', error);
        if (active) setLeads(mockLeads);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const updateLead = (id: string, updater: (lead: Lead) => Lead) => {
    const currentLead = leads.find(lead => lead.id === id);
    if (!currentLead) return;
    const updatedLead = { ...updater(structuredClone(currentLead)), updatedAt: new Date().toISOString() };
    setLeads(current => current.map(lead => lead.id === id ? updatedLead : lead));
    if (isSupabaseConfigured) void persistLead(updatedLead, products).catch(error => console.error('Supabase save error:', error));
  };

  const updateLeadStatus = (id: string, status: ReportStatus, actor = 'Система', comment = '') => {
    const currentLead = leads.find(lead => lead.id === id);
    if (!currentLead) return;
    const historyItem = { id: makeId('hist'), status, date: new Date().toISOString(), actor, comment };
    const updatedLead: Lead = {
      ...currentLead,
      status,
      report: { ...currentLead.report, status, updatedAt: new Date().toISOString() },
      statusHistory: [...currentLead.statusHistory, historyItem],
      updatedAt: new Date().toISOString()
    };
    setLeads(current => current.map(lead => lead.id === id ? updatedLead : lead));
    if (isSupabaseConfigured && supabase) {
      void supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      void supabase.from('diagnostic_reports').update({ status, updated_at: new Date().toISOString() }).eq('id', currentLead.report.id);
      void supabase.from('report_status_history').insert({ lead_id: id, report_id: currentLead.report.id, status, comment });
    }
  };

  const resetMockData = () => {
    if (isSupabaseConfigured) {
      void loadFromSupabase().then(result => { setLeads(result.leads); setProducts(result.products); });
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setLeads(mockLeads);
      setProducts(mockProducts);
    }
  };

  const value = useMemo<DataContextValue>(() => ({
    role, setRole, leads, products, dataMode,
    getLead: (id: string) => leads.find(l => l.id === id),
    updateLead,
    updateLeadStatus,
    resetMockData
  }), [role, leads, products]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
