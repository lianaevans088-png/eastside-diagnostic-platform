export type Role = 'admin' | 'manager' | 'mop' | 'diagnostic' | 'curator' | 'client';

export type ReportStatus =
  | 'Черновик МОП' | 'Квалификация заполнена' | 'Передано диагносту'
  | 'Диагностика назначена' | 'Диагностика проведена' | 'Заключение в работе'
  | 'Заключение готово' | 'Отправлено клиенту' | 'Офер сделан'
  | 'Ожидается решение' | 'Купил' | 'Отказ' | 'Нужен повторный контакт'
  | 'Передано в сопровождение';

export type ChanceLevel = 'Высокий шанс' | 'Средний шанс' | 'Условный шанс' | 'Низкий шанс без подготовки' | 'Шанс возможен только при изменении стратегии';
export type RealismStatus = 'Амбициозный' | 'Целевой' | 'Реалистичный' | 'Безопасный' | 'Резервный';
export type VerificationStatus = 'Подтверждено' | 'Требует проверки' | 'Устарело';
export type OfferStatus = 'Не сделан' | 'Офер сделан' | 'Ожидается решение' | 'Купил' | 'Отказ';

export interface Student { id:string; fullName:string; age:number; gradeOrYear:string; city:string; country:string; currentSchool:string; decisionRole:string; studentContact:string; }
export interface Parent { id:string; fullName:string; phone:string; messenger:string; email:string; relationship:string; decisionInfluence:string; mainConcerns:string; }
export interface QualificationForm {
  programLevel:string; targetCountry:string; chinaPriority:string; desiredIntakeYear:string; desiredLanguage:string; realLanguage:string; targetMajor:string;
  existingUniversityPreferences:string; grantUnderstanding:string; averageGrade:string; strongSubjects:string; weakSubjects:string; classProfile:string; competitions:string; portfolio:string; motivation:string;
  englishLevel:string; englishExam:string; chineseLevel:string; hsk:string; readyToLearnChinese:string;
  budgetType:string; budgetAmount:string; readyToInvest:string; urgency:string;
  whyAbroad:string; fears:string; doubts:string; negativeExperience:string; parentPriorities:string; studentPriorities:string; selectionCriteria:string; mopComment:string;
}
export interface DiagnosticSession { id:string; scheduledAt:string; completedAt?:string; format:string; durationMinutes?:number; sessionStatus:string; notes?:string; }
export interface ChanceAssessment { chanceLevel:ChanceLevel; chanceScore:number; why:string; positiveFactors:string; negativeFactors:string; requiredImprovements:string; criticalDeadlines:string; documentRequirements:string; examRequirements:string; risks:string; confidenceLevel:string; }
export interface PainSolution { id:string; pain:string; solution:string; eastsideAction:string; priority:'Высокий'|'Средний'|'Низкий'; visibleToClient:boolean; }
export interface UniversityRecommendation { id:string; universityName:string; city:string; country:string; direction:string; programName:string; language:string; programLevel:string; fundingType:string; tuitionEstimate:string; scholarshipAvailable:string; requirementsSummary:string; fitReason:string; realismStatus:RealismStatus; risks:string; diagnosticComment:string; verificationStatus:VerificationStatus; }
export interface RoadmapItem { id:string; month:string; title:string; description:string; responsibleRole:string; deadline:string; status:string; visibleToClient:boolean; }
export interface Offer { recommendedProduct:string; tariff:string; price:number; paymentOptions:string; whyFits:string; includedServices:string; expectedResult:string; nextStep:string; offerStatus:OfferStatus; validUntil:string; rejectionReason?:string; }
export interface DiagnosticReport {
  id:string; status:ReportStatus; clientSummary:string; currentSituation:string; currentPointA:string; targetPointB:string; gapAnalysis:string; limitations:string; opportunities:string; studentAutonomy:string; parentInvolvement:string; familyReadiness:string;
  strategySummary:string; mainStrategy:string; backupStrategy:string; languageStrategy:string; fundingStrategy:string; portfolioStrategy:string; documentStrategy:string; preparationPlan:string;
  chanceAssessment:ChanceAssessment; painSolutions:PainSolution[]; universities:UniversityRecommendation[]; roadmap:RoadmapItem[]; offer:Offer; diagnosticConclusion:string; internalComments:string; updatedAt:string;
}
export interface StatusHistoryItem { id:string; status:ReportStatus; date:string; actor:string; comment:string; }
export interface Lead { id:string; source:string; status:ReportStatus; leadTemperature:'Холодный'|'Теплый'|'Горячий'; assignedMopName:string; assignedDiagnosticName:string; nextActionAt:string; student:Student; parent:Parent; qualification:QualificationForm; session:DiagnosticSession; report:DiagnosticReport; statusHistory:StatusHistoryItem[]; createdAt:string; updatedAt:string; }
export interface Product { id:string; name:string; category:string; targetClient:string; includedServices:string; price:number; duration:string; successCriteria:string; }
