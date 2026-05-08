create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  full_name text not null,
  email text unique,
  role text not null check (role in ('admin','manager','diagnostic','curator','client')),
  is_active boolean default true
);

create table if not exists parents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  full_name text not null,
  phone text,
  messenger text,
  email text,
  relationship text,
  decision_influence text,
  main_concerns text
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  full_name text not null,
  age int,
  grade_or_year text,
  city text,
  country text,
  current_school text,
  decision_role text,
  student_contact text,
  parent_id uuid references parents(id) on delete set null
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  bitrix_deal_id text,
  source text,
  status text not null,
  student_id uuid references students(id) on delete cascade,
  parent_id uuid references parents(id) on delete set null,
  assigned_mop_id uuid references users(id) on delete set null,
  assigned_diagnostic_id uuid references users(id) on delete set null,
  lead_temperature text,
  next_action_at timestamptz
);

create table if not exists qualification_forms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  lead_id uuid not null references leads(id) on delete cascade,
  program_level text,
  target_country text,
  china_priority text,
  desired_intake_year int,
  desired_language text,
  target_major text,
  existing_university_preferences text,
  scholarship_understanding text,
  average_grade text,
  strong_subjects text,
  weak_subjects text,
  school_profile text,
  competitions text,
  portfolio_status text,
  motivation text,
  english_level text,
  english_exam text,
  chinese_level text,
  hsk_status text,
  ready_to_learn_chinese text,
  real_study_language text,
  budget_type text,
  budget_amount numeric,
  ready_to_invest_preparation text,
  urgency text,
  why_abroad text,
  fears text,
  doubts text,
  negative_experience text,
  parent_priorities text,
  student_priorities text,
  choice_criteria text,
  mop_comment text
);

create table if not exists diagnostic_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  lead_id uuid not null references leads(id) on delete cascade,
  diagnostic_id uuid references users(id) on delete set null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  format text,
  duration_minutes int,
  session_status text,
  recording_url text,
  notes text
);

create table if not exists diagnostic_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  lead_id uuid not null references leads(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  session_id uuid references diagnostic_sessions(id) on delete set null,
  status text not null,
  client_summary text,
  current_situation text,
  current_point_a text,
  target_point_b text,
  gap_analysis text,
  limitations text,
  opportunities text,
  student_independence text,
  parent_involvement text,
  family_readiness text,
  strategy_summary text,
  primary_strategy text,
  reserve_strategy text,
  language_strategy text,
  funding_strategy text,
  portfolio_strategy text,
  document_strategy text,
  timeline_strategy text,
  diagnostic_conclusion text,
  client_version_url text,
  pdf_url text,
  created_by uuid references users(id) on delete set null,
  approved_by uuid references users(id) on delete set null
);

create table if not exists chance_assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  report_id uuid not null references diagnostic_reports(id) on delete cascade,
  chance_level text,
  chance_score int,
  why text,
  positive_factors text,
  negative_factors text,
  required_improvements text,
  critical_deadlines text,
  exam_requirements text,
  document_requirements text,
  risks text,
  confidence_level text,
  diagnostic_comment text
);

create table if not exists pain_points (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  report_id uuid not null references diagnostic_reports(id) on delete cascade,
  pain_category text,
  pain_text text not null,
  source text,
  severity int,
  priority text,
  is_client_visible boolean default true
);

create table if not exists solutions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  pain_point_id uuid references pain_points(id) on delete cascade,
  report_id uuid references diagnostic_reports(id) on delete cascade,
  solution_text text,
  eastside_action text,
  product_feature text,
  client_value text,
  is_client_visible boolean default true
);

create table if not exists university_recommendations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  report_id uuid not null references diagnostic_reports(id) on delete cascade,
  university_name text not null,
  city text,
  country text,
  direction text,
  program_name text,
  program_level text,
  language text,
  funding_type text,
  tuition_estimate numeric,
  scholarship_available text,
  requirements_summary text,
  fit_reason text,
  realism_status text,
  risks text,
  source_url text,
  verification_status text,
  diagnostic_comment text,
  is_client_visible boolean default true
);

create table if not exists roadmaps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  report_id uuid not null references diagnostic_reports(id) on delete cascade,
  roadmap_type text,
  start_month text,
  end_month text,
  owner text,
  priority text
);

create table if not exists roadmap_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  roadmap_id uuid not null references roadmaps(id) on delete cascade,
  month text,
  title text not null,
  description text,
  responsible_role text,
  deadline date,
  status text,
  is_client_visible boolean default true
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  category text,
  target_client text,
  included_services text,
  price numeric,
  duration text,
  success_criteria text,
  is_active boolean default true
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  report_id uuid not null references diagnostic_reports(id) on delete cascade,
  recommended_product_id uuid references products(id) on delete set null,
  tariff text,
  price numeric,
  payment_options text,
  offer_reason text,
  included_services text,
  expected_result text,
  next_step text,
  valid_until date,
  offer_status text,
  rejection_reason text
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  report_id uuid references diagnostic_reports(id) on delete cascade,
  assigned_to uuid references users(id) on delete set null,
  title text not null,
  description text,
  deadline timestamptz,
  status text,
  source text
);

create table if not exists internal_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  report_id uuid not null references diagnostic_reports(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  comment_type text,
  text text not null,
  visibility text default 'team_only'
);

create table if not exists report_status_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  report_id uuid references diagnostic_reports(id) on delete cascade,
  status text not null,
  actor_id uuid references users(id) on delete set null,
  comment text
);

create table if not exists client_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  report_id uuid references diagnostic_reports(id) on delete cascade,
  rating int,
  feedback_text text,
  parent_feedback text,
  student_feedback text
);

create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_student_id on leads(student_id);
create index if not exists idx_qualification_forms_lead_id on qualification_forms(lead_id);
create index if not exists idx_diagnostic_sessions_lead_id on diagnostic_sessions(lead_id);
create index if not exists idx_diagnostic_reports_lead_id on diagnostic_reports(lead_id);
create index if not exists idx_diagnostic_reports_student_id on diagnostic_reports(student_id);
create index if not exists idx_diagnostic_reports_status on diagnostic_reports(status);
create index if not exists idx_chance_assessments_report_id on chance_assessments(report_id);
create index if not exists idx_pain_points_report_id on pain_points(report_id);
create index if not exists idx_solutions_report_id on solutions(report_id);
create index if not exists idx_university_recommendations_report_id on university_recommendations(report_id);
create index if not exists idx_roadmaps_report_id on roadmaps(report_id);
create index if not exists idx_roadmap_items_roadmap_id on roadmap_items(roadmap_id);
create index if not exists idx_offers_report_id on offers(report_id);
create index if not exists idx_offers_offer_status on offers(offer_status);
create index if not exists idx_tasks_lead_id on tasks(lead_id);
create index if not exists idx_tasks_report_id on tasks(report_id);
create index if not exists idx_internal_comments_report_id on internal_comments(report_id);
create index if not exists idx_report_status_history_lead_id on report_status_history(lead_id);
create index if not exists idx_report_status_history_report_id on report_status_history(report_id);
create index if not exists idx_client_feedback_report_id on client_feedback(report_id);
