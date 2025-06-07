
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  external?: boolean;
  submenu?: NavItem[];
  allowedRoles?: string[]; // Nou camp per als rols permesos
}

export interface User {
  id: string;
  samAccountName: string; // For LDAP login
  name?: string; // Full name, can be derived or stored
  email?: string;
  avatarUrl?: string;
  roles: string[]; // e.g., ['RRHH', 'Manager']
  departments?: string[]; // Department names
  nif?: string; // NIF of the employee this app user corresponds to, if applicable
}

export interface Employee {
  id: string;
  fullName: string;
  nif: string; // Also employeeId from LDAP
  department: string; // Department name
  role: string; // Job title
  status: 'active' | 'inactive';
  onboardingRequestId?: string;
  offboardingRequestId?: string;
}

export type RequestType = 'onboarding' | 'offboarding' | 'access';

export type RequestStatus =
  | 'pending'                 // Sol·licitud nova, pendent de qualsevol acció
  | 'pendingManagerApproval'  // Pendent d'aprovació pel gestor directe
  | 'pendingHRProcessing'     // Pendent de processament per RRHH
  | 'pendingITProcessing'     // Pendent de processament per IT (configuracions, accessos)
  | 'pendingFinalValidation'  // Pendent d'una validació final (ex: per l'usuari o un altre departament)
  | 'inProgress'              // La sol·licitud s'està treballant activament (estat general si no es detalla més)
  | 'approved'                // La sol·licitud ha estat aprovada (pot ser un estat final o intermedi)
  | 'rejected'                // La sol·licitud ha estat rebutjada
  | 'completed'               // Totes les accions de la sol·licitud s'han finalitzat amb èxit
  | 'cancelled';              // La sol·licitud ha estat cancel·lada

export interface RequestedAccessItem {
  system: string;
  accessLevel: string;
  justification: string;
}

export interface Request {
  id: string;
  type: RequestType; // General category, could be refined by RequestTypeDefinition in future
  requestTypeDefinitionId?: string; // ID of the specific RequestTypeDefinition used
  employeeId?: string; // For onboarding/offboarding
  targetEmployeeId?: string; // For access requests for existing employees
  requesterId: string; // User ID
  status: RequestStatus;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  summary?: string; // Short summary of the request
  assignedDepartment?: string; // Departament actualment responsable de la sol·licitud
  details?: {
    // Common fields for onboarding/offboarding
    fullName?: string;
    nif?: string;
    role?: string;
    department?: string;
    lastDay?: string;
    reason?: string;
    // Fields for access requests
    requestedAccesses?: RequestedAccessItem[];
    multiSystemApprovalNote?: string; // Nota per a casos d'aprovació complexos
    // Common optional fields
    rejectionReason?: string;
    cancellationReason?: string;
    employeeId?: string; // Could be present in onboarding details
    // Allow any other string-keyed values
    [key: string]: any;
  };
}

export type TaskStatus = 'pending' | 'inProgress' | 'completed';

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  assigneeDepartment: 'IT' | 'RRHH' | string; // Department responsible for this task template
  order?: number; // To define sequence within a checklist
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  requestTypeIdentifier: string; // e.g., "ONBOARDING_GENERAL", "ACCESS_NETWORK_DRIVE". This might become less relevant if RequestTypeDefinition takes over
  description?: string;
  taskTemplates: TaskTemplate[];
}

export interface Task {
  id: string;
  requestId: string; // ID of the request that generated this task
  checklistTemplateId?: string; // ID of the checklist template this task came from
  taskTemplateId?: string; // ID of the task template this task came from
  title: string;
  description?: string;
  assigneeDepartment: 'IT' | 'RRHH' | string; // Department responsible
  assigneeId?: string; // Specific User ID assigned to the task
  status: TaskStatus;
  observations?: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  dueDate?: string; // ISO Date string
  order?: number; // Original order from the template
  visibleFromDate?: string; // ISO Date string, task should not be visible/actionable before this date
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  requestId: string;
  approverId: string; // User ID of the designated approver
  status: ApprovalStatus;
  comments?: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  approvedAt?: string; // ISO Date string, set when approved/rejected
}

export type Department = {
  id: string;
  name: string;
};

export interface RequestTypeDefinition {
  id: string; // Identificador únic del tipus de sol·licitud, ex: onboarding_general, access_crm_standard
  name: string; // Nom descriptiu, ex: "Alta General d'Empleat", "Sol·licitud Accés CRM (Estàndard)"
  description?: string;
  appliesTo: 'onboarding' | 'offboarding' | 'access' | 'other'; // Categoria general a la qual aplica
  checklistTemplateId: string; // ID de la ChecklistTemplate que s'ha d'utilitzar
  isEnabled: boolean; // Si aquest tipus de sol·licitud està actiu i es pot seleccionar
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO Date string
  read: boolean;
  href?: string; // Optional link for the notification
}

export interface System {
  id: string;
  name: string;
  requiresApprovalBy?: string; 
}

export interface AccessLevel {
  id: string;
  name: string;
}
