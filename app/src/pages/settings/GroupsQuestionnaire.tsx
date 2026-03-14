import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import './GroupsQuestionnaire.css';

interface Answer {
  questionId: string;
  value: string | string[];
}

interface Question {
  id: string;
  section: string;
  question: string;
  subtext?: string;
  type: 'single' | 'multi';
  options: { value: string; label: string; description?: string }[];
}

const QUESTIONS: Question[] = [
  // ── ACCESS MODEL ──────────────────────────────────────────────────────────
  {
    id: 'access_model',
    section: 'Access Model',
    question: 'How should user access be structured?',
    subtext: 'This determines the overall permission architecture.',
    type: 'single',
    options: [
      { value: 'groups_only', label: 'Groups only', description: 'Users belong to a group and inherit its permissions. Simple and consistent.' },
      { value: 'roles_only', label: 'Roles only', description: 'Keep the existing role system (Visit Lead, Ops Admin, etc.) but make roles configurable.' },
      { value: 'groups_and_roles', label: 'Groups + Roles', description: 'Groups define module access; roles define what actions can be taken within a module.' },
    ],
  },
  {
    id: 'multi_group',
    section: 'Access Model',
    question: 'Can a user belong to more than one group?',
    type: 'single',
    options: [
      { value: 'single', label: 'One group per user', description: 'Simpler — each user has exactly one group.' },
      { value: 'multi', label: 'Multiple groups', description: 'User inherits combined permissions from all their groups.' },
    ],
  },

  // ── MODULE ACCESS ─────────────────────────────────────────────────────────
  {
    id: 'permission_levels',
    section: 'Permission Levels',
    question: 'What permission levels do you need per module?',
    subtext: 'Select all levels that make sense for your team.',
    type: 'multi',
    options: [
      { value: 'none', label: 'No Access', description: 'Module is completely hidden from the user.' },
      { value: 'view', label: 'View Only', description: 'Can read data but cannot make any changes.' },
      { value: 'edit', label: 'Edit', description: 'Can modify existing records but not create or delete.' },
      { value: 'create', label: 'Create & Edit', description: 'Can create and modify records but not delete.' },
      { value: 'full', label: 'Full Access', description: 'Can create, edit, and delete records.' },
    ],
  },
  {
    id: 'visit_scope',
    section: 'Permission Levels',
    question: 'For Visits — what should limited users see?',
    type: 'single',
    options: [
      { value: 'all', label: 'All visits', description: 'Users can see every visit in the system.' },
      { value: 'assigned', label: 'Only visits they\'re assigned to', description: 'Users only see visits where they\'re listed as Visit Lead, Coordinator, or Attendee.' },
      { value: 'department', label: 'Visits in their department/group', description: 'Users see all visits tagged to their group.' },
    ],
  },

  // ── EXPENSES ──────────────────────────────────────────────────────────────
  {
    id: 'expense_permissions',
    section: 'Expenses',
    question: 'What expense permissions do you need?',
    subtext: 'Select all that apply to your team structure.',
    type: 'multi',
    options: [
      { value: 'view', label: 'View expenses', description: 'Can see expense records.' },
      { value: 'submit', label: 'Submit claims', description: 'Can create and submit their own expense claims.' },
      { value: 'submit_others', label: 'Submit on behalf of others', description: 'Can submit expenses for other team members.' },
      { value: 'approve', label: 'Approve / Reject', description: 'Can approve or reject submitted claims.' },
      { value: 'export', label: 'Export & report', description: 'Can export expense data and run reports.' },
    ],
  },

  // ── COMMUNICATIONS ────────────────────────────────────────────────────────
  {
    id: 'comms_permissions',
    section: 'Communications',
    question: 'For Communications — what should non-admins be able to do?',
    type: 'multi',
    options: [
      { value: 'view', label: 'View sent communications', description: 'Can read communication logs.' },
      { value: 'draft', label: 'Draft communications', description: 'Can write drafts but not send.' },
      { value: 'send', label: 'Send communications', description: 'Can send emails and messages to clients.' },
      { value: 'templates', label: 'Manage templates', description: 'Can create and edit communication templates.' },
    ],
  },

  // ── SETTINGS ──────────────────────────────────────────────────────────────
  {
    id: 'settings_access',
    section: 'Settings',
    question: 'Who should have access to Settings?',
    type: 'single',
    options: [
      { value: 'admin_only', label: 'Administrators only', description: 'Only users with Administrator role can access Settings.' },
      { value: 'configurable', label: 'Configurable per group', description: 'Settings access can be granted to specific groups.' },
    ],
  },

  // ── DEFAULT ACCESS ────────────────────────────────────────────────────────
  {
    id: 'new_user_default',
    section: 'Defaults',
    question: 'What access should a new user have before being assigned a group?',
    type: 'single',
    options: [
      { value: 'none', label: 'No access at all', description: 'They see a "contact your admin" screen until assigned.' },
      { value: 'read_only', label: 'Read-only across all modules', description: 'They can view everything but change nothing.' },
      { value: 'default_group', label: 'Automatically assigned to a default group', description: 'All new users go into a predefined "Default" group.' },
    ],
  },

  // ── AUDIT ─────────────────────────────────────────────────────────────────
  {
    id: 'audit_log',
    section: 'Audit & Logging',
    question: 'Do you need an audit log of what users do?',
    type: 'single',
    options: [
      { value: 'none', label: 'Not needed', description: 'No activity tracking required.' },
      { value: 'basic', label: 'Basic — logins and key actions', description: 'Track who logged in and major changes (expense approvals, visit status changes).' },
      { value: 'full', label: 'Full audit trail', description: 'Log every create, update, and delete with timestamp and user.' },
    ],
  },

  // ── STARTER GROUPS ────────────────────────────────────────────────────────
  {
    id: 'starter_groups',
    section: 'Starter Groups',
    question: 'Which starter groups should be pre-configured?',
    subtext: 'You can edit or add more groups after setup.',
    type: 'multi',
    options: [
      { value: 'admin', label: 'Administrator', description: 'Full system access.' },
      { value: 'visit_lead', label: 'Visit Lead', description: 'Full visit management, limited settings.' },
      { value: 'ops', label: 'Operations', description: 'Logistics, office readiness, communications.' },
      { value: 'finance', label: 'Finance', description: 'Expenses and reports only.' },
      { value: 'readonly', label: 'Read-Only / Executive', description: 'Dashboard and reports, view-only.' },
      { value: 'client_liaison', label: 'Client Liaison', description: 'Client, attendees, and communications only.' },
    ],
  },
];

const SECTIONS = [...new Set(QUESTIONS.map(q => q.section))];

interface Props {
  onComplete: (answers: Answer[]) => void;
  onCancel: () => void;
}

export default function GroupsQuestionnaire({ onComplete, onCancel }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const question = QUESTIONS[step];
  const current = answers.find(a => a.questionId === question.id);
  const sectionIdx = SECTIONS.indexOf(question.section);
  const progress = ((step) / QUESTIONS.length) * 100;

  const setValue = (val: string) => {
    if (question.type === 'single') {
      setAnswers(prev => {
        const next = prev.filter(a => a.questionId !== question.id);
        return [...next, { questionId: question.id, value: val }];
      });
    } else {
      setAnswers(prev => {
        const existing = (prev.find(a => a.questionId === question.id)?.value as string[]) ?? [];
        const next = existing.includes(val) ? existing.filter(v => v !== val) : [...existing, val];
        const rest = prev.filter(a => a.questionId !== question.id);
        return [...rest, { questionId: question.id, value: next }];
      });
    }
  };

  const isSelected = (val: string) => {
    if (!current) return false;
    if (question.type === 'single') return current.value === val;
    return (current.value as string[]).includes(val);
  };

  const canNext = current && (
    question.type === 'single'
      ? !!current.value
      : (current.value as string[]).length > 0
  );

  const isLast = step === QUESTIONS.length - 1;

  return (
    <div className="gq">
      <div className="gq__sidebar">
        <h2 className="gq__sidebar-title">Groups & Permissions Setup</h2>
        <p className="gq__sidebar-sub">Answer {QUESTIONS.length} questions to configure the right access model for your team.</p>
        <div className="gq__sections">
          {SECTIONS.map((s, i) => (
            <div key={s} className={`gq__section-item ${i === sectionIdx ? 'active' : ''} ${i < sectionIdx ? 'done' : ''}`}>
              {i < sectionIdx ? <CheckCircle size={14} /> : <span className="gq__section-dot" />}
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="gq__main">
        <div className="gq__progress">
          <div className="gq__progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="gq__content">
          <span className="gq__section-label">{question.section}</span>
          <h3 className="gq__question">{question.question}</h3>
          {question.subtext && <p className="gq__subtext">{question.subtext}</p>}

          <div className="gq__options">
            {question.options.map(opt => (
              <button
                key={opt.value}
                className={`gq__option ${isSelected(opt.value) ? 'selected' : ''}`}
                onClick={() => setValue(opt.value)}
              >
                <div className={`gq__option-check ${question.type === 'multi' ? 'multi' : ''}`}>
                  {isSelected(opt.value) && <CheckCircle size={14} />}
                </div>
                <div className="gq__option-text">
                  <span className="gq__option-label">{opt.label}</span>
                  {opt.description && <span className="gq__option-desc">{opt.description}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="gq__footer">
          <button className="gq__btn gq__btn--secondary" onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}>
            <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <span className="gq__step-count">{step + 1} / {QUESTIONS.length}</span>
          <button
            className="gq__btn gq__btn--primary"
            disabled={!canNext}
            onClick={() => isLast ? onComplete(answers) : setStep(s => s + 1)}
          >
            {isLast ? 'Generate Groups' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
