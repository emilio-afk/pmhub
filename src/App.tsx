import React, { Component, createContext, useContext, useEffect, useRef, useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation,
  useMatch,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  getDocs,
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  deleteField,
  orderBy,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { 
  House, 
  Kanban as KanbanIcon, 
  CheckSquare, 
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Plus, 
  LogOut, 
  ChevronRight, 
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  CalendarDays,
  ChevronDown,
  BadgeCheck,
  ShieldCheck,
  PackageOpen,
  NotebookPen,
  ChartColumnBig,
  FolderOpen,
  Handshake,
  ListTodo,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  TriangleAlert
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

import { ProjectSectionHeader } from '@/components/project/project-section-header';
import { ActivityEntryCard } from '@/components/project/activity-entry-card';
import { RiskCard } from '@/components/project/risk-card';
import { SectionBlock } from '@/components/project/section-block';
import { AttentionList } from '@/components/overview/attention-list';
import { ExecutiveKpis } from '@/components/overview/executive-kpis';
import { ExecutiveSummaryCard } from '@/components/overview/executive-summary-card';
import { InternalControlsForm } from '@/components/overview/internal-controls-form';
import { UpcomingMilestones } from '@/components/overview/upcoming-milestones';
import { KanbanColumn } from '@/components/kanban/kanban-column';
import { TaskCard } from '@/components/kanban/task-card';
import { TaskChecklist } from '@/components/kanban/task-checklist';
import { ApprovalCard } from '@/components/client/approval-card';
import { ApprovalForm } from '@/components/client/approval-form';
import { ClientActionCard } from '@/components/client/client-action-card';
import { ClientActionForm } from '@/components/client/client-action-form';
import { DeliverableCard } from '@/components/client/deliverable-card';
import { DeliverableForm } from '@/components/client/deliverable-form';
import { UpdateCard } from '@/components/client/update-card';
import { UpdateForm } from '@/components/client/update-form';
import { MilestoneCard } from '@/components/planning/milestone-card';
import { MilestoneForm } from '@/components/planning/milestone-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// --- Types ---
type Language = 'en' | 'es';
type ProjectHealth = 'green' | 'yellow' | 'red';
type MilestoneStatus = 'planned' | 'at-risk' | 'completed';
type ApprovalStatus = 'pending' | 'approved' | 'changes-requested';
type RiskStatus = 'open' | 'mitigated' | 'closed';
type RiskImpact = 'low' | 'medium' | 'high';
type DeliverableStatus = 'draft' | 'shared' | 'approved';
type ClientActionStatus = 'pending' | 'submitted' | 'done';
type CommentContextType = 'task' | 'milestone' | 'deliverable' | 'approval';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'client';
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'on-hold' | 'completed';
  adminUid: string;
  clientUid?: string;
  memberUids?: string[];
  health?: ProjectHealth;
  budgetHours?: number;
  usedHours?: number;
  budgetAmount?: number;
  spentAmount?: number;
  scopeSummary?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectMember {
  uid: string;
  role: 'viewer';
  addedAt: string;
}

interface ClientInvitation {
  id: string;
  email: string;
  displayName: string;
  invitedAt: string;
  invitedBy: string;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'approval' | 'done';
  priority?: 'regular' | 'high';
  requiresApproval?: boolean;
  approvalRequestedAt?: string;
  approvedAt?: string;
  approvedByUid?: string;
  approvedByName?: string;
  order: number;
  createdAt: string;
}

interface ProjectUpdateEntry {
  id: string;
  title: string;
  summary: string;
  achievements: string;
  blockers: string;
  nextSteps: string;
  progress: number;
  createdAt: string;
  authorUid: string;
  authorName: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  progress: number;
  owner: string;
  createdAt: string;
}

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  itemType: 'deliverable' | 'change-request' | 'phase' | 'copy' | 'design';
  status: ApprovalStatus;
  requestedAt: string;
  requestedByUid: string;
  requestedByName: string;
  decidedAt?: string;
  decidedByUid?: string;
  decidedByName?: string;
  decisionNote?: string;
}

interface RiskItem {
  id: string;
  title: string;
  description: string;
  impact: RiskImpact;
  status: RiskStatus;
  owner: string;
  mitigation: string;
  createdAt: string;
}

interface Deliverable {
  id: string;
  title: string;
  category: string;
  url: string;
  version: string;
  status: DeliverableStatus;
  notes: string;
  uploadedAt: string;
}

interface ClientActionItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: ClientActionStatus;
  createdAt: string;
}

interface ProjectComment {
  id: string;
  contextType: CommentContextType;
  contextId: string;
  message: string;
  authorUid: string;
  authorName: string;
  createdAt: string;
}

interface ActivityEntry {
  id: string;
  type: string;
  message: string;
  actorUid: string;
  actorName: string;
  createdAt: string;
}

interface ChecklistItem {
  id: string;
  taskId: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface ProjectFormState {
  name: string;
  description: string;
  memberUids: string[];
}

interface ProjectMetaFormState {
  health: ProjectHealth;
  budgetHours: string;
  usedHours: string;
  budgetAmount: string;
  spentAmount: string;
  scopeSummary: string;
}

interface ProjectUpdateFormState {
  title: string;
  summary: string;
  achievements: string;
  blockers: string;
  nextSteps: string;
  progress: string;
}

interface MilestoneFormState {
  title: string;
  description: string;
  dueDate: string;
  owner: string;
  progress: string;
}

interface ApprovalFormState {
  title: string;
  description: string;
  itemType: ApprovalRequest['itemType'];
}

interface RiskFormState {
  title: string;
  description: string;
  impact: RiskImpact;
  owner: string;
  mitigation: string;
}

interface DeliverableFormState {
  title: string;
  category: string;
  url: string;
  version: string;
  notes: string;
}

interface ClientActionFormState {
  title: string;
  description: string;
  dueDate: string;
}

type ProjectSectionId = 'overview' | 'planning' | 'execution' | 'client' | 'history';
type ProjectComposerId = 'milestone' | 'update' | 'approval' | 'deliverable' | 'client-action';
type ClientPanelId = 'updates' | 'approvals' | 'deliverables' | 'client-actions';

interface ProjectNavItem {
  id: ProjectSectionId;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
}

interface ProjectNavGroup {
  group: string;
  items: ProjectNavItem[];
}

const PROJECT_SECTION_IDS = ['overview', 'planning', 'execution', 'client', 'history'] as const;

const translations = {
  en: {
    language: 'Language',
    dashboard: 'Dashboard',
    clients: 'Clients',
    addClient: 'Add Client',
    inviteClient: 'Invite Client',
    invitedClients: 'Pending invitations',
    activeClients: 'Active clients',
    clientName: 'Client Name',
    clientEmail: 'Client Email',
    emailPlaceholder: 'client@company.com',
    noPendingInvites: 'No pending invitations.',
    invitationNote: 'This keeps a pending client record until they log in with Google.',
    invite: 'Invite',
    revoke: 'Revoke',
    revokeInvite: 'Revoke Invite',
    actions: 'Actions',
    revokeClientConfirm: 'This will remove the client from all project access and block future logins. Continue?',
    revokeInviteConfirm: 'This will remove the pending invitation. Continue?',
    continueWithEmail: 'Continue with Email',
    emailPassword: 'Email + Password',
    magicLink: 'Magic Link',
    accessEmail: 'Access Email',
    password: 'Password',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    sendAccessLink: 'Send Access Link',
    linkSent: 'Link sent. Check your inbox and open it on this device.',
    finishMagicLink: 'Finish Magic Link',
    enterEmailToFinish: 'Confirm the invited email to finish access.',
    noPasswordYet: 'First time here?',
    alreadyHaveAccount: 'Already have an account?',
    createWithPassword: 'Create it with password',
    signInInstead: 'Sign in instead',
    logout: 'Logout',
    checklist: 'Checklist',
    addItem: 'Add item...',
    deleteItem: 'Delete item',
    projects: 'Projects',
    manageProjects: 'Manage and track your active projects',
    newProject: 'New Project',
    createNewProject: 'Create New Project',
    projectName: 'Project Name',
    description: 'Description',
    projectGoals: 'Project goals and scope...',
    assignClient: 'Assign Clients',
    selectClient: 'Select clients',
    chooseClients: 'Choose which clients can view this project',
    selectedClients: 'Selected clients',
    noClientsSelected: 'No clients selected yet',
    noClientsAssigned: 'No clients have access to this project yet',
    manageAccess: 'Manage Access',
    saveAccess: 'Save Access',
    clientAccess: 'Client access',
    readOnlyAccess: 'Clients can view this project, but cannot edit it.',
    noClientsAvailable: 'No client users available yet.',
    status: 'Status',
    cancel: 'Cancel',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    active: 'Active',
    onHold: 'On Hold',
    completed: 'Completed',
    todo: 'To Do',
    inProgress: 'In Progress',
    reports: 'Reports',
    kanban: 'Kanban',
    moveBack: 'Move Back',
    moveForward: 'Move Forward',
    approval: 'Approval',
    approveTask: 'Approve task',
    requiresApproval: 'Requires approval',
    markForApproval: 'Send through approval',
    skipApproval: 'Complete without approval',
    awaitingApproval: 'Awaiting approval',
    approvedByClient: 'Approved by',
    overallProgress: 'Overall Progress',
    totalTasks: 'Total Tasks',
    complete: 'complete',
    items: 'items',
    done: 'done',
    taskDistribution: 'Task Distribution',
    activityVolume: 'Activity Volume',
    loading: 'Loading...',
    addNewTask: 'Add New Task',
    taskTitle: 'Task Title',
    designHomepage: 'e.g. Design homepage',
    whatNeedsToBeDone: 'What needs to be done?',
    pmHubTagline: 'Streamline your projects and client communication',
    welcomeBack: 'Welcome Back',
    continueWithGoogle: 'Continue with Google',
    termsNotice: 'By continuing, you agree to our Terms of Service and Privacy Policy.',
    invitedLoginNote: 'Use the Google account that received access to this workspace.',
    unauthorizedAccount: 'This Google account does not have access. Use the invited email or contact the administrator.',
    joined: 'Joined',
    name: 'Name',
    email: 'Email',
    deleteTaskConfirm: 'Are you sure you want to delete this task?',
    websiteRedesign: 'e.g. Website Redesign',
    reportProjects: 'Projects',
    createTask: 'Add Task',
    taskLabel: 'Task',
    taskSetupHelper: 'Define status, approvals and delivery context for this task.',
    taskSummary: 'Task Summary',
    checklistShownOnCard: 'Shown on the card',
    executionControlCenter: 'Execution Control Center',
    executionControlHelper: 'Filter active work, isolate approval items and move faster through the board.',
    searchTasksPlaceholder: 'Search tasks',
    allStatuses: 'All statuses',
    approvalOnly: 'Approval required only',
    clearFilters: 'Clear filters',
    showingTasks: 'tasks shown',
    attentionDeckTitle: 'Needs attention',
    attentionDeckHelper: 'These areas need a decision or follow-up before delivery slows down.',
    reviewApprovalLane: 'Review board',
    reviewApprovals: 'Review approvals',
    reviewMilestones: 'Review milestones',
    reviewClientItems: 'Review client items',
    noExecutionAttention: 'No immediate follow-up needed.',
  },
  es: {
    language: 'Idioma',
    dashboard: 'Panel',
    clients: 'Clientes',
    addClient: 'Agregar cliente',
    inviteClient: 'Invitar cliente',
    invitedClients: 'Invitaciones pendientes',
    activeClients: 'Clientes activos',
    clientName: 'Nombre del cliente',
    clientEmail: 'Correo del cliente',
    emailPlaceholder: 'cliente@empresa.com',
    noPendingInvites: 'No hay invitaciones pendientes.',
    invitationNote: 'Esto guarda al cliente como pendiente hasta que entre con Google.',
    invite: 'Invitar',
    revoke: 'Revocar',
    revokeInvite: 'Revocar invitacion',
    actions: 'Acciones',
    revokeClientConfirm: 'Esto quitara al cliente de todos los proyectos y bloqueara futuros accesos. Continuar?',
    revokeInviteConfirm: 'Esto eliminara la invitacion pendiente. Continuar?',
    continueWithEmail: 'Continuar con correo',
    emailPassword: 'Correo + contrasena',
    magicLink: 'Magic Link',
    accessEmail: 'Correo de acceso',
    password: 'Contrasena',
    signIn: 'Entrar',
    createAccount: 'Crear cuenta',
    sendAccessLink: 'Enviar enlace de acceso',
    linkSent: 'Enlace enviado. Revisa tu correo y abrelo en este dispositivo.',
    finishMagicLink: 'Completar magic link',
    enterEmailToFinish: 'Confirma el correo invitado para completar el acceso.',
    noPasswordYet: 'Es tu primera vez?',
    alreadyHaveAccount: 'Ya tienes cuenta?',
    createWithPassword: 'Creala con contrasena',
    signInInstead: 'Entrar en su lugar',
    logout: 'Cerrar sesion',
    checklist: 'Checklist',
    addItem: 'Agregar elemento...',
    deleteItem: 'Borrar elemento',
    projects: 'Proyectos',
    manageProjects: 'Administra y da seguimiento a tus proyectos activos',
    newProject: 'Nuevo proyecto',
    createNewProject: 'Crear nuevo proyecto',
    projectName: 'Nombre del proyecto',
    description: 'Descripcion',
    projectGoals: 'Objetivos y alcance del proyecto...',
    assignClient: 'Asignar cliente',
    selectClient: 'Selecciona clientes',
    chooseClients: 'Elige que clientes pueden ver este proyecto',
    selectedClients: 'Clientes seleccionados',
    noClientsSelected: 'Aun no hay clientes seleccionados',
    noClientsAssigned: 'Aun no hay clientes con acceso a este proyecto',
    manageAccess: 'Gestionar acceso',
    saveAccess: 'Guardar acceso',
    clientAccess: 'Acceso de clientes',
    readOnlyAccess: 'Los clientes pueden ver este proyecto, pero no editarlo.',
    noClientsAvailable: 'Aun no hay usuarios cliente disponibles.',
    status: 'Estado',
    cancel: 'Cancelar',
    create: 'Crear',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    active: 'Activo',
    onHold: 'En pausa',
    completed: 'Completado',
    todo: 'Por hacer',
    inProgress: 'En progreso',
    reports: 'Reportes',
    kanban: 'Kanban',
    moveBack: 'Regresar',
    moveForward: 'Avanzar',
    approval: 'Aprobacion',
    approveTask: 'Aprobar tarea',
    requiresApproval: 'Requiere aprobacion',
    markForApproval: 'Pasar por aprobacion',
    skipApproval: 'Completar sin aprobacion',
    awaitingApproval: 'En aprobacion',
    approvedByClient: 'Aprobado por',
    overallProgress: 'Progreso general',
    totalTasks: 'Tareas totales',
    complete: 'completado',
    items: 'elementos',
    done: 'listas',
    taskDistribution: 'Distribucion de tareas',
    activityVolume: 'Volumen de actividad',
    loading: 'Cargando...',
    addNewTask: 'Agregar nueva tarea',
    taskTitle: 'Titulo de la tarea',
    designHomepage: 'Ej. Disenar homepage',
    whatNeedsToBeDone: 'Que se necesita hacer?',
    pmHubTagline: 'Organiza tus proyectos y la comunicacion con clientes',
    welcomeBack: 'Bienvenido de nuevo',
    continueWithGoogle: 'Continuar con Google',
    termsNotice: 'Al continuar, aceptas nuestros Terminos de servicio y Politica de privacidad.',
    invitedLoginNote: 'Usa la cuenta de Google que recibio acceso a este espacio.',
    unauthorizedAccount: 'Esta cuenta de Google no tiene acceso. Usa el correo invitado o contacta al administrador.',
    joined: 'Registro',
    name: 'Nombre',
    email: 'Correo',
    deleteTaskConfirm: 'Seguro que quieres borrar esta tarea?',
    websiteRedesign: 'Ej. Rediseno del sitio web',
    reportProjects: 'Proyectos',
    createTask: 'Agregar tarea',
    taskLabel: 'Tarea',
    taskSetupHelper: 'Define el estado, las aprobaciones y el contexto de entrega de esta tarea.',
    taskSummary: 'Resumen de la tarea',
    checklistShownOnCard: 'Se muestra en la tarjeta',
    executionControlCenter: 'Centro de control de ejecucion',
    executionControlHelper: 'Filtra trabajo activo, aisla tareas con aprobacion y acelera el seguimiento del tablero.',
    searchTasksPlaceholder: 'Buscar tareas',
    allStatuses: 'Todos los estados',
    approvalOnly: 'Solo requieren aprobacion',
    clearFilters: 'Limpiar filtros',
    showingTasks: 'tareas visibles',
    attentionDeckTitle: 'Requiere atencion',
    attentionDeckHelper: 'Estas areas necesitan una decision o seguimiento antes de frenar la entrega.',
    reviewApprovalLane: 'Revisar tablero',
    reviewApprovals: 'Revisar aprobaciones',
    reviewMilestones: 'Revisar hitos',
    reviewClientItems: 'Revisar pendientes',
    noExecutionAttention: 'No hay seguimiento inmediato pendiente.',
  },
} as const;

const workspaceLabels = {
  en: {
    projectViews: 'Project Views',
    projectArea: 'Project Area',
    clientArea: 'Client Area',
    overviewView: 'General',
    planningView: 'Planning',
    executionView: 'Execution',
    clientView: 'Client',
    historyView: 'History',
    overviewDesc: 'Health, KPIs and reporting',
    planningDesc: 'Milestones and roadmap',
    executionDesc: 'Tasks and board',
    clientDesc: 'Updates, approvals and deliverables',
    historyDesc: 'Full activity trail',
    milestonesShort: 'milestones',
    tasksShort: 'tasks',
    inProgressShort: 'in progress',
    approvalShort: 'in approval',
    deliverablesShort: 'deliverables',
    eventsShort: 'events',
    clientsShort: 'clients',
    newMenu: 'New',
    openSection: 'Open section',
    workBoard: 'Work board',
    clientWorkspace: 'Client workspace',
    historyWorkspace: 'History',
    compactMeta: 'Project overview',
    showDetails: 'Show details',
    hideDetails: 'Hide details',
    expandSection: 'Expand section',
    collapseSection: 'Collapse section',
    attentionLabel: 'Needs attention',
    nextMilestone: 'Next milestone',
    noImmediateAttention: 'No immediate attention',
    internalControls: 'Internal controls',
    latestStatus: 'Latest status',
    nextAction: 'Next action',
    updateNeeded: 'Update needed',
    checklistProgress: 'Checklist',
    commentsCount: 'Comments',
    requiresApprovalBadge: 'Approval required',
    setHighPriority: 'Mark as high priority',
    setRegularPriority: 'Mark as regular priority',
    noApprovalBadge: 'No approval',
    reviewByClient: 'Client review',
    requestedForApproval: 'Requested for approval',
    executive: 'Executive',
    timeline: 'Timeline',
    delivery: 'Delivery',
    activityLog: 'Activity Log',
    projectHealth: 'Project Health',
    onTrack: 'On Track',
    atRisk: 'At Risk',
    critical: 'Critical',
    budgetSnapshot: 'Budget Snapshot',
    budgetHours: 'Budget Hours',
    usedHours: 'Used Hours',
    budgetAmount: 'Budget Amount',
    spentAmount: 'Spent Amount',
    scopeControl: 'Scope Control',
    saveOverview: 'Save Overview',
    latestUpdate: 'Latest Update',
    noUpdatesYet: 'No updates yet.',
    projectUpdates: 'Project Updates',
    addUpdate: 'Add Update',
    updateTitle: 'Update title',
    summary: 'Summary',
    achievements: 'Achievements',
    blockers: 'Blockers',
    nextSteps: 'Next steps',
    progressPercent: 'Progress %',
    roadmap: 'Roadmap',
    addMilestone: 'Add Milestone',
    dueDate: 'Due date',
    owner: 'Owner',
    markAtRisk: 'Mark at risk',
    markPlanned: 'Mark planned',
    markCompleted: 'Mark completed',
    approvals: 'Approvals',
    requestApproval: 'Request Approval',
    approve: 'Approve',
    requestChanges: 'Request changes',
    approvalNote: 'Decision note',
    risks: 'Blockers',
    addRisk: 'Add Blocker',
    mitigate: 'Mitigate',
    closeRisk: 'Mark resolved',
    deliverables: 'Deliverables',
    addDeliverable: 'Add Deliverable',
    version: 'Version',
    category: 'Category',
    resourceLink: 'Resource link',
    notes: 'Notes',
    markShared: 'Mark shared',
    markApproved: 'Mark approved',
    clientItems: 'Pending Client Items',
    addClientItem: 'Add Client Item',
    markSubmitted: 'Mark submitted',
    markDone: 'Mark done',
    comments: 'Comments',
    addComment: 'Add comment',
    noComments: 'No comments yet.',
    executiveSummary: 'Executive summary',
    upcomingMilestones: 'Upcoming milestones',
    pendingApprovals: 'Pending approvals',
    openRisks: 'Open blockers',
    pendingClientActions: 'Pending client items',
    progressTrend: 'Progress trend',
    transparencyCenter: 'Transparency Center',
    deliveryHub: 'Delivery hub',
    noMilestonesYet: 'No milestones yet.',
    noApprovalsYet: 'No approvals yet.',
    noRisksYet: 'No blockers yet.',
    noDeliverablesYet: 'No deliverables yet.',
    noClientItemsYet: 'No pending client items.',
    noActivityYet: 'No activity yet.',
    deleteMilestone: 'Delete milestone',
    deleteMilestoneConfirm: 'This milestone will be deleted permanently. Continue?',
    sharedWithClients: 'Shared with clients',
    createdBy: 'Created by',
    decidedBy: 'Decided by',
    updated: 'Updated',
    pending: 'Pending',
    submitted: 'Submitted',
    planned: 'Planned',
    draft: 'Draft',
    shared: 'Shared',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    deliverable: 'Deliverable',
    changeRequest: 'Change request',
    phase: 'Phase',
    copy: 'Copy',
    design: 'Design',
    addContextComment: 'Write feedback or context...',
    approvalPlaceholder: 'What needs to be approved?',
    deliverablePlaceholder: 'For example: Homepage prototype',
    riskPlaceholder: 'For example: waiting on client approval',
    blockerNote: 'Track real blockers affecting delivery, scope or approvals.',
    clientItemPlaceholder: 'For example: Approve final copy',
    milestonePlaceholder: 'For example: QA sign-off',
    updatePlaceholder: 'For example: Weekly update #3',
    scopePlaceholder: 'Track approved scope changes, assumptions and guardrails...',
    filesTransparentNote: 'Use URLs for deliverables, docs, Figma or QA evidence.',
    pendingApprovalsEmpty: 'There are no approvals waiting for a decision.',
    hoursConsumed: 'Hours consumed',
    budgetConsumed: 'Budget consumed',
    scopeChanges: 'Scope changes',
  },
  es: {
    projectViews: 'Vistas del proyecto',
    projectArea: 'Operacion',
    clientArea: 'Transparencia',
    overviewView: 'General',
    planningView: 'Planificacion',
    executionView: 'Ejecucion',
    clientView: 'Cliente',
    historyView: 'Historial',
    overviewDesc: 'Salud, KPIs y reportes',
    planningDesc: 'Hitos y roadmap',
    executionDesc: 'Tareas y tablero',
    clientDesc: 'Actualizaciones, aprobaciones y entregables',
    historyDesc: 'Traza completa de actividad',
    milestonesShort: 'hitos',
    tasksShort: 'tareas',
    inProgressShort: 'en progreso',
    approvalShort: 'en aprobacion',
    deliverablesShort: 'entregables',
    eventsShort: 'eventos',
    clientsShort: 'clientes',
    newMenu: 'Nuevo',
    openSection: 'Abrir seccion',
    workBoard: 'Espacio de trabajo',
    clientWorkspace: 'Espacio del cliente',
    historyWorkspace: 'Historial',
    compactMeta: 'Resumen del proyecto',
    showDetails: 'Ver detalle',
    hideDetails: 'Ocultar detalle',
    expandSection: 'Expandir seccion',
    collapseSection: 'Colapsar seccion',
    attentionLabel: 'Requiere atencion',
    nextMilestone: 'Siguiente hito',
    noImmediateAttention: 'Sin atencion inmediata',
    internalControls: 'Controles internos',
    latestStatus: 'Estado actual',
    nextAction: 'Siguiente accion',
    updateNeeded: 'Hace falta actualizacion',
    checklistProgress: 'Checklist',
    commentsCount: 'Comentarios',
    requiresApprovalBadge: 'Requiere aprobacion',
    setHighPriority: 'Marcar como prioridad alta',
    setRegularPriority: 'Marcar como prioridad regular',
    noApprovalBadge: 'Sin aprobacion',
    reviewByClient: 'Revision del cliente',
    requestedForApproval: 'Solicitada aprobacion',
    executive: 'Ejecutivo',
    timeline: 'Timeline',
    delivery: 'Entrega',
    activityLog: 'Bitacora',
    projectHealth: 'Salud del proyecto',
    onTrack: 'En tiempo',
    atRisk: 'En riesgo',
    critical: 'Critico',
    budgetSnapshot: 'Control de presupuesto',
    budgetHours: 'Horas presupuestadas',
    usedHours: 'Horas consumidas',
    budgetAmount: 'Monto presupuestado',
    spentAmount: 'Monto consumido',
    scopeControl: 'Control de alcance',
    saveOverview: 'Guardar resumen',
    latestUpdate: 'Ultima actualizacion',
    noUpdatesYet: 'Aun no hay actualizaciones.',
    projectUpdates: 'Actualizaciones del proyecto',
    addUpdate: 'Agregar actualizacion',
    updateTitle: 'Titulo de actualizacion',
    summary: 'Resumen',
    achievements: 'Logros',
    blockers: 'Bloqueadores',
    nextSteps: 'Siguientes pasos',
    progressPercent: 'Progreso %',
    roadmap: 'Roadmap',
    addMilestone: 'Agregar hito',
    dueDate: 'Fecha compromiso',
    owner: 'Responsable',
    markAtRisk: 'Marcar en riesgo',
    markPlanned: 'Marcar planeado',
    markCompleted: 'Marcar completado',
    approvals: 'Aprobaciones',
    requestApproval: 'Solicitar aprobacion',
    approve: 'Aprobar',
    requestChanges: 'Solicitar cambios',
    approvalNote: 'Nota de decision',
    risks: 'Bloqueadores',
    addRisk: 'Registrar bloqueador',
    mitigate: 'Mitigar',
    closeRisk: 'Marcar resuelto',
    deliverables: 'Entregables',
    addDeliverable: 'Agregar entregable',
    version: 'Version',
    category: 'Categoria',
    resourceLink: 'Liga del recurso',
    notes: 'Notas',
    markShared: 'Marcar compartido',
    markApproved: 'Marcar aprobado',
    clientItems: 'Pendientes del cliente',
    addClientItem: 'Agregar pendiente',
    markSubmitted: 'Marcar enviado',
    markDone: 'Marcar listo',
    comments: 'Comentarios',
    addComment: 'Agregar comentario',
    noComments: 'Aun no hay comentarios.',
    executiveSummary: 'Resumen ejecutivo',
    upcomingMilestones: 'Proximos hitos',
    pendingApprovals: 'Aprobaciones pendientes',
    openRisks: 'Bloqueadores abiertos',
    pendingClientActions: 'Pendientes del cliente',
    progressTrend: 'Tendencia de progreso',
    transparencyCenter: 'Centro de transparencia',
    deliveryHub: 'Centro de entrega',
    noMilestonesYet: 'Aun no hay hitos.',
    noApprovalsYet: 'Aun no hay aprobaciones.',
    noRisksYet: 'Aun no hay bloqueadores.',
    noDeliverablesYet: 'Aun no hay entregables.',
    noClientItemsYet: 'Aun no hay pendientes del cliente.',
    noActivityYet: 'Aun no hay actividad.',
    deleteMilestone: 'Eliminar hito',
    deleteMilestoneConfirm: 'Este hito se eliminara de forma permanente. Continuar?',
    sharedWithClients: 'Compartido con clientes',
    createdBy: 'Creado por',
    decidedBy: 'Decidido por',
    updated: 'Actualizado',
    pending: 'Pendiente',
    submitted: 'Enviado',
    planned: 'Planeado',
    draft: 'Borrador',
    shared: 'Compartido',
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
    deliverable: 'Entregable',
    changeRequest: 'Cambio de alcance',
    phase: 'Fase',
    copy: 'Copy',
    design: 'Diseno',
    addContextComment: 'Escribe feedback o contexto...',
    approvalPlaceholder: 'Que se necesita aprobar?',
    deliverablePlaceholder: 'Por ejemplo: Prototipo homepage',
    riskPlaceholder: 'Por ejemplo: esperando aprobacion del cliente',
    blockerNote: 'Registra bloqueadores reales que afecten entrega, alcance o aprobaciones.',
    clientItemPlaceholder: 'Por ejemplo: Aprobar copy final',
    milestonePlaceholder: 'Por ejemplo: QA final',
    updatePlaceholder: 'Por ejemplo: Actualizacion semanal #3',
    scopePlaceholder: 'Registra cambios de alcance aprobados, supuestos y guardrails...',
    filesTransparentNote: 'Usa URLs para entregables, docs, Figma o evidencia de QA.',
    pendingApprovalsEmpty: 'No hay aprobaciones esperando una decision.',
    hoursConsumed: 'Horas consumidas',
    budgetConsumed: 'Presupuesto consumido',
    scopeChanges: 'Cambios de alcance',
  },
} as const;

const getLocale = (language: Language) => language === 'es' ? 'es-MX' : 'en-US';
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const ADMIN_EMAIL = 'emilio@astrolab.mx';
const EMAIL_LINK_STORAGE_KEY = 'pmhub-email-link';
const FOCUSABLE_MODAL_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_MODAL_SELECTORS)).filter(
    element => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
  );

const useAccessibleModal = ({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef,
  triggerRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  containerRef: React.RefObject<HTMLElement | null>;
  initialFocusRef: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const focusFrame = window.requestAnimationFrame(() => {
      initialFocusRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (activeElement === firstElement || !container.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && (activeElement === lastElement || !container.contains(activeElement))) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [containerRef, initialFocusRef, isOpen, onClose, triggerRef]);
};

const getInitialProjectForm = (): ProjectFormState => ({ name: '', description: '', memberUids: [] });
const getInitialTaskForm = (): Pick<Task, 'title' | 'description' | 'status' | 'requiresApproval' | 'priority'> => ({
  title: '',
  description: '',
  status: 'todo',
  requiresApproval: false,
  priority: 'regular',
});
const getInitialProjectMetaForm = (project?: Project | null): ProjectMetaFormState => ({
  health: project?.health ?? 'green',
  budgetHours: project?.budgetHours != null ? String(project.budgetHours) : '',
  usedHours: project?.usedHours != null ? String(project.usedHours) : '',
  budgetAmount: project?.budgetAmount != null ? String(project.budgetAmount) : '',
  spentAmount: project?.spentAmount != null ? String(project.spentAmount) : '',
  scopeSummary: project?.scopeSummary ?? '',
});
const getInitialUpdateForm = (): ProjectUpdateFormState => ({
  title: '',
  summary: '',
  achievements: '',
  blockers: '',
  nextSteps: '',
  progress: '',
});
const getInitialMilestoneForm = (): MilestoneFormState => ({
  title: '',
  description: '',
  dueDate: '',
  owner: '',
  progress: '',
});
const getInitialApprovalForm = (): ApprovalFormState => ({
  title: '',
  description: '',
  itemType: 'deliverable',
});
const getInitialRiskForm = (): RiskFormState => ({
  title: '',
  description: '',
  impact: 'medium',
  owner: '',
  mitigation: '',
});
const getInitialDeliverableForm = (): DeliverableFormState => ({
  title: '',
  category: '',
  url: '',
  version: 'v1',
  notes: '',
});
const getInitialClientActionForm = (): ClientActionFormState => ({
  title: '',
  description: '',
  dueDate: '',
});
const getAssignedClientUids = (project?: Pick<Project, 'clientUid' | 'memberUids'> | null) => {
  if (!project) return [];

  return Array.from(
    new Set([...(project.memberUids ?? []), ...(project.clientUid ? [project.clientUid] : [])].filter(Boolean)),
  );
};

const getProjectStatusLabel = (status: Project['status'], language: Language) => {
  const labels = {
    active: translations[language].active,
    'on-hold': translations[language].onHold,
    completed: translations[language].completed,
  };

  return labels[status];
};

const getHealthLabel = (health: ProjectHealth, language: Language) => {
  const t = workspaceLabels[language];

  return ({
    green: t.onTrack,
    yellow: t.atRisk,
    red: t.critical,
  })[health];
};

const getMilestoneStatusLabel = (status: MilestoneStatus, language: Language) => {
  const t = workspaceLabels[language];

  return ({
    planned: t.planned,
    'at-risk': t.atRisk,
    completed: translations[language].completed,
  })[status];
};

const getApprovalStatusLabel = (status: ApprovalStatus, language: Language) => {
  const t = workspaceLabels[language];

  return ({
    pending: t.pending,
    approved: translations[language].completed,
    'changes-requested': t.requestChanges,
  })[status];
};

const getRiskStatusLabel = (status: RiskStatus, language: Language) => {
  return ({
    open: workspaceLabels[language].pending,
    mitigated: workspaceLabels[language].mitigate,
    closed: translations[language].completed,
  })[status];
};

const getImpactLabel = (impact: RiskImpact, language: Language) => {
  return ({
    low: workspaceLabels[language].low,
    medium: workspaceLabels[language].medium,
    high: workspaceLabels[language].high,
  })[impact];
};

const getDeliverableStatusLabel = (status: DeliverableStatus, language: Language) => {
  return ({
    draft: workspaceLabels[language].draft,
    shared: workspaceLabels[language].shared,
    approved: translations[language].completed,
  })[status];
};

const getClientActionStatusLabel = (status: ClientActionStatus, language: Language) => {
  return ({
    pending: workspaceLabels[language].pending,
    submitted: workspaceLabels[language].submitted,
    done: translations[language].completed,
  })[status];
};

const getApprovalTypeLabel = (type: ApprovalRequest['itemType'], language: Language) => {
  return ({
    deliverable: workspaceLabels[language].deliverable,
    'change-request': workspaceLabels[language].changeRequest,
    phase: workspaceLabels[language].phase,
    copy: workspaceLabels[language].copy,
    design: workspaceLabels[language].design,
  })[type];
};

const getActorName = (profile?: Pick<UserProfile, 'displayName' | 'email'> | null) => (
  profile?.displayName?.trim() || profile?.email || 'PM Hub'
);

const formatDateLabel = (value: string | undefined, language: Language) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(getLocale(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTimeLabel = (value: string | undefined, language: Language) => {
  if (!value) return '-';
  return new Date(value).toLocaleString(getLocale(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatCurrency = (value: number | undefined, language: Language) => {
  return new Intl.NumberFormat(getLocale(language), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const getHealthClasses = (health: ProjectHealth) => ({
  green: 'border-[#b9ddd3] bg-[#e4f3ef] text-[#27695f]',
  yellow: 'border-amber-200 bg-amber-50 text-amber-900',
  red: 'border-rose-200 bg-rose-50 text-rose-800',
})[health];

const getHealthDotClasses = (health: ProjectHealth) => ({
  green: 'bg-[#4b9b8a]',
  yellow: 'bg-[#d8a34f]',
  red: 'bg-[#c96b58]',
})[health];

const isProjectSectionId = (value: string | null): value is ProjectSectionId => (
  value != null && (PROJECT_SECTION_IDS as readonly string[]).includes(value)
);

const getProjectSectionItems = (language: Language): Omit<ProjectNavItem, 'badge'>[] => {
  const labels = workspaceLabels[language];

  return [
    { id: 'overview', label: labels.overviewView, description: labels.overviewDesc, icon: ChartColumnBig },
    { id: 'planning', label: labels.planningView, description: labels.planningDesc, icon: CalendarDays },
    { id: 'execution', label: labels.executionView, description: labels.executionDesc, icon: ListTodo },
    { id: 'client', label: labels.clientView, description: labels.clientDesc, icon: Handshake },
    { id: 'history', label: labels.historyView, description: labels.historyDesc, icon: History },
  ];
};

const getMilestoneClasses = (status: MilestoneStatus) => ({
  planned: 'border-slate-200 bg-slate-100/90 text-slate-800',
  'at-risk': 'border-amber-200 bg-amber-50 text-amber-900',
  completed: 'border-[#b9ddd3] bg-[#e4f3ef] text-[#27695f]',
})[status];

const getApprovalClasses = (status: ApprovalStatus) => ({
  pending: 'border-amber-200 bg-amber-50 text-amber-900',
  approved: 'border-[#b9ddd3] bg-[#e4f3ef] text-[#27695f]',
  'changes-requested': 'border-rose-200 bg-rose-50 text-rose-800',
})[status];

const getRiskClasses = (impact: RiskImpact) => ({
  low: 'border-slate-200 bg-slate-100/90 text-slate-800',
  medium: 'border-amber-200 bg-amber-50 text-amber-900',
  high: 'border-rose-200 bg-rose-50 text-rose-800',
})[impact];

const getDeliverableClasses = (status: DeliverableStatus) => ({
  draft: 'border-slate-200 bg-slate-100/90 text-slate-800',
  shared: 'border-[#b7d5e5] bg-[#e9f4fa] text-[#245b7d]',
  approved: 'border-[#b9ddd3] bg-[#e4f3ef] text-[#27695f]',
})[status];

const getClientActionClasses = (status: ClientActionStatus) => ({
  pending: 'border-amber-200 bg-amber-50 text-amber-900',
  submitted: 'border-[#b7d5e5] bg-[#e9f4fa] text-[#245b7d]',
  done: 'border-[#b9ddd3] bg-[#e4f3ef] text-[#27695f]',
})[status];

const getTaskStatusClasses = (status: Task['status']) => ({
  todo: 'border-slate-200 bg-slate-100/90 text-slate-800',
  'in-progress': 'border-amber-200 bg-amber-50 text-amber-900',
  approval: 'border-[#b7d5e5] bg-[#e9f4fa] text-[#245b7d]',
  done: 'border-[#b9ddd3] bg-[#e4f3ef] text-[#27695f]',
})[status];

const touchProject = async (projectId: string) => {
  await updateDoc(doc(db, 'projects', projectId), {
    updatedAt: new Date().toISOString(),
  });
};

const logProjectActivity = async (
  projectId: string,
  actor: Pick<UserProfile, 'uid' | 'displayName' | 'email'>,
  type: string,
  message: string,
) => {
  await addDoc(collection(db, 'projects', projectId, 'activity'), {
    type,
    message,
    actorUid: actor.uid,
    actorName: getActorName(actor),
    createdAt: new Date().toISOString(),
  } satisfies Omit<ActivityEntry, 'id'>);
};

const syncProjectMemberships = async (
  projectId: string,
  nextMemberUids: string[],
  previousMemberUids: string[],
) => {
  const batch = writeBatch(db);
  const projectRef = doc(db, 'projects', projectId);
  const normalizedMemberUids: string[] = Array.from(new Set(nextMemberUids));
  const now = new Date().toISOString();

  batch.update(projectRef, {
    memberUids: normalizedMemberUids,
    clientUid: normalizedMemberUids[0] ?? '',
    updatedAt: now,
  });

  normalizedMemberUids.forEach(uid => {
    batch.set(doc(collection(projectRef, 'members'), uid), {
      uid,
      role: 'viewer',
      addedAt: now,
    } satisfies ProjectMember);
  });

  previousMemberUids
    .filter(uid => !normalizedMemberUids.includes(uid))
    .forEach(uid => {
      batch.delete(doc(collection(projectRef, 'members'), uid));
    });

  await batch.commit();
};

// --- Auth Context ---
interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  login: () => Promise<void>;
  loginWithPassword: (email: string, password: string, mode: 'signin' | 'signup') => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  completeMagicLink: (email: string, link: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const requireAllowedEmail = async (email: string) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new Error('Ingresa un correo valido.');
    }

    if (normalizedEmail === ADMIN_EMAIL) {
      return null;
    }

    const invitationDoc = await getDoc(doc(db, 'clientInvitations', normalizedEmail));
    if (!invitationDoc.exists()) {
      throw new Error('Esta cuenta no tiene acceso. Usa el correo invitado o contacta al administrador.');
    }

    return invitationDoc.data() as Omit<ClientInvitation, 'id'>;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
          setAuthError(null);
        } else {
          const normalizedEmail = normalizeEmail(user.email || '');
          const isAdmin = normalizedEmail === ADMIN_EMAIL;

          if (isAdmin) {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: normalizedEmail,
              displayName: user.displayName || '',
              role: 'admin',
              createdAt: new Date().toISOString(),
            };

            await setDoc(docRef, newProfile);
            setProfile(newProfile);
            setAuthError(null);
          } else {
            const invitationDoc = await getDoc(doc(db, 'clientInvitations', normalizedEmail));

            if (!invitationDoc.exists()) {
              setProfile(null);
              setAuthError('Esta cuenta de Google no tiene acceso. Usa el correo invitado o contacta al administrador.');
              await signOut(auth);
              return;
            }

            const invitation = invitationDoc.data() as Omit<ClientInvitation, 'id'>;
            const newProfile: UserProfile = {
              uid: user.uid,
              email: normalizedEmail,
              displayName: user.displayName || invitation.displayName || '',
              role: 'client',
              createdAt: new Date().toISOString(),
            };

            await setDoc(docRef, newProfile);
            setProfile(newProfile);
            setAuthError(null);
          }
        }
      } catch (error) {
        setProfile(null);
        setAuthError(error instanceof Error ? error.message : 'No se pudo validar el acceso.');
      } finally {
        setLoading(false);
      }
    });

    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firebase connection error: check your configuration.");
        }
      }
    };
    testConnection();

    return unsubscribe;
  }, []);

  const login = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithPassword = async (email: string, password: string, mode: 'signin' | 'signup') => {
    try {
      setAuthError(null);

      if (mode === 'signup') {
        await requireAllowedEmail(email);
        await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
        return;
      }

      await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesion con correo y contrasena.';
      setAuthError(message);
      throw error;
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      setAuthError(null);
      await requireAllowedEmail(email);
      const normalizedEmail = normalizeEmail(email);

      await sendSignInLinkToEmail(auth, normalizedEmail, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });

      window.localStorage.setItem(EMAIL_LINK_STORAGE_KEY, normalizedEmail);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo enviar el magic link.';
      setAuthError(message);
      throw error;
    }
  };

  const completeMagicLink = async (email: string, link: string) => {
    try {
      setAuthError(null);
      await requireAllowedEmail(email);
      await signInWithEmailLink(auth, normalizeEmail(email), link);
      window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo completar el acceso por enlace.';
      setAuthError(message);
      throw error;
    }
  };

  const logout = async () => {
    setAuthError(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, authError, login, loginWithPassword, sendMagicLink, completeMagicLink, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'es';
    const storedLanguage = window.localStorage.getItem('pmhub-language');
    return storedLanguage === 'en' || storedLanguage === 'es' ? storedLanguage : 'es';
  });

  useEffect(() => {
    window.localStorage.setItem('pmhub-language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div ref={switcherRef} className="ui-panel-soft rounded-2xl px-3 py-3">
      <button
        type="button"
        onClick={() => setIsOpen(current => !current)}
        className="ui-focus-ring w-full rounded-lg px-1 text-left"
        aria-expanded={isOpen}
        aria-label={t.language}
      >
        <span className="flex items-center justify-between">
          <span className="ui-kicker text-[11px] font-semibold uppercase tracking-wider">
            {t.language}
          </span>
          <ChevronRight
            size={14}
            className={`ui-kicker transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
        </span>
      </button>
      {isOpen && (
        <div className="ui-panel-card mt-2 flex items-center rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setLanguage('es');
              setIsOpen(false);
            }}
            className={`ui-focus-ring flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              language === 'es' ? 'bg-[#17324d] text-white shadow-sm' : 'ui-text-subtle hover:text-[#17324d]'
            }`}
          >
            ES
          </button>
          <button
            type="button"
            onClick={() => {
              setLanguage('en');
              setIsOpen(false);
            }}
            className={`ui-focus-ring flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              language === 'en' ? 'bg-[#17324d] text-white shadow-sm' : 'ui-text-subtle hover:text-[#17324d]'
            }`}
          >
            EN
          </button>
        </div>
      )}
    </div>
  );
};

const ClientAccessPicker = ({
  clients,
  selectedUids,
  onToggle,
  title,
  helperText,
  emptyText,
}: {
  clients: UserProfile[];
  selectedUids: string[];
  onToggle: (uid: string) => void;
  title: string;
  helperText: string;
  emptyText: string;
}) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <label className="ui-text-main block text-sm font-medium mb-1">{title}</label>
          <p className="ui-text-subtle text-xs">{helperText}</p>
        </div>
        <span className="ui-kicker rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">
          {selectedUids.length}
        </span>
      </div>

      {clients.length === 0 ? (
        <div className="ui-panel-soft rounded-2xl border-dashed px-4 py-5 text-sm ui-text-subtle">
          {emptyText}
        </div>
      ) : (
        <div className="ui-panel-soft max-h-56 space-y-2 overflow-y-auto rounded-2xl p-3">
          {clients.map(client => {
            const isSelected = selectedUids.includes(client.uid);

            return (
              <label
                key={client.uid}
                className={`flex items-start gap-3 rounded-xl border px-3 py-3 cursor-pointer transition-colors ${
                  isSelected ? 'border-[#17324d] bg-white' : 'border-transparent bg-white/75 hover:border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(client.uid)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#17324d] focus:ring-[#17324d]"
                />
                <div className="min-w-0">
                  <p className="ui-text-main truncate text-sm font-semibold">{client.displayName || client.email}</p>
                  <p className="ui-text-subtle truncate text-xs">{client.email}</p>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EmptyCollectionState = ({ message }: { message: string }) => (
  <Empty className="ui-panel-soft rounded-2xl border-dashed px-4 py-6">
    <EmptyHeader>
      <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500 ring-1 ring-slate-200 [&_svg]:size-4">
        <FolderOpen />
      </EmptyMedia>
      <EmptyTitle className="ui-text-subtle">{message}</EmptyTitle>
    </EmptyHeader>
  </Empty>
);

const SectionActionButton = ({
  icon: Icon = Plus,
  label,
  onClick,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="ui-focus-ring ui-interactive-button ui-action-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
  >
    <Icon size={16} />
    {label}
  </button>
);

const InlineEditButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="ui-focus-ring ui-interactive-button ui-action-secondary inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors"
  >
    <Pencil size={14} />
    {label}
  </button>
);

const CommentsThread = ({
  projectId,
  contextType,
  contextId,
  comments,
  activityTargetLabel,
  variant = 'default',
}: {
  projectId: string;
  contextType: CommentContextType;
  contextId: string;
  comments: ProjectComment[];
  activityTargetLabel: string;
  variant?: 'default' | 'code';
}) => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const labels = workspaceLabels[language];
  const [message, setMessage] = useState('');
  const isCode = variant === 'code';
  const threadComments = comments
    .filter(comment => comment.contextType === contextType && comment.contextId === contextId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const addCommentToThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !message.trim()) return;

    const nextMessage = message.trim();
    await addDoc(collection(db, 'projects', projectId, 'comments'), {
      contextType,
      contextId,
      message: nextMessage,
      authorUid: profile.uid,
      authorName: getActorName(profile),
      createdAt: new Date().toISOString(),
    } satisfies Omit<ProjectComment, 'id'>);
    await logProjectActivity(projectId, profile, 'comment', `Commented on ${activityTargetLabel}`);
    setMessage('');
  };

  return (
    <div className={`rounded-2xl p-4 ${isCode ? 'ui-panel-card' : 'ui-panel-soft mt-4'}`}>
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={15} className={isCode ? 'text-slate-500' : 'text-[#6b8094]'} />
        <span className={`text-xs font-bold uppercase tracking-wider ${isCode ? 'kanban-ui-font text-slate-500' : 'text-[#6b8094]'}`}>{labels.comments}</span>
      </div>
      <div className="space-y-3">
        {threadComments.length === 0 ? (
          <p className={`text-sm ${isCode ? 'kanban-ui-font text-slate-500' : 'text-[#5f7387]'}`}>{labels.noComments}</p>
        ) : (
          threadComments.map(comment => (
            <div key={comment.id} className={`rounded-2xl px-4 py-3 ${isCode ? 'border border-slate-200 bg-slate-50/80' : 'ui-panel-card'}`}>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className={`text-sm font-semibold ${isCode ? 'kanban-ui-font text-slate-900' : 'text-[#102033]'}`}>{comment.authorName}</span>
                <span className={`text-xs ${isCode ? 'kanban-code-font text-slate-500' : 'text-[#6b8094]'}`}>{formatDateTimeLabel(comment.createdAt, language)}</span>
              </div>
              <p className={`text-sm whitespace-pre-wrap ${isCode ? 'kanban-ui-font text-slate-700' : 'text-gray-600'}`}>{comment.message}</p>
            </div>
          ))
        )}
      </div>
      {profile && (
        <form onSubmit={addCommentToThread} className="mt-3 flex flex-col gap-3">
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={2}
            placeholder={labels.addContextComment}
            className={`w-full rounded-2xl px-4 py-3 text-sm resize-none ${isCode
              ? 'kanban-ui-font min-h-0 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/30 focus-visible:ring-0'
              : 'ui-form-field min-h-0'}`}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${isCode
                ? 'kanban-ui-font border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                : 'ui-action-primary'}`}
            >
              <Send size={14} />
              {labels.addComment}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// --- Components ---

const Sidebar = () => {
  const { profile, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const labels = workspaceLabels[language];
  const navigate = useNavigate();
  const location = useLocation();
  const projectMatch = useMatch('/project/:projectId');

  const menuItems = [
    { icon: House, label: t.dashboard, path: '/' },
    ...(profile?.role === 'admin' ? [{ icon: Handshake, label: t.clients, path: '/clients' }] : []),
  ];
  const projectSectionItems = getProjectSectionItems(language);
  const activeProjectSection = (() => {
    const params = new URLSearchParams(location.search);
    const value = params.get('section');
    return isProjectSectionId(value) ? value : 'overview';
  })();

  return (
    <div className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-[#1d3f61] bg-[#13283f]/98 text-[#eef6ff] backdrop-blur">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-7">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#1f4263] shadow-sm shadow-black/20">
            <FolderOpen className="size-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">PM Hub</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="ui-focus-ring ui-interactive-button group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 font-medium text-[#bfd2e3] transition-colors hover:bg-white/8 hover:text-white"
            >
              <span className="flex size-5 items-center justify-center text-[#8fb0c7] transition-colors group-hover:text-white">
                <item.icon size={18} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {projectMatch && (
          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8fb0c7]">
              {labels.projectViews}
            </p>
            <div className="space-y-1">
              {projectSectionItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`${projectMatch.pathname}?section=${item.id}`)}
                  className={`ui-focus-ring ui-interactive-button group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
                    activeProjectSection === item.id
                      ? 'bg-white text-[#13283f] shadow-sm ring-1 ring-white/10'
                      : 'text-[#bfd2e3] hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span className={`flex size-5 items-center justify-center transition-colors ${
                    activeProjectSection === item.id
                      ? 'text-[#1d3f61]'
                      : 'text-[#8fb0c7] group-hover:text-white'
                  }`}>
                    <item.icon size={17} />
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-white/10 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10">
            {profile?.displayName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-white">{profile?.displayName}</p>
            <p className="truncate text-xs capitalize text-[#8fb0c7]">{profile?.role}</p>
          </div>
        </div>
        <div className="mb-4">
          <LanguageSwitcher />
        </div>
        <button
          type="button"
          onClick={logout}
          className="ui-focus-ring flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-[#ffd1d7] transition-colors hover:bg-white/8"
        >
          <LogOut size={20} />
          {t.logout}
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();
  const addProjectButtonRef = useRef<HTMLButtonElement>(null);
  const addProjectModalRef = useRef<HTMLDivElement>(null);
  const addProjectNameInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState<ProjectFormState>(getInitialProjectForm());
  const [clients, setClients] = useState<UserProfile[]>([]);

  useAccessibleModal({
    isOpen: showAddModal,
    onClose: () => setShowAddModal(false),
    containerRef: addProjectModalRef,
    initialFocusRef: addProjectNameInputRef,
    triggerRef: addProjectButtonRef,
  });

  useEffect(() => {
    if (!profile) return;

    const unsubscribers: Array<() => void> = [];

    if (profile.role === 'admin') {
      const projectsQuery = query(collection(db, 'projects'), where('adminUid', '==', profile.uid));
      unsubscribers.push(
        onSnapshot(projectsQuery, (snapshot) => {
          setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        }),
      );
    } else {
      let legacyProjects: Project[] = [];
      let membershipProjects: Project[] = [];
      const mergeProjects = () => {
        const projectMap = new Map<string, Project>();
        [...legacyProjects, ...membershipProjects].forEach(project => {
          projectMap.set(project.id, project);
        });
        setProjects(Array.from(projectMap.values()));
      };

      const legacyQuery = query(collection(db, 'projects'), where('clientUid', '==', profile.uid));
      const memberQuery = query(collection(db, 'projects'), where('memberUids', 'array-contains', profile.uid));

      unsubscribers.push(
        onSnapshot(legacyQuery, snapshot => {
          legacyProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
          mergeProjects();
        }),
      );

      unsubscribers.push(
        onSnapshot(memberQuery, snapshot => {
          membershipProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
          mergeProjects();
        }),
      );
    }

    if (profile.role === 'admin') {
      const clientsQ = query(collection(db, 'users'), where('role', '==', 'client'));
      unsubscribers.push(
        onSnapshot(clientsQ, (snapshot) => {
          setClients(snapshot.docs.map(doc => doc.data() as UserProfile));
        }),
      );
    }

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [profile]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const projectRef = doc(collection(db, 'projects'));
    const memberUids: string[] = Array.from(new Set(newProject.memberUids));
    const now = new Date().toISOString();
    const batch = writeBatch(db);

    batch.set(projectRef, {
      name: newProject.name,
      description: newProject.description,
      status: 'active',
      adminUid: profile.uid,
      clientUid: memberUids[0] ?? '',
      memberUids,
      createdAt: now,
      updatedAt: now,
    });

    memberUids.forEach(uid => {
      batch.set(doc(collection(projectRef, 'members'), uid), {
        uid,
        role: 'viewer',
        addedAt: now,
      } satisfies ProjectMember);
    });

    await batch.commit();
    setShowAddModal(false);
    setNewProject(getInitialProjectForm());
  };

  const toggleNewProjectClient = (uid: string) => {
    setNewProject(current => ({
      ...current,
      memberUids: current.memberUids.includes(uid)
        ? current.memberUids.filter(memberUid => memberUid !== uid)
        : [...current.memberUids, uid],
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="ui-text-main text-3xl font-bold">{t.projects}</h1>
          <p className="ui-text-subtle">{t.manageProjects}</p>
        </div>
        {profile?.role === 'admin' && (
          <button
            ref={addProjectButtonRef}
            type="button"
            onClick={() => setShowAddModal(true)}
            className="ui-focus-ring ui-interactive-button ui-action-primary flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all"
          >
            <Plus size={20} />
            {t.newProject}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.button
            layoutId={project.id}
            key={project.id}
            type="button"
            onClick={() => navigate(`/project/${project.id}`)}
            className="ui-focus-ring ui-interactive-card ui-panel-card group cursor-pointer rounded-2xl p-6 text-left"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                project.status === 'active' ? 'bg-[#e4f3ef] text-[#27695f]' :
                project.status === 'on-hold' ? 'bg-amber-50 text-amber-900' :
                'bg-[#e9f4fa] text-[#245b7d]'
              }`}>
                {getProjectStatusLabel(project.status, language)}
              </div>
              <ChevronRight className="text-slate-300 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-[#17324d]" />
            </div>
            <h3 className="ui-text-main mb-2 text-xl font-bold">{project.name}</h3>
            <p className="ui-text-subtle mb-6 line-clamp-2 text-sm">{project.description}</p>
            
            <div className="ui-kicker flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1">
                <CalendarDays size={14} />
                {new Date(project.createdAt).toLocaleDateString(getLocale(language))}
              </div>
              {profile?.role === 'admin' && (
                <div className="flex items-center gap-1">
                  <Handshake size={14} />
                  {getAssignedClientUids(project).length}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowAddModal(false);
            }}
          >
            <motion.div
              ref={addProjectModalRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-project-dialog-title"
              className="ui-panel-card w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h2 id="new-project-dialog-title" className="text-2xl font-bold mb-6">{t.createNewProject}</h2>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="ui-text-main mb-1 block text-sm font-medium">{t.projectName}</label>
                  <input
                    ref={addProjectNameInputRef}
                    required
                    type="text"
                    value={newProject.name}
                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                    className="ui-focus-ring ui-form-field w-full rounded-xl px-4 py-3 outline-none transition-all"
                    placeholder={t.websiteRedesign}
                  />
                </div>
                <div>
                  <label className="ui-text-main mb-1 block text-sm font-medium">{t.description}</label>
                  <Textarea
                    value={newProject.description}
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                    className="ui-form-field min-h-24 resize-none rounded-xl px-4 py-3"
                    placeholder={t.projectGoals}
                  />
                </div>
                <div>
                  <ClientAccessPicker
                    clients={clients}
                    selectedUids={newProject.memberUids}
                    onToggle={toggleNewProjectClient}
                    title={t.assignClient}
                    helperText={t.chooseClients}
                    emptyText={t.noClientsAvailable}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="ui-focus-ring ui-action-secondary flex-1 rounded-xl px-6 py-3 font-medium transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="ui-focus-ring ui-action-primary flex-1 rounded-xl px-6 py-3 font-medium transition-colors"
                  >
                    {t.create}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProjectDetails = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projectId } = useParams();
  const { profile } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const labels = workspaceLabels[language];
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdateEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [clientActions, setClientActions] = useState<ClientActionItem[]>([]);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [activeComposer, setActiveComposer] = useState<ProjectComposerId | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState(getInitialTaskForm());
  const [selectedMemberUids, setSelectedMemberUids] = useState<string[]>([]);
  const [projectMetaForm, setProjectMetaForm] = useState<ProjectMetaFormState>(getInitialProjectMetaForm());
  const [newUpdate, setNewUpdate] = useState<ProjectUpdateFormState>(getInitialUpdateForm());
  const [newMilestone, setNewMilestone] = useState<MilestoneFormState>(getInitialMilestoneForm());
  const [newApproval, setNewApproval] = useState<ApprovalFormState>(getInitialApprovalForm());
  const [newRisk, setNewRisk] = useState<RiskFormState>(getInitialRiskForm());
  const [newDeliverable, setNewDeliverable] = useState<DeliverableFormState>(getInitialDeliverableForm());
  const [newClientAction, setNewClientAction] = useState<ClientActionFormState>(getInitialClientActionForm());
  const [approvalDecisionNotes, setApprovalDecisionNotes] = useState<Record<string, string>>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editingApprovalId, setEditingApprovalId] = useState<string | null>(null);
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [editingDeliverableId, setEditingDeliverableId] = useState<string | null>(null);
  const [editingClientActionId, setEditingClientActionId] = useState<string | null>(null);
  const [expandedOverviewControls, setExpandedOverviewControls] = useState(false);
  const [expandedClientPanels, setExpandedClientPanels] = useState<Record<ClientPanelId, boolean>>({
    updates: true,
    approvals: true,
    deliverables: true,
    'client-actions': true,
  });
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});
  const [executionSearch, setExecutionSearch] = useState('');
  const [executionStatusFilter, setExecutionStatusFilter] = useState<'all' | Task['status']>('all');
  const [executionApprovalFilter, setExecutionApprovalFilter] = useState<'all' | 'requires-approval'>('all');

  const canManage = profile?.role === 'admin';
  const activeSection = (() => {
    const value = searchParams.get('section');
    return isProjectSectionId(value) ? value : 'overview';
  })();

  useEffect(() => {
    if (!projectId) return;

    const unsubscribers: Array<() => void> = [];
    const projectRef = doc(db, 'projects', projectId);

    unsubscribers.push(
      onSnapshot(projectRef, snapshot => {
        if (snapshot.exists()) {
          setProject({ id: snapshot.id, ...snapshot.data() } as Project);
        }
      }),
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'projects', projectId, 'tasks'), orderBy('order', 'asc')), snapshot => {
        setTasks(snapshot.docs.map(doc => {
          const data = doc.data() as Task;
          return {
            id: doc.id,
            ...data,
            priority: data.priority === 'high' ? 'high' : 'regular',
          } as Task;
        }));
      }),
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'projects', projectId, 'updates'), orderBy('createdAt', 'desc')), snapshot => {
        setUpdates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectUpdateEntry)));
      }),
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'projects', projectId, 'milestones'), orderBy('dueDate', 'asc')), snapshot => {
        setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone)));
      }),
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'projects', projectId, 'approvals'), orderBy('requestedAt', 'desc')), snapshot => {
        setApprovals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApprovalRequest)));
      }),
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'projects', projectId, 'risks'), orderBy('createdAt', 'desc')), snapshot => {
        setRisks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RiskItem)));
      }),
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'projects', projectId, 'deliverables'), orderBy('uploadedAt', 'desc')), snapshot => {
        setDeliverables(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deliverable)));
      }),
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'projects', projectId, 'clientActions'), orderBy('dueDate', 'asc')), snapshot => {
        setClientActions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientActionItem)));
      }),
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'projects', projectId, 'comments'), orderBy('createdAt', 'desc')), snapshot => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectComment)));
      }),
    );

    unsubscribers.push(
      onSnapshot(query(collection(db, 'projects', projectId, 'activity'), orderBy('createdAt', 'desc')), snapshot => {
        setActivity(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityEntry)));
      }),
    );

    if (profile?.role === 'admin') {
      unsubscribers.push(
        onSnapshot(query(collection(db, 'users'), where('role', '==', 'client')), snapshot => {
          setClients(snapshot.docs.map(doc => doc.data() as UserProfile));
        }),
      );
    }

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [projectId, profile]);

  useEffect(() => {
    setSelectedMemberUids(getAssignedClientUids(project));
    setProjectMetaForm(getInitialProjectMetaForm(project));
  }, [project]);

  useEffect(() => {
    const composerSectionMap: Record<ProjectComposerId, ProjectSectionId> = {
      milestone: 'planning',
      update: 'client',
      approval: 'client',
      deliverable: 'client',
      'client-action': 'client',
    };

    if (activeComposer && composerSectionMap[activeComposer] !== activeSection) {
      setActiveComposer(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  useEffect(() => {
    if (!activeComposer) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeComposer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setActiveComposer(null);
      if (showTaskModal) closeTaskComposer();
      if (showRiskModal) closeRiskComposer();
      if (showAccessModal) setShowAccessModal(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAccessModal, showRiskModal, showTaskModal]);

  const closeSectionComposer = (composer: ProjectComposerId) => {
    if (activeComposer === composer) {
      setActiveComposer(null);
    }
  };

  const openTaskComposer = (task?: Task) => {
    setEditingTaskId(task?.id ?? null);
    setNewTask(task
      ? {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority === 'high' ? 'high' : 'regular',
          requiresApproval: Boolean(task.requiresApproval),
        }
      : getInitialTaskForm());
    setShowTaskModal(true);
  };

  const closeTaskComposer = () => {
    setEditingTaskId(null);
    setNewTask(getInitialTaskForm());
    setShowTaskModal(false);
  };

  const openRiskComposer = (risk?: RiskItem) => {
    setEditingRiskId(risk?.id ?? null);
    setNewRisk(risk
      ? {
          title: risk.title,
          description: risk.description,
          impact: risk.impact,
          owner: risk.owner,
          mitigation: risk.mitigation,
        }
      : getInitialRiskForm());
    setShowRiskModal(true);
  };

  const closeRiskComposer = () => {
    setEditingRiskId(null);
    setNewRisk(getInitialRiskForm());
    setShowRiskModal(false);
  };

  const openUpdateComposer = (entry?: ProjectUpdateEntry) => {
    setEditingUpdateId(entry?.id ?? null);
    setNewUpdate(entry
      ? {
          title: entry.title,
          summary: entry.summary,
          achievements: entry.achievements,
          blockers: entry.blockers,
          nextSteps: entry.nextSteps,
          progress: String(entry.progress),
        }
      : getInitialUpdateForm());
    setActiveComposer('update');
  };

  const closeUpdateComposer = () => {
    setEditingUpdateId(null);
    setNewUpdate(getInitialUpdateForm());
    closeSectionComposer('update');
  };

  const openMilestoneComposer = (milestone?: Milestone) => {
    setEditingMilestoneId(milestone?.id ?? null);
    setNewMilestone(milestone
      ? {
          title: milestone.title,
          description: milestone.description,
          dueDate: milestone.dueDate,
          owner: milestone.owner,
          progress: String(milestone.progress),
        }
      : getInitialMilestoneForm());
    setActiveComposer('milestone');
  };

  const closeMilestoneComposer = () => {
    setEditingMilestoneId(null);
    setNewMilestone(getInitialMilestoneForm());
    closeSectionComposer('milestone');
  };

  const toggleClientPanel = (panel: ClientPanelId) => {
    setExpandedClientPanels(current => ({ ...current, [panel]: !current[panel] }));
  };

  const openClientPanel = (panel: ClientPanelId) => {
    setExpandedClientPanels(current => ({ ...current, [panel]: true }));
  };

  const toggleMilestoneExpanded = (milestoneId: string) => {
    setExpandedMilestones(current => ({ ...current, [milestoneId]: !(current[milestoneId] ?? false) }));
  };

  const openApprovalComposer = (approval?: ApprovalRequest) => {
    setEditingApprovalId(approval?.id ?? null);
    setNewApproval(approval
      ? {
          title: approval.title,
          description: approval.description,
          itemType: approval.itemType,
        }
      : getInitialApprovalForm());
    setActiveComposer('approval');
  };

  const closeApprovalComposer = () => {
    setEditingApprovalId(null);
    setNewApproval(getInitialApprovalForm());
    closeSectionComposer('approval');
  };

  const openDeliverableComposer = (deliverable?: Deliverable) => {
    setEditingDeliverableId(deliverable?.id ?? null);
    setNewDeliverable(deliverable
      ? {
          title: deliverable.title,
          category: deliverable.category,
          url: deliverable.url,
          version: deliverable.version,
          notes: deliverable.notes,
        }
      : getInitialDeliverableForm());
    setActiveComposer('deliverable');
  };

  const closeDeliverableComposer = () => {
    setEditingDeliverableId(null);
    setNewDeliverable(getInitialDeliverableForm());
    closeSectionComposer('deliverable');
  };

  const openClientActionComposer = (item?: ClientActionItem) => {
    setEditingClientActionId(item?.id ?? null);
    setNewClientAction(item
      ? {
          title: item.title,
          description: item.description,
          dueDate: item.dueDate,
        }
      : getInitialClientActionForm());
    setActiveComposer('client-action');
  };

  const closeClientActionComposer = () => {
    setEditingClientActionId(null);
    setNewClientAction(getInitialClientActionForm());
    closeSectionComposer('client-action');
  };

  const trackActivity = async (type: string, message: string) => {
    if (!projectId || !profile) return;
    await logProjectActivity(projectId, profile, type, message);
  };

  const getTaskRuleSafeFields = (task: Task) => ({
    projectId: typeof task.projectId === 'string' && task.projectId ? task.projectId : (projectId ?? ''),
    title: typeof task.title === 'string' && task.title.trim().length > 0 ? task.title.trim() : 'Task',
    order: typeof task.order === 'number' && Number.isFinite(task.order) ? task.order : 0,
    priority: task.priority === 'high' ? 'high' : 'regular',
    requiresApproval: Boolean(task.requiresApproval),
  });

  const getTaskTransitionPatch = (task: Task, nextStatus: Task['status']) => {
    const patch: Record<string, unknown> = { status: nextStatus };

    if (nextStatus === 'approval') {
      patch.approvalRequestedAt = new Date().toISOString();
      patch.approvedAt = deleteField();
      patch.approvedByUid = deleteField();
      patch.approvedByName = deleteField();
      return patch;
    }

    if (nextStatus === 'done' && task.status === 'approval') {
      return patch;
    }

    patch.approvalRequestedAt = deleteField();
    patch.approvedAt = deleteField();
    patch.approvedByUid = deleteField();
    patch.approvedByName = deleteField();
    return patch;
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !profile || !canManage) return;

    const taskTitle = newTask.title.trim();
    if (!taskTitle) return;
    const requiresApproval = Boolean(newTask.requiresApproval);
    const priority: Task['priority'] = newTask.priority === 'high' ? 'high' : 'regular';
    const normalizedStatus: Task['status'] = requiresApproval
      ? newTask.status
      : (newTask.status === 'approval' ? 'in-progress' : newTask.status);

    if (editingTaskId) {
      const task = tasks.find(entry => entry.id === editingTaskId);
      await updateDoc(doc(db, 'projects', projectId, 'tasks', editingTaskId), {
        title: taskTitle,
        description: newTask.description.trim(),
        status: normalizedStatus,
        priority,
        requiresApproval,
        ...(task && task.status !== normalizedStatus ? getTaskTransitionPatch(task, normalizedStatus) : {}),
      });
    } else {
      await addDoc(collection(db, 'projects', projectId, 'tasks'), {
        ...newTask,
        title: taskTitle,
        description: newTask.description.trim(),
        status: normalizedStatus,
        priority,
        requiresApproval,
        ...(normalizedStatus === 'approval' ? { approvalRequestedAt: new Date().toISOString() } : {}),
        projectId,
        order: tasks.length,
        createdAt: new Date().toISOString(),
      });
    }
    await touchProject(projectId);
    await trackActivity('task', `${editingTaskId ? 'Updated' : 'Created'} task "${taskTitle}"`);
    closeTaskComposer();
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    if (!projectId || !canManage) return;
    const task = tasks.find(entry => entry.id === taskId);
    if (!task) return;
    await updateDoc(doc(db, 'projects', projectId, 'tasks', taskId), {
      ...getTaskRuleSafeFields(task),
      ...getTaskTransitionPatch(task, newStatus),
    });
    await touchProject(projectId);
    await trackActivity('task', `Moved task "${task.title}" to ${newStatus}`);
  };

  const toggleTaskApprovalRequirement = async (task: Task) => {
    if (!projectId || !canManage) return;

    const nextRequiresApproval = !task.requiresApproval;
    const patch: Record<string, unknown> = {
      ...getTaskRuleSafeFields(task),
      requiresApproval: nextRequiresApproval,
    };

    if (!nextRequiresApproval && task.status === 'approval') {
      Object.assign(patch, getTaskTransitionPatch(task, 'in-progress'));
    }

    await updateDoc(doc(db, 'projects', projectId, 'tasks', task.id), patch);
    await touchProject(projectId);
    await trackActivity(
      'task',
      `${nextRequiresApproval ? 'Marked' : 'Removed'} approval requirement for task "${task.title}"`,
    );
  };

  const toggleTaskPriority = async (task: Task) => {
    if (!projectId || !canManage) return;

    const nextPriority: Task['priority'] = task.priority === 'high' ? 'regular' : 'high';
    await updateDoc(doc(db, 'projects', projectId, 'tasks', task.id), {
      ...getTaskRuleSafeFields(task),
      priority: nextPriority,
    });
    await touchProject(projectId);
    await trackActivity('task', `${nextPriority === 'high' ? 'Marked' : 'Lowered'} priority for task "${task.title}"`);
  };

  const approveTask = async (task: Task) => {
    if (!projectId || !profile || task.status !== 'approval') return;

    await updateDoc(doc(db, 'projects', projectId, 'tasks', task.id), {
      ...getTaskRuleSafeFields(task),
      status: 'done',
      approvedAt: new Date().toISOString(),
      approvedByUid: profile.uid,
      approvedByName: getActorName(profile),
    });
    if (canManage) {
      await touchProject(projectId);
    }
    await trackActivity('task', `Approved task "${task.title}"`);
  };

  const deleteTask = async (taskId: string) => {
    if (!projectId || !canManage || !window.confirm(t.deleteTaskConfirm)) return;
    const task = tasks.find(entry => entry.id === taskId);
    await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
    await touchProject(projectId);
    if (task) {
      await trackActivity('task', `Deleted task "${task.title}"`);
    }
  };

  const toggleSelectedMember = (uid: string) => {
    setSelectedMemberUids(current =>
      current.includes(uid) ? current.filter(memberUid => memberUid !== uid) : [...current, uid],
    );
  };

  const notifySuccess = (english: string, spanish: string) => {
    toast.success(language === 'es' ? spanish : english);
  };

  const saveProjectAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !canManage || !project) return;

    await syncProjectMemberships(projectId, selectedMemberUids, getAssignedClientUids(project));
    await touchProject(projectId);
    await trackActivity('access', `Updated client access for project "${project.name}"`);
    setShowAccessModal(false);
    notifySuccess('Access updated.', 'Acceso actualizado.');
  };

  const saveProjectOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !canManage) return;

    const parseNumber = (value: string) => value.trim() === '' ? deleteField() : Number(value);

    await updateDoc(doc(db, 'projects', projectId), {
      health: projectMetaForm.health,
      budgetHours: parseNumber(projectMetaForm.budgetHours),
      usedHours: parseNumber(projectMetaForm.usedHours),
      budgetAmount: parseNumber(projectMetaForm.budgetAmount),
      spentAmount: parseNumber(projectMetaForm.spentAmount),
      scopeSummary: projectMetaForm.scopeSummary.trim() || deleteField(),
      updatedAt: new Date().toISOString(),
    });
    await trackActivity('overview', 'Updated executive project controls');
    notifySuccess('Overview saved.', 'Resumen guardado.');
  };

  const createUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !profile || !canManage) return;

    const title = newUpdate.title.trim();
    if (!title) return;

    const payload = {
      title,
      summary: newUpdate.summary.trim(),
      achievements: newUpdate.achievements.trim(),
      blockers: newUpdate.blockers.trim(),
      nextSteps: newUpdate.nextSteps.trim(),
      progress: clampPercent(Number(newUpdate.progress || '0')),
    };

    if (editingUpdateId) {
      await updateDoc(doc(db, 'projects', projectId, 'updates', editingUpdateId), payload);
    } else {
      await addDoc(collection(db, 'projects', projectId, 'updates'), {
        ...payload,
        createdAt: new Date().toISOString(),
        authorUid: profile.uid,
        authorName: getActorName(profile),
      } satisfies Omit<ProjectUpdateEntry, 'id'>);
    }
    await touchProject(projectId);
    await trackActivity('update', `${editingUpdateId ? 'Updated' : 'Published'} update "${title}"`);
    closeUpdateComposer();
    notifySuccess(
      editingUpdateId ? 'Update saved.' : 'Update published.',
      editingUpdateId ? 'Actualizacion guardada.' : 'Actualizacion publicada.',
    );
  };

  const createMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !canManage) return;

    const title = newMilestone.title.trim();
    if (!title || !newMilestone.dueDate) return;

    const payload = {
      title,
      description: newMilestone.description.trim(),
      dueDate: newMilestone.dueDate,
      progress: clampPercent(Number(newMilestone.progress || '0')),
      owner: newMilestone.owner.trim(),
    };

    if (editingMilestoneId) {
      await updateDoc(doc(db, 'projects', projectId, 'milestones', editingMilestoneId), payload);
    } else {
      await addDoc(collection(db, 'projects', projectId, 'milestones'), {
        ...payload,
        status: 'planned',
        createdAt: new Date().toISOString(),
      } satisfies Omit<Milestone, 'id'>);
    }
    await touchProject(projectId);
    await trackActivity('milestone', `${editingMilestoneId ? 'Updated' : 'Created'} milestone "${title}"`);
    closeMilestoneComposer();
    notifySuccess(
      editingMilestoneId ? 'Milestone saved.' : 'Milestone created.',
      editingMilestoneId ? 'Hito guardado.' : 'Hito creado.',
    );
  };

  const updateMilestoneStatus = async (milestone: Milestone, status: MilestoneStatus) => {
    if (!projectId || !canManage) return;

    await updateDoc(doc(db, 'projects', projectId, 'milestones', milestone.id), {
      status,
      progress: status === 'completed' ? 100 : milestone.progress,
    });
    await touchProject(projectId);
    await trackActivity('milestone', `Updated milestone "${milestone.title}" to ${status}`);
  };

  const deleteMilestone = async (milestone: Milestone) => {
    if (!projectId || !canManage) return;
    if (!window.confirm(labels.deleteMilestoneConfirm)) return;

    await deleteDoc(doc(db, 'projects', projectId, 'milestones', milestone.id));
    await touchProject(projectId);
    await trackActivity('milestone', `Deleted milestone "${milestone.title}"`);

    if (editingMilestoneId === milestone.id) {
      closeMilestoneComposer();
    }

    setExpandedMilestones(current => {
      const next = { ...current };
      delete next[milestone.id];
      return next;
    });
    notifySuccess('Milestone deleted.', 'Hito eliminado.');
  };

  const createApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !profile || !canManage) return;

    const title = newApproval.title.trim();
    if (!title) return;

    const payload = {
      title,
      description: newApproval.description.trim(),
      itemType: newApproval.itemType,
    };

    if (editingApprovalId) {
      await updateDoc(doc(db, 'projects', projectId, 'approvals', editingApprovalId), payload);
    } else {
      await addDoc(collection(db, 'projects', projectId, 'approvals'), {
        ...payload,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        requestedByUid: profile.uid,
        requestedByName: getActorName(profile),
      } satisfies Omit<ApprovalRequest, 'id'>);
    }
    await touchProject(projectId);
    await trackActivity('approval', `${editingApprovalId ? 'Updated' : 'Requested approval for'} "${title}"`);
    closeApprovalComposer();
    notifySuccess(
      editingApprovalId ? 'Approval request updated.' : 'Approval request created.',
      editingApprovalId ? 'Solicitud de aprobacion actualizada.' : 'Solicitud de aprobacion creada.',
    );
  };

  const respondToApproval = async (approval: ApprovalRequest, status: ApprovalStatus) => {
    if (!projectId || !profile) return;

    const decisionNote = approvalDecisionNotes[approval.id]?.trim() ?? '';

    await updateDoc(doc(db, 'projects', projectId, 'approvals', approval.id), {
      status,
      decidedAt: new Date().toISOString(),
      decidedByUid: profile.uid,
      decidedByName: getActorName(profile),
      decisionNote,
    });
    if (canManage) {
      await touchProject(projectId);
    }
    await trackActivity('approval', `${status === 'approved' ? 'Approved' : 'Requested changes for'} "${approval.title}"`);
    notifySuccess(
      status === 'approved' ? 'Approval recorded.' : 'Changes requested.',
      status === 'approved' ? 'Aprobacion registrada.' : 'Cambios solicitados.',
    );
  };

  const createRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !canManage) return;

    const title = newRisk.title.trim();
    if (!title) return;

    const payload = {
      title,
      description: newRisk.description.trim(),
      impact: newRisk.impact,
      owner: newRisk.owner.trim(),
      mitigation: newRisk.mitigation.trim(),
    };

    if (editingRiskId) {
      await updateDoc(doc(db, 'projects', projectId, 'risks', editingRiskId), payload);
    } else {
      await addDoc(collection(db, 'projects', projectId, 'risks'), {
        ...payload,
        status: 'open',
        createdAt: new Date().toISOString(),
      } satisfies Omit<RiskItem, 'id'>);
    }
    await touchProject(projectId);
    await trackActivity('risk', `${editingRiskId ? 'Updated' : 'Logged'} blocker "${title}"`);
    closeRiskComposer();
    notifySuccess(
      editingRiskId ? 'Blocker saved.' : 'Blocker logged.',
      editingRiskId ? 'Bloqueador guardado.' : 'Bloqueador registrado.',
    );
  };

  const updateRiskStatus = async (risk: RiskItem, status: RiskStatus) => {
    if (!projectId || !canManage) return;
    await updateDoc(doc(db, 'projects', projectId, 'risks', risk.id), { status });
    await touchProject(projectId);
    await trackActivity('risk', `Updated risk "${risk.title}" to ${status}`);
  };

  const createDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !canManage) return;

    const title = newDeliverable.title.trim();
    if (!title || !newDeliverable.url.trim()) return;

    const payload = {
      title,
      category: newDeliverable.category.trim(),
      url: newDeliverable.url.trim(),
      version: newDeliverable.version.trim() || 'v1',
      notes: newDeliverable.notes.trim(),
    };

    if (editingDeliverableId) {
      await updateDoc(doc(db, 'projects', projectId, 'deliverables', editingDeliverableId), payload);
    } else {
      await addDoc(collection(db, 'projects', projectId, 'deliverables'), {
        ...payload,
        status: 'draft',
        uploadedAt: new Date().toISOString(),
      } satisfies Omit<Deliverable, 'id'>);
    }
    await touchProject(projectId);
    await trackActivity('deliverable', `${editingDeliverableId ? 'Updated' : 'Added'} deliverable "${title}"`);
    closeDeliverableComposer();
    notifySuccess(
      editingDeliverableId ? 'Deliverable saved.' : 'Deliverable added.',
      editingDeliverableId ? 'Entregable guardado.' : 'Entregable agregado.',
    );
  };

  const updateDeliverableStatus = async (deliverable: Deliverable, status: DeliverableStatus) => {
    if (!projectId || !canManage) return;
    await updateDoc(doc(db, 'projects', projectId, 'deliverables', deliverable.id), { status });
    await touchProject(projectId);
    await trackActivity('deliverable', `Updated deliverable "${deliverable.title}" to ${status}`);
  };

  const createClientAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !canManage) return;

    const title = newClientAction.title.trim();
    if (!title || !newClientAction.dueDate) return;

    const payload = {
      title,
      description: newClientAction.description.trim(),
      dueDate: newClientAction.dueDate,
    };

    if (editingClientActionId) {
      await updateDoc(doc(db, 'projects', projectId, 'clientActions', editingClientActionId), payload);
    } else {
      await addDoc(collection(db, 'projects', projectId, 'clientActions'), {
        ...payload,
        status: 'pending',
        createdAt: new Date().toISOString(),
      } satisfies Omit<ClientActionItem, 'id'>);
    }
    await touchProject(projectId);
    await trackActivity('client-action', `${editingClientActionId ? 'Updated' : 'Created'} client action "${title}"`);
    closeClientActionComposer();
    notifySuccess(
      editingClientActionId ? 'Client item saved.' : 'Client item created.',
      editingClientActionId ? 'Pendiente del cliente guardado.' : 'Pendiente del cliente creado.',
    );
  };

  const updateClientActionStatus = async (item: ClientActionItem, status: ClientActionStatus) => {
    if (!projectId || !profile) return;
    await updateDoc(doc(db, 'projects', projectId, 'clientActions', item.id), { status });
    if (canManage) {
      await touchProject(projectId);
    }
    await trackActivity('client-action', `Updated client action "${item.title}" to ${status}`);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const tasksAwaitingApproval = tasks.filter(task => task.status === 'approval').length;
  const taskProgress = totalTasks > 0 ? clampPercent((completedTasks / totalTasks) * 100) : 0;
  const latestUpdate = updates[0];
  const overallProgress = latestUpdate?.progress ?? taskProgress;
  const assignedClientUids = getAssignedClientUids(project);
  const assignedClients = clients.filter(client => assignedClientUids.includes(client.uid));
  const editingTask = editingTaskId ? tasks.find(task => task.id === editingTaskId) ?? null : null;
  const pendingApprovals = approvals.filter(approval => approval.status === 'pending');
  const openRisks = risks.filter(risk => risk.status === 'open');
  const pendingClientItems = clientActions.filter(item => item.status === 'pending');
  const upcomingMilestones = milestones.filter(milestone => milestone.status !== 'completed').slice(0, 4);
  const nextMilestone = milestones
    .filter(milestone => milestone.status !== 'completed')
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const atRiskMilestones = milestones.filter(milestone => milestone.status === 'at-risk');
  const updatesAttentionCount = updates.filter(entry => entry.blockers.trim().length > 0).length;
  const approvalsAttentionCount = pendingApprovals.length;
  const deliverablesAttentionCount = deliverables.filter(deliverable => deliverable.status !== 'approved').length;
  const clientActionsAttentionCount = clientActions.filter(item => item.status !== 'done').length;
  const attentionItems = [
    pendingApprovals.length > 0 ? { label: labels.pendingApprovals, count: pendingApprovals.length } : null,
    pendingClientItems.length > 0 ? { label: labels.pendingClientActions, count: pendingClientItems.length } : null,
    atRiskMilestones.length > 0 ? { label: labels.markAtRisk, count: atRiskMilestones.length } : null,
    openRisks.length > 0 ? { label: labels.openRisks, count: openRisks.length } : null,
  ].filter((item): item is { label: string; count: number } => Boolean(item));
  const attentionTotal = attentionItems.reduce((sum, item) => sum + item.count, 0);
  const hoursConsumed = project?.budgetHours ? clampPercent(((project.usedHours ?? 0) / project.budgetHours) * 100) : 0;
  const budgetConsumed = project?.budgetAmount ? clampPercent(((project.spentAmount ?? 0) / project.budgetAmount) * 100) : 0;
  const scopeChanges = approvals.filter(approval => approval.itemType === 'change-request' && approval.status === 'approved').length;
  const statusData = [
    { name: t.todo, value: tasks.filter(task => task.status === 'todo').length },
    { name: t.inProgress, value: tasks.filter(task => task.status === 'in-progress').length },
    { name: t.approval, value: tasksAwaitingApproval },
    { name: t.completed, value: tasks.filter(task => task.status === 'done').length },
  ];
  const normalizedExecutionSearch = executionSearch.trim().toLowerCase();
  const filteredExecutionTasks = tasks.filter(task => {
    if (executionStatusFilter !== 'all' && task.status !== executionStatusFilter) {
      return false;
    }

    if (executionApprovalFilter === 'requires-approval' && !task.requiresApproval) {
      return false;
    }

    if (!normalizedExecutionSearch) {
      return true;
    }

    const haystack = `${task.title} ${task.description}`.toLowerCase();
    return haystack.includes(normalizedExecutionSearch);
  });
  const hasExecutionFilters = normalizedExecutionSearch.length > 0
    || executionStatusFilter !== 'all'
    || executionApprovalFilter !== 'all';
  const canApproveTask = Boolean(profile) && (canManage || profile?.role === 'client');
  const progressTrendData = updates.length > 0
    ? updates
        .slice()
        .reverse()
        .map(update => ({
          label: formatDateLabel(update.createdAt, language),
          progress: update.progress,
        }))
    : [{ label: project ? formatDateLabel(project.createdAt, language) : 'Start', progress: overallProgress }];
  const validationText = language === 'es'
    ? {
        titleRequired: 'Ingresa un titulo.',
        categoryRequired: 'Selecciona una categoria.',
        dueDateRequired: 'Selecciona una fecha.',
        progressRange: 'Ingresa un valor entre 0 y 100.',
        urlRequired: 'Ingresa un enlace.',
        urlInvalid: 'Ingresa un enlace valido.',
        invalidNumber: 'Ingresa un numero valido.',
        nonNegativeNumber: 'Usa cero o un numero positivo.',
      }
    : {
        titleRequired: 'Enter a title.',
        categoryRequired: 'Select a category.',
        dueDateRequired: 'Select a date.',
        progressRange: 'Enter a value between 0 and 100.',
        urlRequired: 'Enter a resource URL.',
        urlInvalid: 'Enter a valid URL.',
        invalidNumber: 'Enter a valid number.',
        nonNegativeNumber: 'Use zero or a positive number.',
      };

  const renderExecutive = () => (
    <div className="space-y-8">
      <ExecutiveKpis
        items={[
          {
            label: labels.projectHealth,
            value: '',
            support: attentionTotal > 0 ? labels.attentionLabel : labels.onTrack,
            tone: 'status',
            statusLabel: getHealthLabel(project?.health ?? 'green', language),
            statusClassName: getHealthClasses(project?.health ?? 'green'),
          },
          {
            label: t.overallProgress,
            value: `${overallProgress}%`,
            support: `${completedTasks}/${totalTasks} ${t.completed.toLowerCase()}`,
          },
          {
            label: labels.nextMilestone,
            value: nextMilestone ? nextMilestone.title : '-',
            support: nextMilestone ? formatDateLabel(nextMilestone.dueDate, language) : labels.noMilestonesYet,
          },
          {
            label: labels.attentionLabel,
            value: `${attentionTotal}`,
            support: attentionTotal > 0 ? attentionItems[0]?.label ?? labels.attentionLabel : labels.noImmediateAttention,
          },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr,0.85fr] gap-8">
        <SectionBlock
          icon={ChartColumnBig}
          title={labels.executiveSummary}
          description={labels.latestStatus}
        >
          <ExecutiveSummaryCard
            title={latestUpdate?.title ?? ''}
            summary={latestUpdate?.summary ?? ''}
            createdAtLabel={latestUpdate ? formatDateTimeLabel(latestUpdate.createdAt, language) : ''}
            nextActionLabel={labels.nextAction}
            nextActionValue={latestUpdate?.nextSteps ?? ''}
            blockersLabel={labels.blockers}
            blockersValue={latestUpdate?.blockers || labels.onTrack}
            emptyTitle={labels.updateNeeded}
            emptyMessage={labels.noUpdatesYet}
          />
        </SectionBlock>

        <SectionBlock
          icon={TriangleAlert}
          title={labels.attentionLabel}
          description={labels.transparencyCenter}
        >
          <AttentionList
            items={attentionItems}
            emptyTitle={labels.noImmediateAttention}
            emptyMessage={labels.onTrack}
          />
        </SectionBlock>
      </div>

      <SectionBlock
        icon={CalendarDays}
        title={labels.upcomingMilestones}
        description={labels.roadmap}
      >
        <UpcomingMilestones
          milestones={upcomingMilestones.slice(0, 3)}
          statusLabelById={Object.fromEntries(upcomingMilestones.map(milestone => [
            milestone.id,
            getMilestoneStatusLabel(milestone.status, language),
          ]))}
          statusClassNameById={Object.fromEntries(upcomingMilestones.map(milestone => [
            milestone.id,
            getMilestoneClasses(milestone.status),
          ]))}
          dueDateLabelById={Object.fromEntries(upcomingMilestones.map(milestone => [
            milestone.id,
            formatDateLabel(milestone.dueDate, language),
          ]))}
          emptyState={<EmptyCollectionState message={labels.noMilestonesYet} />}
        />
      </SectionBlock>

      {canManage && (
        <SectionBlock
          icon={ShieldCheck}
          title={labels.internalControls}
          description={labels.budgetSnapshot}
          collapsible
          expanded={expandedOverviewControls}
          onToggle={() => setExpandedOverviewControls(current => !current)}
          toggleLabel={expandedOverviewControls ? labels.collapseSection : labels.expandSection}
        >
          <InternalControlsForm
            value={projectMetaForm}
            canManage={canManage}
            projectHealthLabel={labels.projectHealth}
            onTrackLabel={labels.onTrack}
            atRiskLabel={labels.atRisk}
            criticalLabel={labels.critical}
            budgetHoursLabel={labels.budgetHours}
            usedHoursLabel={labels.usedHours}
            budgetAmountLabel={labels.budgetAmount}
            spentAmountLabel={labels.spentAmount}
            scopeControlLabel={labels.scopeControl}
            scopePlaceholder={labels.scopePlaceholder}
            saveLabel={labels.saveOverview}
            hoursConsumedLabel={labels.hoursConsumed}
            hoursConsumedValue={`${project?.usedHours ?? 0} / ${project?.budgetHours ?? 0}`}
            hoursConsumedPercent={`${hoursConsumed}%`}
            hoursConsumedProgress={hoursConsumed}
            budgetConsumedLabel={labels.budgetConsumed}
            budgetConsumedValue={`${formatCurrency(project?.spentAmount, language)} / ${formatCurrency(project?.budgetAmount, language)}`}
            budgetConsumedPercent={`${budgetConsumed}%`}
            budgetConsumedProgress={budgetConsumed}
            scopeChangesLabel={labels.scopeChanges}
            scopeChangesValue={`${scopeChanges}`}
            scopeSummaryValue={project?.scopeSummary || '-'}
            invalidNumberMessage={validationText.invalidNumber}
            nonNegativeNumberMessage={validationText.nonNegativeNumber}
            onChange={(field, nextValue) => setProjectMetaForm(current => ({ ...current, [field]: nextValue }))}
            onHealthChange={nextValue => setProjectMetaForm(current => ({ ...current, health: nextValue as ProjectHealth }))}
            onSubmit={saveProjectOverview}
          />
        </SectionBlock>
      )}
    </div>
  );

  const renderTimeline = () => (
    <SectionBlock
      icon={CalendarDays}
      title={labels.roadmap}
      description={labels.upcomingMilestones}
      action={canManage ? (
        <SectionActionButton
          label={labels.addMilestone}
          onClick={() => openMilestoneComposer()}
        />
      ) : undefined}
    >
      <div className="space-y-8">
        {canManage && activeComposer === 'milestone' && (
          <MilestoneForm
            value={newMilestone}
            titleLabel={labels.addMilestone}
            titlePlaceholder={labels.milestonePlaceholder}
            dueDateLabel={labels.dueDate}
            ownerLabel={labels.owner}
            progressLabel={labels.progressPercent}
            descriptionLabel={t.description}
            cancelLabel={t.cancel}
            submitLabel={editingMilestoneId ? t.save : labels.addMilestone}
            titleErrorMessage={validationText.titleRequired}
            dueDateErrorMessage={validationText.dueDateRequired}
            progressErrorMessage={validationText.progressRange}
            onChange={(field, nextValue) => setNewMilestone(current => ({ ...current, [field]: nextValue }))}
            onCancel={closeMilestoneComposer}
            onSubmit={createMilestone}
          />
        )}

        <div className="space-y-5">
          {milestones.length === 0 ? (
            <EmptyCollectionState message={labels.noMilestonesYet} />
          ) : (
            milestones.map(milestone => {
              const isExpanded = expandedMilestones[milestone.id] ?? false;

              return (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  isExpanded={isExpanded}
                  canManage={canManage}
                  statusClassName={getMilestoneClasses(milestone.status)}
                  statusLabel={getMilestoneStatusLabel(milestone.status, language)}
                  dueDateLabel={labels.dueDate}
                  dueDateValue={formatDateLabel(milestone.dueDate, language)}
                  ownerLabel={labels.owner}
                  expandLabel={labels.expandSection}
                  collapseLabel={labels.collapseSection}
                  editLabel={t.edit}
                  deleteLabel={labels.deleteMilestone}
                  markPlannedLabel={labels.markPlanned}
                  markAtRiskLabel={labels.markAtRisk}
                  markCompletedLabel={labels.markCompleted}
                  onToggle={() => toggleMilestoneExpanded(milestone.id)}
                  onEdit={() => openMilestoneComposer(milestone)}
                  onDelete={() => { void deleteMilestone(milestone); }}
                  onMarkPlanned={() => { void updateMilestoneStatus(milestone, 'planned'); }}
                  onMarkAtRisk={() => { void updateMilestoneStatus(milestone, 'at-risk'); }}
                  onMarkCompleted={() => { void updateMilestoneStatus(milestone, 'completed'); }}
                  comments={projectId ? (
                    <CommentsThread
                      projectId={projectId}
                      contextType="milestone"
                      contextId={milestone.id}
                      comments={comments}
                      activityTargetLabel={`milestone "${milestone.title}"`}
                    />
                  ) : undefined}
                />
              );
            })
          )}
        </div>
      </div>
    </SectionBlock>
  );

  const renderUpdatesSection = () => (
    <SectionBlock
      icon={NotebookPen}
      title={labels.projectUpdates}
      description={labels.transparencyCenter}
      collapsible
      expanded={expandedClientPanels.updates}
      onToggle={() => toggleClientPanel('updates')}
      attentionCount={updatesAttentionCount}
      toggleLabel={expandedClientPanels.updates ? labels.collapseSection : labels.expandSection}
      action={canManage ? (
        <SectionActionButton
          label={labels.addUpdate}
          onClick={() => {
            openClientPanel('updates');
            openUpdateComposer();
          }}
        />
      ) : undefined}
    >
      <div className="space-y-6">
        {canManage && activeComposer === 'update' && (
          <UpdateForm
            value={newUpdate}
            titleLabel={labels.updateTitle}
            progressLabel={labels.progressPercent}
            summaryLabel={labels.summary}
            achievementsLabel={labels.achievements}
            blockersLabel={labels.blockers}
            nextStepsLabel={labels.nextSteps}
            titlePlaceholder={labels.updatePlaceholder}
            cancelLabel={t.cancel}
            submitLabel={editingUpdateId ? t.save : labels.addUpdate}
            titleErrorMessage={validationText.titleRequired}
            progressErrorMessage={validationText.progressRange}
            onChange={(field, nextValue) => setNewUpdate(current => ({ ...current, [field]: nextValue }))}
            onCancel={closeUpdateComposer}
            onSubmit={createUpdateEntry}
          />
        )}

        <div className="space-y-4">
          {updates.length === 0 ? (
            <EmptyCollectionState message={labels.noUpdatesYet} />
          ) : (
            updates.map(entry => (
              <UpdateCard
                key={entry.id}
                entry={entry}
                createdByLabel={labels.createdBy}
                summaryLabel={labels.summary}
                achievementsLabel={labels.achievements}
                blockersLabel={labels.blockers}
                nextStepsLabel={labels.nextSteps}
                createdAtLabel={formatDateTimeLabel(entry.createdAt, language)}
                editAction={canManage ? <InlineEditButton label={t.edit} onClick={() => openUpdateComposer(entry)} /> : undefined}
              />
            ))
          )}
        </div>
      </div>
    </SectionBlock>
  );

  const renderApprovalsSection = () => (
    <SectionBlock
      icon={BadgeCheck}
      title={labels.approvals}
      description={labels.pendingApprovals}
      collapsible
      expanded={expandedClientPanels.approvals}
      onToggle={() => toggleClientPanel('approvals')}
      attentionCount={approvalsAttentionCount}
      toggleLabel={expandedClientPanels.approvals ? labels.collapseSection : labels.expandSection}
      action={canManage ? (
        <SectionActionButton
          label={labels.requestApproval}
          onClick={() => {
            openClientPanel('approvals');
            openApprovalComposer();
          }}
        />
      ) : undefined}
    >
      <div className="space-y-6">
        {canManage && activeComposer === 'approval' && (
          <ApprovalForm
            value={newApproval}
            titleLabel={labels.requestApproval}
            titlePlaceholder={labels.approvalPlaceholder}
            categoryLabel={labels.category}
            descriptionLabel={t.description}
            cancelLabel={t.cancel}
            submitLabel={editingApprovalId ? t.save : labels.requestApproval}
            deliverableLabel={labels.deliverable}
            changeRequestLabel={labels.changeRequest}
            phaseLabel={labels.phase}
            copyLabel={labels.copy}
            designLabel={labels.design}
            titleErrorMessage={validationText.titleRequired}
            itemTypeErrorMessage={validationText.categoryRequired}
            onChange={(field, nextValue) => setNewApproval(current => ({ ...current, [field]: nextValue }))}
            onCancel={closeApprovalComposer}
            onSubmit={createApproval}
          />
        )}

        <div className="space-y-4">
          {approvals.length === 0 ? (
            <EmptyCollectionState message={labels.noApprovalsYet} />
          ) : (
            approvals.map(approval => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                statusClassName={getApprovalClasses(approval.status)}
                statusLabel={getApprovalStatusLabel(approval.status, language)}
                typeLabel={getApprovalTypeLabel(approval.itemType, language)}
                createdByLabel={labels.createdBy}
                requestedAtLabel={formatDateTimeLabel(approval.requestedAt, language)}
                approvalNoteLabel={labels.approvalNote}
                approveLabel={labels.approve}
                requestChangesLabel={labels.requestChanges}
                decidedByLabel={labels.decidedBy}
                decisionNoteValue={approvalDecisionNotes[approval.id] ?? approval.decisionNote ?? ''}
                onDecisionNoteChange={nextValue => setApprovalDecisionNotes(current => ({ ...current, [approval.id]: nextValue }))}
                onApprove={() => { void respondToApproval(approval, 'approved'); }}
                onRequestChanges={() => { void respondToApproval(approval, 'changes-requested'); }}
                editAction={canManage ? <InlineEditButton label={t.edit} onClick={() => openApprovalComposer(approval)} /> : undefined}
                decisionMetaLabel={(approval.decidedAt || approval.decidedByName)
                  ? `${approval.decidedByName || '-'} · ${formatDateTimeLabel(approval.decidedAt, language)}`
                  : undefined}
                comments={projectId ? (
                  <CommentsThread
                    projectId={projectId}
                    contextType="approval"
                    contextId={approval.id}
                    comments={comments}
                    activityTargetLabel={`approval "${approval.title}"`}
                  />
                ) : undefined}
              />
            ))
          )}
        </div>
      </div>
    </SectionBlock>
  );

  const renderDeliverablesSection = () => (
    <SectionBlock
      icon={PackageOpen}
      title={labels.deliverables}
      description={labels.filesTransparentNote}
      collapsible
      expanded={expandedClientPanels.deliverables}
      onToggle={() => toggleClientPanel('deliverables')}
      attentionCount={deliverablesAttentionCount}
      toggleLabel={expandedClientPanels.deliverables ? labels.collapseSection : labels.expandSection}
      action={canManage ? (
        <SectionActionButton
          label={labels.addDeliverable}
          onClick={() => {
            openClientPanel('deliverables');
            openDeliverableComposer();
          }}
        />
      ) : undefined}
    >
      <div className="space-y-6">
        {canManage && activeComposer === 'deliverable' && (
          <DeliverableForm
            value={newDeliverable}
            titleLabel={labels.addDeliverable}
            titlePlaceholder={labels.deliverablePlaceholder}
            categoryLabel={labels.category}
            versionLabel={labels.version}
            resourceLinkLabel={labels.resourceLink}
            notesLabel={labels.notes}
            cancelLabel={t.cancel}
            submitLabel={editingDeliverableId ? t.save : labels.addDeliverable}
            titleErrorMessage={validationText.titleRequired}
            urlRequiredErrorMessage={validationText.urlRequired}
            urlInvalidErrorMessage={validationText.urlInvalid}
            onChange={(field, nextValue) => setNewDeliverable(current => ({ ...current, [field]: nextValue }))}
            onCancel={closeDeliverableComposer}
            onSubmit={createDeliverable}
          />
        )}

        <div className="space-y-4">
          {deliverables.length === 0 ? (
            <EmptyCollectionState message={labels.noDeliverablesYet} />
          ) : (
            deliverables.map(deliverable => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                statusClassName={getDeliverableClasses(deliverable.status)}
                statusLabel={getDeliverableStatusLabel(deliverable.status, language)}
                resourceLinkLabel={labels.resourceLink}
                markSharedLabel={labels.markShared}
                markApprovedLabel={labels.markApproved}
                canManage={canManage}
                onMarkShared={() => { void updateDeliverableStatus(deliverable, 'shared'); }}
                onMarkApproved={() => { void updateDeliverableStatus(deliverable, 'approved'); }}
                editAction={canManage ? <InlineEditButton label={t.edit} onClick={() => openDeliverableComposer(deliverable)} /> : undefined}
                comments={projectId ? (
                  <CommentsThread
                    projectId={projectId}
                    contextType="deliverable"
                    contextId={deliverable.id}
                    comments={comments}
                    activityTargetLabel={`deliverable "${deliverable.title}"`}
                  />
                ) : undefined}
              />
            ))
          )}
        </div>
      </div>
    </SectionBlock>
  );

  const renderClientActionsSection = () => (
    <SectionBlock
      icon={Handshake}
      title={labels.clientItems}
      description={labels.pendingClientActions}
      collapsible
      expanded={expandedClientPanels['client-actions']}
      onToggle={() => toggleClientPanel('client-actions')}
      attentionCount={clientActionsAttentionCount}
      toggleLabel={expandedClientPanels['client-actions'] ? labels.collapseSection : labels.expandSection}
      action={canManage ? (
        <SectionActionButton
          label={labels.addClientItem}
          onClick={() => {
            openClientPanel('client-actions');
            openClientActionComposer();
          }}
        />
      ) : undefined}
    >
      <div className="space-y-6">
        {canManage && activeComposer === 'client-action' && (
          <ClientActionForm
            value={newClientAction}
            titleLabel={labels.addClientItem}
            titlePlaceholder={labels.clientItemPlaceholder}
            dueDateLabel={labels.dueDate}
            descriptionLabel={t.description}
            cancelLabel={t.cancel}
            submitLabel={editingClientActionId ? t.save : labels.addClientItem}
            titleErrorMessage={validationText.titleRequired}
            dueDateErrorMessage={validationText.dueDateRequired}
            onChange={(field, nextValue) => setNewClientAction(current => ({ ...current, [field]: nextValue }))}
            onCancel={closeClientActionComposer}
            onSubmit={createClientAction}
          />
        )}

        <div className="space-y-4">
          {clientActions.length === 0 ? (
            <EmptyCollectionState message={labels.noClientItemsYet} />
          ) : (
            clientActions.map(item => (
              <ClientActionCard
                key={item.id}
                item={item}
                statusClassName={getClientActionClasses(item.status)}
                statusLabel={getClientActionStatusLabel(item.status, language)}
                dueDateLabel={labels.dueDate}
                dueDateValue={formatDateLabel(item.dueDate, language)}
                markSubmittedLabel={labels.markSubmitted}
                markDoneLabel={labels.markDone}
                onMarkSubmitted={() => { void updateClientActionStatus(item, 'submitted'); }}
                onMarkDone={() => { void updateClientActionStatus(item, 'done'); }}
                editAction={canManage ? <InlineEditButton label={t.edit} onClick={() => openClientActionComposer(item)} /> : undefined}
              />
            ))
          )}
        </div>
      </div>
    </SectionBlock>
  );

  const renderRisksSection = () => (
    <SectionBlock
      icon={TriangleAlert}
      title={labels.risks}
      description={labels.blockerNote}
      action={canManage ? (
        <SectionActionButton
          label={labels.addRisk}
          onClick={() => openRiskComposer()}
        />
      ) : undefined}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {risks.length === 0 ? (
            <EmptyCollectionState message={labels.noRisksYet} />
          ) : (
            risks.map(risk => (
              <RiskCard
                key={risk.id}
                risk={risk}
                impactClassName={getRiskClasses(risk.impact)}
                impactLabel={getImpactLabel(risk.impact, language)}
                statusLabel={getRiskStatusLabel(risk.status, language)}
                ownerLabel={labels.owner}
                mitigateLabel={labels.mitigate}
                closeRiskLabel={labels.closeRisk}
                canManage={canManage}
                onMitigate={() => { void updateRiskStatus(risk, 'mitigated'); }}
                onClose={() => { void updateRiskStatus(risk, 'closed'); }}
                editAction={canManage ? <InlineEditButton label={t.edit} onClick={() => openRiskComposer(risk)} /> : undefined}
              />
            ))
          )}
        </div>
      </div>
    </SectionBlock>
  );

  const renderKanban = (boardTasks: Task[] = tasks) => {
    const columns: Task['status'][] = ['todo', 'in-progress', 'approval', 'done'];
    const columnLabels = { todo: t.todo, 'in-progress': t.inProgress, approval: t.approval, done: t.completed };
    const columnMeta: Record<Task['status'], {
      file: string;
      statement: string;
      comment: string;
      dot: string;
      badge: string;
      statusChip: string;
    }> = {
      todo: {
        file: language === 'es' ? 'Cola de trabajo' : 'Work queue',
        statement: language === 'es' ? 'Pendientes' : 'Pending',
        comment: language === 'es' ? 'Tareas listas para iniciar' : 'Tasks ready to start',
        dot: 'bg-slate-400',
        badge: 'text-slate-700',
        statusChip: 'border-slate-200 bg-slate-100 text-slate-700',
      },
      'in-progress': {
        file: language === 'es' ? 'Trabajo activo' : 'Active work',
        statement: language === 'es' ? 'En ejecucion' : 'In execution',
        comment: language === 'es' ? 'Trabajo en curso' : 'Work currently in progress',
        dot: 'bg-amber-400',
        badge: 'text-amber-700',
        statusChip: 'border-amber-200 bg-amber-50 text-amber-700',
      },
      approval: {
        file: language === 'es' ? 'Revision' : 'Review',
        statement: language === 'es' ? 'En revision' : 'In review',
        comment: language === 'es' ? 'Esperando aprobacion del cliente' : 'Waiting for client approval',
        dot: 'bg-sky-400',
        badge: 'text-sky-700',
        statusChip: 'border-sky-200 bg-sky-50 text-sky-700',
      },
      done: {
        file: language === 'es' ? 'Completado' : 'Completed',
        statement: language === 'es' ? 'Cerradas' : 'Closed',
        comment: language === 'es' ? 'Entregables validados y cerrados' : 'Validated and fully completed',
        dot: 'bg-emerald-400',
        badge: 'text-emerald-700',
        statusChip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      },
    };

    return (
      <div className="kanban-board-grid">
        {columns.map(status => {
          const meta = columnMeta[status];
          const columnTasks = boardTasks.filter(task => task.status === status);

          return (
            <KanbanColumn
              key={status}
              meta={meta}
              taskCount={columnTasks.length}
              canAdd={canManage && status === 'todo'}
              onAdd={() => openTaskComposer()}
              addLabel={t.createTask}
            >
                {columnTasks.map(task => {
                  const isChecklistExpanded = expandedTaskId === task.id;
                  const canMoveBack = canManage && status !== 'todo';
                  const canMoveForward = ((canManage && status !== 'done' && status !== 'approval') || (status === 'approval' && canApproveTask));
                  const moveForwardLabel = status === 'approval'
                    ? t.approveTask
                    : status === 'in-progress' && task.requiresApproval
                      ? t.markForApproval
                      : t.moveForward;

                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projectId={projectId}
                      isChecklistExpanded={isChecklistExpanded}
                      canManage={canManage}
                      canMoveBack={canMoveBack}
                      canMoveForward={canMoveForward}
                      taskLabel={t.taskLabel}
                      approvalBadgeLabel={labels.requiresApprovalBadge}
                      setHighPriorityLabel={labels.setHighPriority}
                      setRegularPriorityLabel={labels.setRegularPriority}
                      checklistProgressLabel={labels.checklistProgress}
                      checklistExpandLabel={language === 'es' ? 'Ver checklist' : 'View checklist'}
                      checklistCollapseLabel={language === 'es' ? 'Ocultar checklist' : 'Hide checklist'}
                      editLabel={t.edit}
                      deleteLabel={t.delete}
                      moveBackLabel={t.moveBack}
                      moveForwardLabel={moveForwardLabel}
                      onToggleChecklist={() => setExpandedTaskId(current => current === task.id ? null : task.id)}
                      onEdit={() => openTaskComposer(task)}
                      onDelete={() => { void deleteTask(task.id); }}
                      onTogglePriority={() => { void toggleTaskPriority(task); }}
                      onMoveBack={() => {
                        const previousStatus: Task['status'] = status === 'done'
                          ? (task.requiresApproval ? 'approval' : 'in-progress')
                          : status === 'approval'
                            ? 'in-progress'
                            : 'todo';
                        void updateTaskStatus(task.id, previousStatus);
                      }}
                      onMoveForward={() => {
                        if (status === 'approval') {
                          void approveTask(task);
                          return;
                        }
                        const nextStatus: Task['status'] = status === 'todo'
                          ? 'in-progress'
                          : (task.requiresApproval ? 'approval' : 'done');
                        void updateTaskStatus(task.id, nextStatus);
                      }}
                      checklistContent={projectId ? (
                        <TaskChecklist
                          projectId={projectId}
                          taskId={task.id}
                          canEdit={canManage}
                          checklistLabel={t.checklist}
                          addItemLabel={t.addItem}
                          editItemLabel={t.edit}
                          deleteItemLabel={t.deleteItem}
                          onActivity={message => trackActivity('checklist', `${message} in task "${task.title}"`)}
                        />
                      ) : undefined}
                    />
                  );
                })}
            </KanbanColumn>
          );
        })}
      </div>
    );
  };

  const renderReports = () => {
    const colors = ['#748bb5', '#d8a34f', '#2b6f8f', '#4b9b8a'];

    return (
      <div className="space-y-8">
        <dl className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
          <div className="ui-panel-card rounded-2xl p-6">
            <dt className="ui-text-subtle mb-1 text-sm font-medium">{t.overallProgress}</dt>
            <dd className="flex items-end gap-2">
              <span className="ui-text-main text-4xl font-bold">{overallProgress}%</span>
              <span className="ui-kicker mb-1 text-sm">{t.complete}</span>
            </dd>
          </div>
          <div className="ui-panel-card rounded-2xl p-6">
            <dt className="ui-text-subtle mb-1 text-sm font-medium">{t.totalTasks}</dt>
            <dd className="flex items-end gap-2">
              <span className="ui-text-main text-4xl font-bold">{totalTasks}</span>
              <span className="ui-kicker mb-1 text-sm">{t.items}</span>
            </dd>
          </div>
          <div className="ui-panel-card rounded-2xl p-6">
            <dt className="ui-text-subtle mb-1 text-sm font-medium">{t.completed}</dt>
            <dd className="flex items-end gap-2 text-[#2f7d71]">
              <span className="text-4xl font-bold">{completedTasks}</span>
              <span className="mb-1 text-sm text-[#62a597]">{t.done}</span>
            </dd>
          </div>
          <div className="ui-panel-card rounded-2xl p-6">
            <dt className="ui-text-subtle mb-1 text-sm font-medium">{labels.pendingApprovals}</dt>
            <dd className="flex items-end gap-2">
              <span className="ui-text-main text-4xl font-bold">{pendingApprovals.length}</span>
            </dd>
          </div>
          <div className="ui-panel-card rounded-2xl p-6">
            <dt className="ui-text-subtle mb-1 text-sm font-medium">{labels.openRisks}</dt>
            <dd className="flex items-end gap-2">
              <span className="ui-text-main text-4xl font-bold">{openRisks.length}</span>
            </dd>
          </div>
        </dl>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="ui-panel-card rounded-2xl p-8">
            <h3 className="ui-text-main mb-6 text-lg font-bold">{t.taskDistribution}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
                  <span className="ui-text-subtle text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ui-panel-card rounded-2xl p-8">
            <h3 className="ui-text-main mb-6 text-lg font-bold">{labels.progressTrend}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dce6ef" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#7f93a6', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{ fill: '#7f93a6', fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="progress" stroke="#17324d" strokeWidth={3} dot={{ r: 4, fill: '#17324d' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="ui-panel-card rounded-2xl p-6">
            <p className="ui-text-subtle mb-1 text-sm font-medium">{labels.projectHealth}</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold mt-3 ${getHealthClasses(project?.health ?? 'green')}`}>
              {getHealthLabel(project?.health ?? 'green', language)}
            </span>
          </div>
          <div className="ui-panel-card rounded-2xl p-6">
            <p className="ui-text-subtle mb-1 text-sm font-medium">{labels.hoursConsumed}</p>
            <p className="ui-text-main text-3xl font-bold">{hoursConsumed}%</p>
          </div>
          <div className="ui-panel-card rounded-2xl p-6">
            <p className="ui-text-subtle mb-1 text-sm font-medium">{labels.budgetConsumed}</p>
            <p className="ui-text-main text-3xl font-bold">{budgetConsumed}%</p>
          </div>
        </div>
      </div>
    );
  };

  const renderActivityTab = () => (
    <SectionBlock icon={History} title={labels.activityLog} description={labels.transparencyCenter}>
      <div className="space-y-4">
        {activity.length === 0 ? (
          <EmptyCollectionState message={labels.noActivityYet} />
        ) : (
          activity.map(entry => (
            <ActivityEntryCard
              key={entry.id}
              entry={entry}
              createdAtLabel={formatDateTimeLabel(entry.createdAt, language)}
            />
          ))
        )}
      </div>
    </SectionBlock>
  );

  const renderOverviewPage = () => (
    <div className="space-y-8">
      {renderExecutive()}
    </div>
  );

  const renderPlanningPage = () => (
    <div className="space-y-8">
      {renderTimeline()}
    </div>
  );

  const renderExecutionPage = () => (
    <div className="space-y-3">
      {(tasksAwaitingApproval > 0 || pendingApprovals.length > 0 || atRiskMilestones.length > 0 || pendingClientItems.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {tasksAwaitingApproval > 0 && (
            <button
              type="button"
              onClick={() => {
                setExecutionStatusFilter('approval');
                setExecutionSearch('');
                setExecutionApprovalFilter('all');
              }}
              className="ui-focus-ring ui-interactive-button inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700"
            >
              <span className="font-semibold text-slate-900">{tasksAwaitingApproval}</span>
              {t.awaitingApproval}
            </button>
          )}
          {pendingApprovals.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveProjectSection('client')}
              className="ui-focus-ring ui-interactive-button inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              <span className="font-semibold text-slate-900">{pendingApprovals.length}</span>
              {t.reviewApprovals}
            </button>
          )}
          {atRiskMilestones.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveProjectSection('planning')}
              className="ui-focus-ring ui-interactive-button inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800"
            >
              <span className="font-semibold text-slate-900">{atRiskMilestones.length}</span>
              {t.reviewMilestones}
            </button>
          )}
          {pendingClientItems.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveProjectSection('client')}
              className="ui-focus-ring ui-interactive-button inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
            >
              <span className="font-semibold text-slate-900">{pendingClientItems.length}</span>
              {t.reviewClientItems}
            </button>
          )}
        </div>
      )}

      {renderKanban(filteredExecutionTasks)}
    </div>
  );

  const renderClientPage = () => (
    <div className="space-y-8">
      {renderUpdatesSection()}
      {renderApprovalsSection()}
      {renderDeliverablesSection()}
      {renderClientActionsSection()}
    </div>
  );

  const renderHistoryPage = () => (
    <div className="space-y-8">
      {renderActivityTab()}
    </div>
  );

  if (!project) return <div className="p-8">{t.loading}</div>;

  const setActiveProjectSection = (section: ProjectSectionId) => {
    const next = new URLSearchParams(searchParams);
    next.set('section', section);
    setSearchParams(next);
  };

  const projectSectionItems = getProjectSectionItems(language);
  const activeSectionItem = projectSectionItems.find(item => item.id === activeSection);
  const sectionStats: Record<ProjectSectionId, Array<{ value: string; label: string; accent: string }>> = {
    overview: [
      { value: `${overallProgress}%`, label: t.overallProgress, accent: 'bg-slate-700 text-slate-900' },
      { value: `${pendingApprovals.length}`, label: labels.pendingApprovals, accent: 'bg-sky-500 text-sky-700' },
      { value: `${openRisks.length}`, label: labels.openRisks, accent: 'bg-red-500 text-red-700' },
      { value: `${assignedClientUids.length}`, label: labels.clientsShort, accent: 'bg-emerald-500 text-emerald-700' },
    ],
    planning: [
      { value: `${milestones.length}`, label: labels.milestonesShort, accent: 'bg-slate-700 text-slate-900' },
      { value: `${milestones.filter(item => item.status === 'at-risk').length}`, label: labels.atRisk, accent: 'bg-amber-500 text-amber-700' },
    ],
    execution: [],
    client: [
      { value: `${updates.length}`, label: labels.projectUpdates, accent: 'bg-slate-700 text-slate-900' },
      { value: `${pendingApprovals.length}`, label: labels.pendingApprovals, accent: 'bg-sky-500 text-sky-700' },
      { value: `${deliverables.length}`, label: labels.deliverablesShort, accent: 'bg-emerald-500 text-emerald-700' },
    ],
    history: [
      { value: `${activity.length}`, label: labels.eventsShort, accent: 'bg-slate-700 text-slate-900' },
      { value: `${comments.length}`, label: labels.comments, accent: 'bg-indigo-500 text-indigo-700' },
    ],
  };
  const executionHeaderAction = activeSection === 'execution' ? (
    <div className="flex w-full flex-col gap-2 xl:w-auto xl:max-w-[980px] xl:flex-row xl:flex-nowrap xl:items-center xl:justify-end">
      <Input
        type="search"
        value={executionSearch}
        onChange={event => setExecutionSearch(event.target.value)}
        placeholder={t.searchTasksPlaceholder}
        className="h-8 rounded-xl border-slate-200 bg-white px-3 text-[13px] text-slate-900 placeholder:text-slate-400 xl:w-[220px] 2xl:w-[250px]"
      />
      <Select
        value={executionStatusFilter}
        onValueChange={value => setExecutionStatusFilter(value as 'all' | Task['status'])}
      >
        <SelectTrigger className="h-8 w-full rounded-xl border-slate-200 bg-white px-3 text-[13px] text-slate-900 xl:w-[164px]">
          <SelectValue placeholder={t.allStatuses} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">{t.allStatuses}</SelectItem>
            <SelectItem value="todo">{t.todo}</SelectItem>
            <SelectItem value="in-progress">{t.inProgress}</SelectItem>
            <SelectItem value="approval">{t.approval}</SelectItem>
            <SelectItem value="done">{t.completed}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant={executionApprovalFilter === 'requires-approval' ? 'secondary' : 'outline'}
        onClick={() => setExecutionApprovalFilter(current => current === 'requires-approval' ? 'all' : 'requires-approval')}
        className="h-8 rounded-xl border-slate-200 px-3 text-[13px] text-slate-700 xl:flex-none"
      >
        {t.approvalOnly}
      </Button>
      {hasExecutionFilters && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setExecutionSearch('');
            setExecutionStatusFilter('all');
            setExecutionApprovalFilter('all');
          }}
          className="h-8 rounded-xl px-2.5 text-[13px] text-slate-600"
        >
          {t.clearFilters}
        </Button>
      )}
      {canManage && (
        <Button
          type="button"
          onClick={() => openTaskComposer()}
          className="h-8 rounded-xl bg-slate-900 px-3 text-[13px] text-white hover:bg-slate-800 xl:flex-none"
        >
          <Plus data-icon="inline-start" size={15} />
          {t.createTask}
        </Button>
      )}
    </div>
  ) : undefined;

  return (
    <div className="w-full px-5 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 max-w-[1800px] mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 mb-7">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <button type="button" onClick={() => navigate('/')} className="ui-focus-ring rounded-lg transition-colors hover:text-gray-900">
              {t.reportProjects}
            </button>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium truncate">{project.name}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-gray-500 mt-3 max-w-3xl">{project.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-4 xl:items-end xl:min-w-[320px]">
          {canManage && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAccessModal(true)}
                className="h-8 gap-1.5 rounded-xl px-3 text-[13px]"
              >
                <Users size={15} />
                {t.manageAccess}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 min-w-0">
        <ProjectSectionHeader
          icon={activeSectionItem?.icon}
          label={activeSectionItem?.label}
          stats={sectionStats[activeSection]}
          action={executionHeaderAction}
        />

        {activeSection === 'overview' && renderOverviewPage()}
        {activeSection === 'planning' && renderPlanningPage()}
        {activeSection === 'execution' && renderExecutionPage()}
        {activeSection === 'client' && renderClientPage()}
        {activeSection === 'history' && renderHistoryPage()}
      </div>

      <AnimatePresence>
        {canManage && (
          <Dialog open={showAccessModal} onOpenChange={setShowAccessModal}>
            <DialogContent className="max-w-lg overflow-hidden rounded-[28px] p-0">
              <DialogHeader className="px-8 pt-8">
                <DialogTitle className="text-2xl font-bold">{t.manageAccess}</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  {t.readOnlyAccess}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={saveProjectAccess} className="space-y-6 px-8 pb-8">
                <ClientAccessPicker
                  clients={clients}
                  selectedUids={selectedMemberUids}
                  onToggle={toggleSelectedMember}
                  title={t.selectedClients}
                  helperText={t.chooseClients}
                  emptyText={t.noClientsAvailable}
                />
                <DialogFooter className="mx-0 mb-0 rounded-b-none border-t-0 bg-transparent p-0 pt-2 sm:grid sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedMemberUids(getAssignedClientUids(project));
                      setShowAccessModal(false);
                    }}
                  >
                    {t.cancel}
                  </Button>
                  <Button type="submit" className="w-full rounded-xl">
                    {t.saveAccess}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {canManage && (
          <Dialog
            open={showTaskModal}
            onOpenChange={open => {
              if (!open) {
                closeTaskComposer();
              }
            }}
          >
            <DialogContent className="max-h-[90vh] w-[min(58rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] sm:max-w-[min(58rem,calc(100vw-2rem))] overflow-y-auto rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
                <DialogHeader className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-slate-900">
                        {editingTaskId ? t.edit : t.addNewTask}
                      </DialogTitle>
                      <DialogDescription className="mt-2 text-sm text-slate-500">
                        {t.taskSetupHelper}
                      </DialogDescription>
                    </div>
                    {editingTask && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${getTaskStatusClasses(editingTask.status)}`}>
                          {({
                            todo: t.todo,
                            'in-progress': t.inProgress,
                            approval: t.approval,
                            done: t.completed,
                          })[editingTask.status]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                            editingTask.requiresApproval
                              ? 'border-sky-200 bg-sky-50 text-sky-800'
                              : 'border-slate-200 bg-slate-100 text-slate-700'
                          }`}
                        >
                          {editingTask.requiresApproval ? labels.requiresApprovalBadge : labels.noApprovalBadge}
                        </Badge>
                      </div>
                    )}
                  </div>
                </DialogHeader>
                <form onSubmit={handleAddTask} className="grid grid-cols-1 gap-6 pt-6 min-[1180px]:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">{t.taskTitle}</label>
                      <Input
                        required
                        type="text"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        className="h-12 rounded-xl border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus-visible:ring-sky-200"
                        placeholder={t.designHomepage}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">{t.description}</label>
                      <Textarea
                        value={newTask.description}
                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        className="min-h-36 resize-none rounded-xl border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/30 focus-visible:ring-0"
                        placeholder={t.whatNeedsToBeDone}
                      />
                    </div>
                    {editingTask && projectId && (
                      <>
                        <Separator className="bg-slate-200/80" />
                        <CommentsThread
                          projectId={projectId}
                          contextType="task"
                          contextId={editingTask.id}
                          comments={comments}
                          activityTargetLabel={`task "${editingTask.title}"`}
                        />
                      </>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">{t.status}</label>
                          <Select
                            value={newTask.status}
                            onValueChange={nextValue => setNewTask(current => ({ ...current, status: nextValue as Task['status'] }))}
                          >
                            <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 bg-white px-4 text-slate-900 focus-visible:border-sky-400/30 focus-visible:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="todo">{t.todo}</SelectItem>
                                <SelectItem value="in-progress">{t.inProgress}</SelectItem>
                                <SelectItem value="approval" disabled={!newTask.requiresApproval}>{t.approval}</SelectItem>
                                <SelectItem value="done">{t.completed}</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={Boolean(newTask.requiresApproval)}
                              onChange={e => setNewTask(current => ({
                                ...current,
                                requiresApproval: e.target.checked,
                                status: !e.target.checked && current.status === 'approval' ? 'in-progress' : current.status,
                              }))}
                              className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-sky-500 focus:ring-sky-400"
                            />
                            <span>
                              <span className="block text-sm font-semibold text-slate-900">{t.requiresApproval}</span>
                              <span className="mt-1 block text-xs text-slate-500">{t.markForApproval}</span>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    {editingTask && (
                      <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          {t.taskSummary}
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                          <p><span className="font-medium text-slate-500">{labels.commentsCount}:</span> {comments.filter(comment => comment.contextType === 'task' && comment.contextId === editingTask.id).length}</p>
                          <p><span className="font-medium text-slate-500">{labels.checklistProgress}:</span> {t.checklistShownOnCard}</p>
                          {editingTask.status === 'approval' && (
                            <p><span className="font-medium text-slate-500">{labels.requestedForApproval}:</span> {formatDateTimeLabel(editingTask.approvalRequestedAt, language)}</p>
                          )}
                          {editingTask.status === 'done' && editingTask.approvedByName && (
                            <p><span className="font-medium text-slate-500">{t.approvedByClient}:</span> {editingTask.approvedByName} · {formatDateTimeLabel(editingTask.approvedAt, language)}</p>
                          )}
                        </div>
                        <Separator className="my-4 bg-slate-200/80" />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => { if (editingTask) void toggleTaskApprovalRequirement(editingTask); }}
                            className={`rounded-full px-3 py-2 text-[11px] font-semibold ${
                              editingTask.requiresApproval
                                ? 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                                : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {editingTask.requiresApproval ? t.skipApproval : t.markForApproval}
                          </Button>
                          {editingTask.status === 'approval' && canApproveTask && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => { void approveTask(editingTask); closeTaskComposer(); }}
                              className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              {t.approveTask}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeTaskComposer}
                        className="h-12 flex-1 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        type="submit"
                        variant="outline"
                        className="h-12 flex-1 rounded-xl border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                      >
                        {editingTaskId ? t.save : t.createTask}
                      </Button>
                    </div>
                  </div>
                </form>
            </DialogContent>
          </Dialog>
        )}
        {canManage && (
          <Dialog
            open={showRiskModal}
            onOpenChange={open => {
              if (!open) {
                closeRiskComposer();
              }
            }}
          >
            <DialogContent className="max-w-2xl rounded-[28px] p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {editingRiskId ? t.edit : labels.addRisk}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  {labels.blockerNote}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createRisk} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t.taskTitle}</label>
                  <Input
                    required
                    type="text"
                    value={newRisk.title}
                    onChange={e => setNewRisk(current => ({ ...current, title: e.target.value }))}
                    className="ui-form-field h-12 rounded-xl px-4"
                    placeholder={labels.riskPlaceholder}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="ui-text-main mb-2 block text-sm font-medium">{labels.owner}</label>
                    <Input
                      type="text"
                      value={newRisk.owner}
                      onChange={e => setNewRisk(current => ({ ...current, owner: e.target.value }))}
                      className="ui-form-field h-12 rounded-xl px-4"
                    />
                  </div>
                  <div>
                    <label className="ui-text-main mb-2 block text-sm font-medium">{labels.category}</label>
                    <Select
                      value={newRisk.impact}
                      onValueChange={nextValue => setNewRisk(current => ({ ...current, impact: nextValue as RiskImpact }))}
                    >
                      <SelectTrigger className="ui-form-field h-12 w-full rounded-xl px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="low">{t.low}</SelectItem>
                          <SelectItem value="medium">{t.medium}</SelectItem>
                          <SelectItem value="high">{t.high}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="ui-text-main mb-2 block text-sm font-medium">{t.description}</label>
                  <Textarea
                    value={newRisk.description}
                    onChange={e => setNewRisk(current => ({ ...current, description: e.target.value }))}
                    className="ui-form-field min-h-28 resize-none rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="ui-text-main mb-2 block text-sm font-medium">{labels.mitigate}</label>
                  <Textarea
                    value={newRisk.mitigation}
                    onChange={e => setNewRisk(current => ({ ...current, mitigation: e.target.value }))}
                    className="ui-form-field min-h-24 resize-none rounded-xl px-4 py-3"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeRiskComposer}
                    className="h-12 flex-1 rounded-xl"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 flex-1 rounded-xl"
                  >
                    {editingRiskId ? t.save : labels.addRisk}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

const Login = () => {
  const { user, loading, authError, login, loginWithPassword, sendMagicLink, completeMagicLink } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const isEmailLinkFlow = typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href);
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic'>('password');
  const [passwordMode, setPasswordMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isCompletingMagicLink, setIsCompletingMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !isEmailLinkFlow) {
      return;
    }

    const storedEmail = window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY) || '';
    setLoginMethod('magic');
    setMagicLinkEmail(storedEmail);

    if (!storedEmail) {
      return;
    }

    const run = async () => {
      setIsCompletingMagicLink(true);
      try {
        await completeMagicLink(storedEmail, window.location.href);
      } finally {
        setIsCompletingMagicLink(false);
      }
    };

    void run();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t.loading}</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithPassword(email, password, passwordMode);
    } catch {}
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMagicLink(magicEmail);
      setMagicLinkSent(true);
      setMagicLinkEmail(normalizeEmail(magicEmail));
    } catch {}
  };

  const handleCompleteMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompletingMagicLink(true);
    try {
      await completeMagicLink(magicLinkEmail, window.location.href);
    } catch {
    } finally {
      setIsCompletingMagicLink(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f5f8fb_0%,#edf3f8_100%)] p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#17324d] shadow-xl shadow-[#17324d]/15">
            <FolderOpen className="text-white w-8 h-8" />
          </div>
          <h1 className="ui-text-main mb-2 text-4xl font-bold">PM Hub</h1>
          <p className="ui-text-subtle">{t.pmHubTagline}</p>
        </div>

        <Card className="ui-panel-card rounded-[28px] py-0 shadow-xl">
          <CardHeader className="px-8 pt-8 text-center">
            <CardTitle className="ui-text-main text-xl font-bold">{t.welcomeBack}</CardTitle>
            <CardDescription className="ui-text-subtle text-sm">{t.invitedLoginNote}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
          {authError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => { void login(); }}
            className="ui-action-secondary h-14 w-full justify-center gap-3 rounded-2xl px-6 font-semibold shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            {t.continueWithGoogle}
          </Button>
          <div className="ui-kicker flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
            <Separator className="flex-1 bg-slate-200/75" />
            <span>{t.continueWithEmail}</span>
            <Separator className="flex-1 bg-slate-200/75" />
          </div>

          <div className="flex rounded-xl bg-slate-100/90 p-1">
            <Button
              type="button"
              onClick={() => setLoginMethod('password')}
              variant="ghost"
              className={`h-10 flex-1 rounded-lg text-sm font-semibold shadow-none ${
                loginMethod === 'password' ? 'bg-white text-[#17324d] hover:bg-white' : 'ui-text-subtle hover:bg-transparent hover:text-[#17324d]'
              }`}
            >
              {t.emailPassword}
            </Button>
            <Button
              type="button"
              onClick={() => setLoginMethod('magic')}
              variant="ghost"
              className={`h-10 flex-1 rounded-lg text-sm font-semibold shadow-none ${
                loginMethod === 'magic' ? 'bg-white text-[#17324d] hover:bg-white' : 'ui-text-subtle hover:bg-transparent hover:text-[#17324d]'
              }`}
            >
              {t.magicLink}
            </Button>
          </div>

          {loginMethod === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="ui-text-main mb-1 block text-sm font-medium">{t.accessEmail}</label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="ui-form-field h-12 rounded-xl px-4"
                />
              </div>
              <div>
                <label className="ui-text-main mb-1 block text-sm font-medium">{t.password}</label>
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="ui-form-field h-12 rounded-xl px-4"
                />
              </div>
              <Button
                type="submit"
                className="h-14 w-full rounded-2xl font-semibold"
              >
                {passwordMode === 'signin' ? t.signIn : t.createAccount}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPasswordMode(current => current === 'signin' ? 'signup' : 'signin')}
                className="ui-text-subtle h-auto w-full justify-center px-0 py-1 text-sm hover:bg-transparent hover:text-[#17324d]"
              >
                {passwordMode === 'signin'
                  ? `${t.noPasswordYet} ${t.createWithPassword}`
                  : `${t.alreadyHaveAccount} ${t.signInInstead}`}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {!isEmailLinkFlow && (
                <form onSubmit={handleSendMagicLink} className="space-y-4">
                  <div>
                    <label className="ui-text-main mb-1 block text-sm font-medium">{t.accessEmail}</label>
                    <Input
                      required
                      type="email"
                      value={magicEmail}
                      onChange={e => setMagicEmail(e.target.value)}
                      className="ui-form-field h-12 rounded-xl px-4"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-2xl font-semibold"
                  >
                    {t.sendAccessLink}
                  </Button>
                </form>
              )}

              {magicLinkSent && !isEmailLinkFlow && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {t.linkSent}
                </div>
              )}

              {isEmailLinkFlow && (
                <form onSubmit={handleCompleteMagicLink} className="space-y-4">
                  <p className="text-sm text-gray-500">{t.enterEmailToFinish}</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.accessEmail}</label>
                    <Input
                      required
                      type="email"
                      value={magicLinkEmail}
                      onChange={e => setMagicLinkEmail(e.target.value)}
                      className="h-12 rounded-xl border-gray-200 px-4"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isCompletingMagicLink}
                    className="h-14 w-full rounded-2xl font-semibold disabled:opacity-60"
                  >
                    {isCompletingMagicLink ? t.loading : t.finishMagicLink}
                  </Button>
                </form>
              )}
            </div>
          )}
          <p className="mt-6 text-center text-xs text-gray-400">
            {t.termsNotice}
          </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const skipToMainContentLabel = language === 'es' ? 'Saltar al contenido principal' : 'Skip to main content';
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">{t.loading}</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-slate-100/80">
      <a href="#main-content" className="skip-link">
        {skipToMainContentLabel}
      </a>
      <Sidebar />
      <main id="main-content" tabIndex={-1} className="app-main-shell min-w-0 flex-1 overflow-y-auto">
        <div className="app-main-cosmos-content">
          {children}
        </div>
      </main>
    </div>
  );
};

const ClientsList = () => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const inviteClientButtonRef = useRef<HTMLButtonElement>(null);
  const inviteModalRef = useRef<HTMLDivElement>(null);
  const inviteNameInputRef = useRef<HTMLInputElement>(null);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newInvitation, setNewInvitation] = useState({ displayName: '', email: '' });

  useAccessibleModal({
    isOpen: showInviteModal,
    onClose: () => setShowInviteModal(false),
    containerRef: inviteModalRef,
    initialFocusRef: inviteNameInputRef,
    triggerRef: inviteClientButtonRef,
  });

  useEffect(() => {
    const clientsQuery = query(collection(db, 'users'), where('role', '==', 'client'));
    const invitationsQuery = query(collection(db, 'clientInvitations'), orderBy('invitedAt', 'desc'));

    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      setClients(snapshot.docs.map(doc => doc.data() as UserProfile));
    });

    const unsubscribeInvitations = onSnapshot(invitationsQuery, snapshot => {
      setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientInvitation)));
    });

    return () => {
      unsubscribeClients();
      unsubscribeInvitations();
    };
  }, []);

  const pendingInvitations = invitations.filter(invitation =>
    !clients.some(client => normalizeEmail(client.email) === normalizeEmail(invitation.email)),
  );

  const handleInviteClient = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = normalizeEmail(newInvitation.email);
    if (!normalizedEmail) return;

    await setDoc(doc(db, 'clientInvitations', normalizedEmail), {
      email: normalizedEmail,
      displayName: newInvitation.displayName.trim(),
      invitedAt: new Date().toISOString(),
      invitedBy: profile?.uid ?? 'admin',
    });

    setShowInviteModal(false);
    setNewInvitation({ displayName: '', email: '' });
  };

  const revokeInvitation = async (email: string) => {
    if (!window.confirm(t.revokeInviteConfirm)) return;
    await deleteDoc(doc(db, 'clientInvitations', normalizeEmail(email)));
  };

  const revokeClient = async (client: UserProfile) => {
    if (!window.confirm(t.revokeClientConfirm)) return;

    const memberProjectsQuery = query(collection(db, 'projects'), where('memberUids', 'array-contains', client.uid));
    const legacyProjectsQuery = query(collection(db, 'projects'), where('clientUid', '==', client.uid));
    const [memberProjectsSnapshot, legacyProjectsSnapshot] = await Promise.all([
      getDocs(memberProjectsQuery),
      getDocs(legacyProjectsQuery),
    ]);

    const projectMap = new Map<string, Project>();
    [...memberProjectsSnapshot.docs, ...legacyProjectsSnapshot.docs].forEach(projectDoc => {
      projectMap.set(projectDoc.id, { id: projectDoc.id, ...projectDoc.data() } as Project);
    });

    await Promise.all(
      Array.from(projectMap.values()).map(project =>
        syncProjectMemberships(
          project.id,
          getAssignedClientUids(project).filter(uid => uid !== client.uid),
          getAssignedClientUids(project),
        ),
      ),
    );

    await Promise.all([
      deleteDoc(doc(db, 'users', client.uid)),
      deleteDoc(doc(db, 'clientInvitations', normalizeEmail(client.email))),
    ]);
  };

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="ui-text-main text-3xl font-bold">{t.clients}</h1>
          <p className="ui-text-subtle mt-1 text-sm">{t.invitationNote}</p>
        </div>
        <button
          ref={inviteClientButtonRef}
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="ui-focus-ring ui-interactive-button ui-action-primary flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-colors"
        >
          <Plus size={18} />
          {t.addClient}
        </button>
      </div>

      <div className="ui-panel-card mb-8 overflow-hidden rounded-3xl">
        <div className="border-b border-slate-200/80 px-6 py-5">
          <h2 className="ui-text-main text-lg font-bold">{t.activeClients}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left">
            <caption className="sr-only">{t.activeClients}</caption>
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/80">
                <th scope="col" className="ui-kicker px-6 py-4 text-xs font-bold uppercase tracking-wider">{t.name}</th>
                <th scope="col" className="ui-kicker px-6 py-4 text-xs font-bold uppercase tracking-wider">{t.email}</th>
                <th scope="col" className="ui-kicker px-6 py-4 text-xs font-bold uppercase tracking-wider">{t.joined}</th>
                <th scope="col" className="ui-kicker px-6 py-4 text-xs font-bold uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map(client => (
                <tr key={client.uid} className="ui-interactive-row">
                  <th scope="row" className="ui-text-main px-6 py-4 font-semibold">{client.displayName}</th>
                  <td className="ui-text-subtle px-6 py-4">{client.email}</td>
                  <td className="ui-kicker px-6 py-4 text-sm">{new Date(client.createdAt).toLocaleDateString(getLocale(language))}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => { void revokeClient(client); }}
                      className="ui-focus-ring rounded-lg text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                    >
                      {t.revoke}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ui-panel-card overflow-hidden rounded-3xl">
        <div className="border-b border-slate-200/80 px-6 py-5">
          <h2 className="ui-text-main text-lg font-bold">{t.invitedClients}</h2>
        </div>
        {pendingInvitations.length === 0 ? (
          <div className="ui-text-subtle px-6 py-8 text-sm">{t.noPendingInvites}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left">
              <caption className="sr-only">{t.invitedClients}</caption>
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/80">
                  <th scope="col" className="ui-kicker px-6 py-4 text-xs font-bold uppercase tracking-wider">{t.name}</th>
                  <th scope="col" className="ui-kicker px-6 py-4 text-xs font-bold uppercase tracking-wider">{t.email}</th>
                  <th scope="col" className="ui-kicker px-6 py-4 text-xs font-bold uppercase tracking-wider">{t.joined}</th>
                  <th scope="col" className="ui-kicker px-6 py-4 text-xs font-bold uppercase tracking-wider">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingInvitations.map(invitation => (
                  <tr key={invitation.id} className="ui-interactive-row">
                    <th scope="row" className="ui-text-main px-6 py-4 font-semibold">{invitation.displayName || '-'}</th>
                    <td className="ui-text-subtle px-6 py-4">{invitation.email}</td>
                    <td className="ui-kicker px-6 py-4 text-sm">{new Date(invitation.invitedAt).toLocaleDateString(getLocale(language))}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => { void revokeInvitation(invitation.email); }}
                        className="ui-focus-ring rounded-lg text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                      >
                        {t.revokeInvite}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showInviteModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowInviteModal(false);
            }}
          >
            <motion.div
              ref={inviteModalRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="invite-client-dialog-title"
              aria-describedby="invite-client-dialog-description"
              className="ui-panel-card w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h2 id="invite-client-dialog-title" className="text-2xl font-bold mb-2">{t.inviteClient}</h2>
              <p id="invite-client-dialog-description" className="ui-text-subtle mb-6 text-sm">{t.invitationNote}</p>
              <form onSubmit={handleInviteClient} className="space-y-4">
                <div>
                  <label className="ui-text-main mb-1 block text-sm font-medium">{t.clientName}</label>
                  <input
                    ref={inviteNameInputRef}
                    type="text"
                    value={newInvitation.displayName}
                    onChange={e => setNewInvitation(current => ({ ...current, displayName: e.target.value }))}
                    className="ui-focus-ring ui-form-field w-full rounded-xl px-4 py-3 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="ui-text-main mb-1 block text-sm font-medium">{t.clientEmail}</label>
                  <input
                    required
                    type="email"
                    value={newInvitation.email}
                    onChange={e => setNewInvitation(current => ({ ...current, email: e.target.value }))}
                    placeholder={t.emailPlaceholder}
                    className="ui-focus-ring ui-form-field w-full rounded-xl px-4 py-3 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="ui-focus-ring ui-action-secondary flex-1 rounded-xl px-6 py-3 font-medium transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="ui-focus-ring ui-action-primary flex-1 rounded-xl px-6 py-3 font-medium transition-colors"
                  >
                    {t.invite}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />
            <Route path="/project/:projectId" element={<AuthenticatedLayout><ProjectDetails /></AuthenticatedLayout>} />
            <Route path="/clients" element={<AuthenticatedLayout><ClientsList /></AuthenticatedLayout>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
