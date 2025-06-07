
import type { Employee, Request, ChecklistTemplate, Task, TaskTemplate, User, Department, Approval, RequestTypeDefinition, NotificationItem, RequestStatus, System, AccessLevel } from '@/types';

export const sampleEmployees: Employee[] = [
  { id: "emp_001", fullName: "Anna Puig", nif: "12345678A", department: "Informàtica", role: "Desenvolupador/a", status: "active" },
  { id: "emp_002", fullName: "Carles Bosch", nif: "87654321B", department: "Recursos Humans", role: "Tècnic/a de Suport", status: "active" },
  { id: "emp_003", fullName: "Laura Vidal", nif: "11223344C", department: "Màrqueting", role: "Especialista en Màrqueting", status: "inactive", offboardingRequestId: "REQ003" },
  { id: "emp_004", fullName: "Jordi Martí", nif: "44556677D", department: "Finances", role: "Comptable", status: "active" },
  { id: "emp_005", fullName: "Elena Roca", nif: "55667788E", department: "Operacions", role: "Cap de Projecte", status: "active" },
  { id: "emp_006", fullName: "Marc Soler", nif: "66778899F", department: "Informàtica", role: "Analista de Sistemes", status: "active" },
  { id: "emp_007", fullName: "Sofia Pons", nif: "12121212S", department: "Operacions", role: "Analista de Dades", status: "active", onboardingRequestId: "REQ007" },
  { id: "emp_008", fullName: "Robert Grau", nif: "77889900G", department: "Vendes", role: "Comercial", status: "active", onboardingRequestId: "REQ005" },
  { id: "emp_009", fullName: "System Admin Employee", nif: "X0000000X", department: "Administració Sistema", role: "Administrador App", status: "active" },
  { id: "emp_010", fullName: "David Mas", nif: "99887766H", department: "Informàtica", role: "Director/a de Departament", status: "active" },
  { id: "emp_011", fullName: "Clara Font", nif: "10101010Z", department: "Màrqueting", role: "Intern", status: "active" },
];

export let sampleAppUsers: User[] = [
  { id: "user_001", samAccountName: "anna.puig", name: "Anna Puig", email: "anna.puig@example.com", roles: ["Employee", "IT"], departments: ["Informàtica"], nif: "12345678A", avatarUrl: "https://placehold.co/100x100.png" },
  { id: "user_002", samAccountName: "carles.bosch", name: "Carles Bosch", email: "carles.bosch@example.com", roles: ["Employee", "RRHH"], departments: ["Recursos Humans"], nif: "87654321B", avatarUrl: "https://placehold.co/100x100.png" },
  { id: "user_003", samAccountName: "admin.user", name: "System Admin", email: "admin@example.com", roles: ["Admin"], departments: ["Administració Sistema"], nif: "X0000000X", avatarUrl: "https://placehold.co/100x100.png" },
  { id: "user_004", samAccountName: "elena.roca", name: "Elena Roca", email: "elena.roca@example.com", roles: ["Employee", "Manager"], departments: ["Operacions", "Informàtica"], nif: "55667788E", avatarUrl: "https://placehold.co/100x100.png" },
  { id: "user_005", samAccountName: "david.mas", name: "David Mas (Manager IT)", email: "david.mas@example.com", roles: ["Employee", "Manager", "IT"], departments: ["Informàtica"], nif: "99887766H", avatarUrl: "https://placehold.co/100x100.png" },
];

export let sampleRequests: Request[] = [
  {
    id: "REQ001",
    type: "onboarding",
    employeeId: "emp_001", 
    requesterId: "user_002", 
    status: "completed", 
    assignedDepartment: "Recursos Humans",
    createdAt: new Date(2023, 10, 15, 9, 0).toISOString(),
    updatedAt: new Date(2023, 10, 18, 9, 0).toISOString(),
    summary: "Alta General d'Empleat: Anna Puig",
    details: { fullName: "Anna Puig", nif: "12345678A", role: "Desenvolupador/a", department: "Informàtica" },
    requestTypeDefinitionId: "onboarding_general"
  },
  {
    id: "REQ002",
    type: "access",
    targetEmployeeId: "emp_002", 
    requesterId: "user_004", 
    status: "pendingManagerApproval", 
    assignedDepartment: "Informàtica",
    createdAt: new Date(2023, 11, 1, 14, 30).toISOString(),
    updatedAt: new Date(2023, 11, 1, 14, 30).toISOString(),
    summary: "Sol·licitud d'Accés (Estàndard) per a Carles Bosch (1 sistema/es)",
    details: { 
      requestedAccesses: [
        { system: "CRM (Gestió de Relacions amb Clients)", accessLevel: "Lectura i Escriptura", justification: "Necessari per tasques diàries de suport." }
      ]
    },
    requestTypeDefinitionId: "access_request_std"
  },
  {
    id: "REQ003",
    type: "offboarding",
    employeeId: "emp_003", 
    requesterId: "user_002", 
    status: "completed",
    assignedDepartment: "Recursos Humans",
    createdAt: new Date(2024, 0, 5, 11, 15).toISOString(),
    updatedAt: new Date(2024, 0, 15, 16, 45).toISOString(),
    summary: "Baixa empleada: Laura Vidal",
    details: { lastDay: "2024-01-15", reason: "Fi de contracte" },
    requestTypeDefinitionId: "offboarding_standard"
  },
  {
    id: "REQ004",
    type: "access",
    targetEmployeeId: "emp_001", 
    requesterId: "user_001", 
    status: "rejected",
    assignedDepartment: "Informàtica",
    createdAt: new Date(2024, 1, 10, 10, 0).toISOString(),
    updatedAt: new Date(2024, 1, 10, 12, 0).toISOString(),
    summary: "Sol·licitud d'Accés Crític (ERP Admin) per a Anna Puig (1 sistema/es)",
    details: { 
      requestedAccesses: [
        { system: "ERP (Sistema de Planificació de Recursos)", accessLevel: "Administrador del Sistema", justification: "Desplegament urgent" }
      ],
      rejectionReason: "Política de seguretat no ho permet sense aprovació de nivell superior." 
    },
    requestTypeDefinitionId: "access_request_critical" 
  },
  {
    id: "REQ005",
    type: "onboarding",
    requesterId: "user_002", 
    employeeId: "emp_008", 
    status: "pendingITProcessing", 
    assignedDepartment: "Informàtica",
    createdAt: new Date(2024, 2, 1, 10, 0).toISOString(),
    updatedAt: new Date(2024, 2, 5, 14, 0).toISOString(),
    summary: "Alta General d'Empleat: Robert Grau",
    details: { fullName: "Robert Grau", nif: "77889900G", role: "Comercial", department: "Vendes" },
    requestTypeDefinitionId: "onboarding_general"
  },
  {
    id: "REQ006",
    type: "access",
    targetEmployeeId: "emp_004", 
    requesterId: "user_004", 
    status: "pending", 
    assignedDepartment: "Informàtica",
    createdAt: new Date(2024, 2, 20, 16, 0).toISOString(),
    updatedAt: new Date(2024, 2, 20, 16, 0).toISOString(),
    summary: "Sol·licitud d'Accés (Estàndard) per a Jordi Martí (1 sistema/es)",
    details: { 
      requestedAccesses: [
        { system: "Plataforma de Business Intelligence", accessLevel: "Només Lectura", justification: "Necessita generar informes financers." }
      ]
    },
    requestTypeDefinitionId: "access_request_std"
  },
  {
    id: "REQ007", // Aquesta sol·licitud ara servirà per demostrar 'pendingFinalValidation'
    type: "access", 
    targetEmployeeId: "emp_007",
    requesterId: "user_002", 
    status: "pendingFinalValidation", 
    assignedDepartment: "Recursos Humans", // Ja assignat a RRHH per validació
    createdAt: new Date(2023, 9, 5, 11, 0).toISOString(),
    updatedAt: new Date(2023, 9, 6, 17, 0).toISOString(),
    summary: "Sol·licitud Accés BI (amb Validació RRHH) per a Sofia Pons",
    details: { 
      requestedAccesses: [
        { system: "Plataforma de Business Intelligence", accessLevel: "Lectura i Escriptura", justification: "Necessari per anàlisi de dades avançat i reporting departamental." }
      ]
    },
    requestTypeDefinitionId: "access_hr_validation" // Nou tipus de sol·licitud
  },
  {
    id: "REQ008",
    type: "access",
    targetEmployeeId: "emp_006", 
    requesterId: "user_001", 
    status: "completed",
    assignedDepartment: "Informàtica",
    createdAt: new Date(2024, 1, 25, 9, 30).toISOString(),
    updatedAt: new Date(2024, 1, 26, 11, 0).toISOString(),
    summary: "Sol·licitud d'Accés (Estàndard) per a Marc Soler (1 sistema/es)",
    details: { 
      requestedAccesses: [
         { system: "VPN (Accés Remot Segur)", accessLevel: "Permisos Específics d'Usuari", justification: "Treball remot ocasional." }
      ]
    },
    requestTypeDefinitionId: "access_request_std"
  },
  {
    id: "REQ009",
    type: "access",
    targetEmployeeId: "emp_005", 
    requesterId: "user_002", 
    status: "cancelled",
    assignedDepartment: "Informàtica",
    createdAt: new Date(2024, 0, 10, 15,0).toISOString(),
    updatedAt: new Date(2024, 0, 11, 10,0).toISOString(),
    summary: "Sol·licitud d'Accés Crític (ERP Admin) per a Elena Roca (1 sistema/es)",
    details: { 
      requestedAccesses: [
        { system: "ERP (Sistema de Planificació de Recursos)", accessLevel: "Administrador del Sistema", justification: "Rol canviat, ja no necessari." }
      ],
      cancellationReason: "Sol·licitud duplicada." 
    },
    requestTypeDefinitionId: "access_request_critical" 
  },
  {
    id: "REQ010", // Nova sol·licitud per provar el flux de validació
    type: "access",
    targetEmployeeId: "emp_004", // Jordi Martí
    requesterId: "user_001", // Anna Puig
    status: "pendingITProcessing",
    assignedDepartment: "Informàtica",
    createdAt: new Date(2024, 3, 1, 10, 0).toISOString(),
    updatedAt: new Date(2024, 3, 1, 10, 0).toISOString(),
    summary: "Sol·licitud Accés BI (Validació RRHH) per a Jordi Martí",
    details: {
      requestedAccesses: [
        { system: "Plataforma de Business Intelligence", accessLevel: "Lectura i Escriptura", justification: "Requereix accés complet per anàlisi financera." }
      ]
    },
    requestTypeDefinitionId: "access_hr_validation"
  }
];

const onboardingTaskTemplates: TaskTemplate[] = [
  { id: "OT_001", title: "Preparar documentació de benvinguda", assigneeDepartment: "RRHH", order: 1 },
  { id: "OT_002", title: "Crear compte d'usuari (AD, Email)", assigneeDepartment: "IT", order: 2 },
  { id: "OT_003", title: "Configurar estació de treball (PC, perifèrics)", assigneeDepartment: "IT", order: 3 },
  { id: "OT_004", title: "Assignar accessos bàsics (Intranet, Eines comunes)", assigneeDepartment: "IT", order: 4 },
  { id: "OT_005", title: "Programar sessió d'orientació", assigneeDepartment: "RRHH", order: 5 },
  { id: "OT_006", title: "Presentació a l'equip i manager", assigneeDepartment: "RRHH", description: "Coordinar amb el manager directe de l'empleat.", order: 6 },
];

const accessRequestTaskTemplates: TaskTemplate[] = [
  { id: "AT_001", title: "Verificar elegibilitat de l'accés sol·licitat", assigneeDepartment: "IT", order: 1, description: "Comprovar si el rol i departament justifiquen l'accés." },
  { id: "AT_002", title: "Obtenir aprovació del propietari del sistema (si s'escau)", assigneeDepartment: "IT", order: 2 },
  { id: "AT_003", title: "Concedir accés al sistema", assigneeDepartment: "IT", order: 3 },
  { id: "AT_004", title: "Notificar a l'usuari i al sol·licitant", assigneeDepartment: "IT", order: 4 },
];

const internOnboardingTaskTemplates: TaskTemplate[] = [
  { id: "IOT_001", title: "Preparar documentació bàsica de benvinguda (Intern)", assigneeDepartment: "RRHH", order: 1 },
  { id: "IOT_002", title: "Crear compte d'usuari temporal (AD, Email)", assigneeDepartment: "IT", order: 2 },
  { id: "IOT_003", title: "Assignar accessos limitats a eines de projecte", assigneeDepartment: "IT", order: 3 },
  { id: "IOT_004", title: "Presentació al tutor i equip", assigneeDepartment: "RRHH", description: "Coordinar amb el tutor assignat.", order: 4 },
];

const devToolsAccessTaskTemplates: TaskTemplate[] = [
    { id: "DT_001", title: "Verificar rol de desenvolupador", assigneeDepartment: "IT", order: 1 },
    { id: "DT_002", title: "Provisionar llicències de programari", assigneeDepartment: "IT", order: 2 },
    { id: "DT_003", title: "Configurar accés a repositoris de codi", assigneeDepartment: "IT", order: 3 },
    { id: "DT_004", title: "Notificar al desenvolupador", assigneeDepartment: "IT", order: 4 },
];

const offboardingTaskTemplates: TaskTemplate[] = [
  { id: "OFFT_001", title: "Confirmar data de baixa amb l'empleat", assigneeDepartment: "RRHH", order: 1, description: "Comunicar i confirmar l'últim dia laborable." },
  { id: "OFFT_002", title: "Recollir equipament IT (PC, mòbil, etc.)", assigneeDepartment: "IT", order: 2, description: "Assegurar la devolució de tot el material de l'empresa." },
  { id: "OFFT_003", title: "Revocar accessos a sistemes i aplicacions", assigneeDepartment: "IT", order: 3, description: "Desactivar comptes i permisos." },
  { id: "OFFT_004", title: "Processar documentació de sortida (finiquito, etc.)", assigneeDepartment: "RRHH", order: 4, description: "Gestionar tots els tràmits administratius de la baixa." },
  { id: "OFFT_005", title: "Realitzar entrevista de sortida (opcional)", assigneeDepartment: "RRHH", order: 5 },
];

const accessValidationHRTaskTemplates: TaskTemplate[] = [
  { id: "AVHR_001", title: "Verificar i concedir accessos tècnics", assigneeDepartment: "IT", order: 1 },
  { id: "AVHR_002", title: "Validació final de conformitat d'accessos per RRHH", assigneeDepartment: "RRHH", order: 2, description: "Verificar que els accessos concedits són adequats i compleixen polítiques." },
];

export const sampleChecklistTemplates: ChecklistTemplate[] = [
  {
    id: "CLT_ONBOARDING_GENERAL",
    name: "Checklist General d'Onboarding",
    requestTypeIdentifier: "ONBOARDING_GENERAL", 
    description: "Tasques estàndard per a la incorporació de nous empleats.",
    taskTemplates: onboardingTaskTemplates,
  },
  {
    id: "CLT_ACCESS_REQUEST_STD",
    name: "Checklist Estàndard de Sol·licitud d'Accés",
    requestTypeIdentifier: "ACCESS_REQUEST_STD",
    description: "Passos per processar una sol·licitud d'accés a un sistema.",
    taskTemplates: accessRequestTaskTemplates,
  },
  {
    id: "CLT_ONBOARDING_INTERN",
    name: "Checklist Onboarding Estudiant Pràctiques",
    requestTypeIdentifier: "ONBOARDING_INTERN",
    description: "Tasques simplificades per a la incorporació d'estudiants en pràctiques.",
    taskTemplates: internOnboardingTaskTemplates,
  },
  {
    id: "CLT_ACCESS_DEV_TOOLS",
    name: "Checklist Accés Eines de Desenvolupament",
    requestTypeIdentifier: "ACCESS_DEV_TOOLS",
    description: "Tasques per concedir accés a entorns i eines de desenvolupament.",
    taskTemplates: devToolsAccessTaskTemplates,
  },
  {
    id: "CLT_OFFBOARDING_STD",
    name: "Checklist Estàndard de Baixa",
    requestTypeIdentifier: "OFFBOARDING_STANDARD",
    description: "Tasques estàndard per al procés de baixa d'empleats.",
    taskTemplates: offboardingTaskTemplates,
  },
  {
    id: "CLT_ACCESS_VALIDATION_HR",
    name: "Checklist Accés amb Validació RRHH",
    requestTypeIdentifier: "ACCESS_HR_VALIDATION",
    description: "Passos per processar una sol·licitud d'accés que requereix validació final per RRHH.",
    taskTemplates: accessValidationHRTaskTemplates,
  }
];

export let sampleTasks: Task[] = [
  // Tasques per REQ001 (Onboarding Anna Puig - Completada)
  { id: "TSK_001_01", requestId: "REQ001", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_001", title: "Preparar documentació de benvinguda per a Anna Puig", assigneeDepartment: "RRHH", status: "completed", createdAt: new Date(2023, 10, 15, 9, 5).toISOString(), updatedAt: new Date(2023, 10, 15, 10, 0).toISOString(), order: 1, dueDate: new Date(2023, 10, 16).toISOString() },
  { id: "TSK_001_02", requestId: "REQ001", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_002", title: "Crear compte d'usuari (AD, Email) per a Anna Puig", assigneeDepartment: "IT", status: "completed", createdAt: new Date(2023, 10, 15, 9, 10).toISOString(), updatedAt: new Date(2023, 10, 16, 11, 0).toISOString(), order: 2 },
  { id: "TSK_001_03", requestId: "REQ001", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_003", title: "Configurar estació de treball per a Anna Puig", assigneeDepartment: "IT", status: "completed", createdAt: new Date(2023, 10, 15, 9, 15).toISOString(), updatedAt: new Date(2023, 10, 17, 14, 0).toISOString(), order: 3, dueDate: new Date(2023, 10, 17).toISOString() },
  { id: "TSK_001_04", requestId: "REQ001", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_004", title: "Assignar accessos bàsics per a Anna Puig", assigneeDepartment: "IT", status: "completed", createdAt: new Date(2023, 10, 15, 9, 20).toISOString(), updatedAt: new Date(2023, 10, 17, 16, 0).toISOString(), order: 4 },
  { id: "TSK_001_05", requestId: "REQ001", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_005", title: "Programar sessió d'orientació per a Anna Puig", assigneeDepartment: "RRHH", status: "completed", createdAt: new Date(2023, 10, 15, 9, 25).toISOString(), updatedAt: new Date(2023, 10, 18, 9, 0).toISOString(), order: 5 },
  { id: "TSK_001_06", requestId: "REQ001", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_006", title: "Presentació a l'equip i manager per a Anna Puig", assigneeDepartment: "RRHH", status: "completed", createdAt: new Date(2023, 10, 15, 9, 30).toISOString(), updatedAt: new Date(2023, 10, 18, 9, 0).toISOString(), order: 6 },

  // Tasques per REQ002 (Accés Carles Bosch - Pendent Manager Approval)
  { id: "TSK_002_01", requestId: "REQ002", checklistTemplateId: "CLT_ACCESS_REQUEST_STD", taskTemplateId: "AT_001", title: "Verificar elegibilitat accés CRM per a Carles Bosch", assigneeDepartment: "IT", status: "pending", createdAt: new Date(2023, 11, 1, 14, 35).toISOString(), updatedAt: new Date(2023, 11, 1, 14, 35).toISOString(), order: 1, dueDate: new Date(2023, 11, 5).toISOString() },
  
  // Tasques per REQ003 (Offboarding Laura Vidal - Completada)
  { id: "TSK_003_01", requestId: "REQ003", checklistTemplateId: "CLT_OFFBOARDING_STD", taskTemplateId: "OFFT_001", title: "Confirmar data de baixa amb Laura Vidal", assigneeDepartment: "RRHH", status: "completed", createdAt: new Date(2024, 0, 5, 11, 20).toISOString(), updatedAt: new Date(2024, 0, 5, 12, 0).toISOString(), order: 1 },
  { id: "TSK_003_02", requestId: "REQ003", checklistTemplateId: "CLT_OFFBOARDING_STD", taskTemplateId: "OFFT_002", title: "Recollir equipament IT de Laura Vidal", assigneeDepartment: "IT", status: "completed", createdAt: new Date(2024, 0, 5, 11, 25).toISOString(), updatedAt: new Date(2024, 0, 15, 10, 0).toISOString(), order: 2, dueDate: new Date(2024, 0, 15).toISOString() },
  { id: "TSK_003_03", requestId: "REQ003", checklistTemplateId: "CLT_OFFBOARDING_STD", taskTemplateId: "OFFT_003", title: "Revocar accessos a sistemes per a Laura Vidal", assigneeDepartment: "IT", status: "completed", createdAt: new Date(2024, 0, 5, 11, 30).toISOString(), updatedAt: new Date(2024, 0, 15, 16, 0).toISOString(), order: 3 },
  { id: "TSK_003_04", requestId: "REQ003", checklistTemplateId: "CLT_OFFBOARDING_STD", taskTemplateId: "OFFT_004", title: "Processar documentació de sortida per a Laura Vidal", assigneeDepartment: "RRHH", status: "completed", createdAt: new Date(2024, 0, 5, 11, 35).toISOString(), updatedAt: new Date(2024, 0, 15, 16, 45).toISOString(), order: 4 },

  // Tasques per REQ005 (Onboarding Robert Grau - pendingITProcessing)
  { id: "TSK_005_01", requestId: "REQ005", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_001", title: "Preparar documentació de benvinguda per a Robert Grau", assigneeDepartment: "RRHH", status: "completed", createdAt: new Date(2024, 2, 1, 10, 5).toISOString(), updatedAt: new Date(2024, 2, 1, 12, 0).toISOString(), order: 1, dueDate: new Date(2024, 2, 2).toISOString() },
  { id: "TSK_005_02", requestId: "REQ005", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_002", title: "Crear compte d'usuari (AD, Email) per a Robert Grau", assigneeDepartment: "IT", status: "pending", createdAt: new Date(2024, 2, 1, 10, 10).toISOString(), updatedAt: new Date(2024, 2, 2, 15, 0).toISOString(), order: 2, dueDate: new Date(2024, 2, 4).toISOString() },
  { id: "TSK_005_03", requestId: "REQ005", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_003", title: "Configurar estació de treball per a Robert Grau", assigneeDepartment: "IT", status: "pending", createdAt: new Date(2024, 2, 1, 10, 15).toISOString(), updatedAt: new Date(2024, 2, 1, 10, 15).toISOString(), order: 3 },
  { id: "TSK_005_04", requestId: "REQ005", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_004", title: "Assignar accessos bàsics (Intranet, Eines comunes) per a Robert Grau", assigneeDepartment: "IT", status: "pending", createdAt: new Date(2024, 2, 1, 10, 20).toISOString(), updatedAt: new Date(2024, 2, 1, 10, 20).toISOString(), order: 4, dueDate: new Date(2024, 2, 5).toISOString() },
  { id: "TSK_005_05", requestId: "REQ005", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_005", title: "Programar sessió d'orientació per a Robert Grau", assigneeDepartment: "RRHH", status: "pending", createdAt: new Date(2024, 2, 1, 10, 25).toISOString(), updatedAt: new Date(2024, 2, 1, 10, 25).toISOString(), order: 5 },
  { id: "TSK_005_06", requestId: "REQ005", checklistTemplateId: "CLT_ONBOARDING_GENERAL", taskTemplateId: "OT_006", title: "Presentació a l'equip i manager per a Robert Grau", assigneeDepartment: "RRHH", status: "pending", description: "Coordinar amb el manager directe de Robert Grau.", createdAt: new Date(2024, 2, 1, 10, 30).toISOString(), updatedAt: new Date(2024, 2, 1, 10, 30).toISOString(), order: 6 },

  // Tasques per REQ007 (Accés Sofia Pons amb validació RRHH - Pendent validació final RRHH)
  { id: "TSK_007_01", requestId: "REQ007", checklistTemplateId: "CLT_ACCESS_VALIDATION_HR", taskTemplateId: "AVHR_001", title: "Verificar i concedir accessos tècnics BI per a Sofia Pons", assigneeDepartment: "IT", status: "completed", createdAt: new Date(2023, 9, 5, 11, 5).toISOString(), updatedAt: new Date(2023, 9, 6, 16, 0).toISOString(), order: 1, dueDate: new Date(2023, 9, 6).toISOString() },
  { id: "TSK_007_02", requestId: "REQ007", checklistTemplateId: "CLT_ACCESS_VALIDATION_HR", taskTemplateId: "AVHR_002", title: "Validació final de conformitat d'accessos BI per a Sofia Pons", assigneeDepartment: "RRHH", status: "pending", createdAt: new Date(2023, 9, 5, 11, 10).toISOString(), updatedAt: new Date(2023, 9, 6, 17, 0).toISOString(), order: 2, dueDate: new Date(2023, 9, 7).toISOString() },

  // Tasques per REQ008 (Accés Marc Soler - Completada)
  { id: "TSK_008_01", requestId: "REQ008", checklistTemplateId: "CLT_ACCESS_REQUEST_STD", taskTemplateId: "AT_001", title: "Verificar elegibilitat accés VPN per a Marc Soler", assigneeDepartment: "IT", status: "completed", createdAt: new Date(2024, 1, 25, 9, 35).toISOString(), updatedAt: new Date(2024, 1, 25, 10, 0).toISOString(), order: 1, dueDate: new Date(2024, 1, 26).toISOString() },
  { id: "TSK_008_02", requestId: "REQ008", checklistTemplateId: "CLT_ACCESS_REQUEST_STD", taskTemplateId: "AT_003", title: "Concedir accés VPN per a Marc Soler", assigneeDepartment: "IT", status: "completed", createdAt: new Date(2024, 1, 25, 9, 40).toISOString(), updatedAt: new Date(2024, 1, 26, 10, 0).toISOString(), order: 3 }, 
  { id: "TSK_008_03", requestId: "REQ008", checklistTemplateId: "CLT_ACCESS_REQUEST_STD", taskTemplateId: "AT_004", title: "Notificar accés VPN a Marc Soler", assigneeDepartment: "IT", status: "completed", createdAt: new Date(2024, 1, 25, 9, 45).toISOString(), updatedAt: new Date(2024, 1, 26, 11, 0).toISOString(), order: 4 },

  // Tasques per REQ010 (Accés Jordi Martí amb validació RRHH - Pendent IT)
  { id: "TSK_010_01", requestId: "REQ010", checklistTemplateId: "CLT_ACCESS_VALIDATION_HR", taskTemplateId: "AVHR_001", title: "Verificar i concedir accessos tècnics BI per a Jordi Martí", assigneeDepartment: "IT", status: "pending", createdAt: new Date(2024, 3, 1, 10, 5).toISOString(), updatedAt: new Date(2024, 3, 1, 10, 5).toISOString(), order: 1, dueDate: new Date(2024, 3, 3).toISOString() },
  { id: "TSK_010_02", requestId: "REQ010", checklistTemplateId: "CLT_ACCESS_VALIDATION_HR", taskTemplateId: "AVHR_002", title: "Validació final de conformitat d'accessos BI per a Jordi Martí", assigneeDepartment: "RRHH", status: "pending", createdAt: new Date(2024, 3, 1, 10, 10).toISOString(), updatedAt: new Date(2024, 3, 1, 10, 10).toISOString(), order: 2, dueDate: new Date(2024, 3, 5).toISOString() },
];


export let sampleDepartments: Department[] = [
  { id: "hr", name: "Recursos Humans" },
  { id: "it", name: "Informàtica" },
  { id: "finance", name: "Finances" },
  { id: "marketing", name: "Màrqueting" },
  { id: "sales", name: "Vendes" },
  { id: "operations", name: "Operacions" },
  { id: "admin_dept", name: "Administració Sistema" }
];

export let sampleApprovals: Approval[] = [
  {
    id: "APP001",
    requestId: "REQ002", // Access request for Carles Bosch
    approverId: "user_005", // David Mas (Manager IT) to approve
    status: "pending",
    createdAt: new Date(2023, 11, 1, 14, 35).toISOString(),
    updatedAt: new Date(2023, 11, 1, 14, 35).toISOString(),
  },
  {
    id: "APP002",
    requestId: "REQ006", // Access request for Jordi Martí
    approverId: "user_005", // David Mas (Manager IT) to approve
    status: "pending",
    createdAt: new Date(2024, 2, 20, 16, 5).toISOString(),
    updatedAt: new Date(2024, 2, 20, 16, 5).toISOString(),
  },
   {
    id: "APP003",
    requestId: "REQ001", // Onboarding for Anna Puig
    approverId: "user_002", // Carles Bosch (RRHH) approved this already
    status: "approved",
    comments: "Tot correcte per l'alta.",
    createdAt: new Date(2023, 10, 15, 9, 5).toISOString(),
    updatedAt: new Date(2023, 10, 16, 10, 0).toISOString(),
    approvedAt: new Date(2023, 10, 16, 10, 0).toISOString(),
  },
];


export let sampleRequestTypeDefinitions: RequestTypeDefinition[] = [
  { 
    id: 'onboarding_general', 
    name: 'Alta General d\'Empleat', 
    appliesTo: 'onboarding', 
    checklistTemplateId: 'CLT_ONBOARDING_GENERAL', 
    isEnabled: true, 
    description: 'Procés estàndard per a noves incorporacions.' 
  },
  { 
    id: 'onboarding_intern', 
    name: 'Alta Estudiant en Pràctiques', 
    appliesTo: 'onboarding', 
    checklistTemplateId: 'CLT_ONBOARDING_INTERN', 
    isEnabled: true, 
    description: 'Procés simplificat per a estudiants en pràctiques.' 
  },
  { 
    id: 'access_request_std', 
    name: 'Sol·licitud d\'Accés (Estàndard)', 
    appliesTo: 'access', 
    checklistTemplateId: 'CLT_ACCESS_REQUEST_STD', 
    isEnabled: true, 
    description: 'Procés estàndard per a sol·licitar accessos a sistemes comuns.' 
  },
  { 
    id: 'access_dev_tools', 
    name: 'Sol·licitud Accés Eines Desenvolupament', 
    appliesTo: 'access', 
    checklistTemplateId: 'CLT_ACCESS_DEV_TOOLS', 
    isEnabled: true, 
    description: 'Procés per a sol·licitar accés a eines específiques de desenvolupament.' 
  },
  { 
    id: 'access_request_critical', 
    name: 'Sol·licitud d\'Accés Crític (ERP Admin)', 
    appliesTo: 'access', 
    checklistTemplateId: 'CLT_ACCESS_REQUEST_STD', 
    isEnabled: true, 
    description: 'Procés per a sol·licitar accessos de nivell administrador a sistemes crítics.' 
  },
  { 
    id: 'offboarding_standard', 
    name: 'Baixa General d\'Empleat', 
    appliesTo: 'offboarding', 
    checklistTemplateId: 'CLT_OFFBOARDING_STD', 
    isEnabled: true, 
    description: 'Procés estàndard per a la baixa d\'empleats.' 
  },
  { 
    id: 'access_hr_validation', 
    name: 'Sol·licitud d\'Accés amb Validació RRHH', 
    appliesTo: 'access', 
    checklistTemplateId: 'CLT_ACCESS_VALIDATION_HR', 
    isEnabled: true, 
    description: 'Procés d\'accés que requereix una validació final per part de Recursos Humans.' 
  },
];

export let sampleSystems: System[] = [
  { id: "erp", name: "ERP (Sistema de Planificació de Recursos)", requiresApprovalBy: "Rol: Manager" }, // Canviat per utilitzar el prefix "Rol:"
  { id: "crm", name: "CRM (Gestió de Relacions amb Clients)", requiresApprovalBy: "Rol: Manager" }, // Canviat per utilitzar el prefix "Rol:"
  { id: "network_shared", name: "Unitats de Xarxa Compartides" },
  { id: "vpn", name: "VPN (Accés Remot Segur)" },
  { id: "email_corporate", name: "Correu Electrònic Corporatiu" },
  { id: "project_management_tool", name: "Eina de Gestió de Projectes", requiresApprovalBy: "Rol: Cap de Projecte" }, // Canviat per utilitzar el prefix "Rol:"
  { id: "bi_platform", name: "Plataforma de Business Intelligence" },
  { id: "intranet", name: "Intranet Corporativa" },
];

export let sampleAccessLevels: AccessLevel[] = [
  { id: "read_only", name: "Només Lectura" },
  { id: "read_write", name: "Lectura i Escriptura" },
  { id: "read_write_delete", name: "Lectura, Escriptura i Esborrat" },
  { id: "admin", name: "Administrador del Sistema" },
  { id: "user_specific", name: "Permisos Específics d'Usuari" },
];

export let sampleNotifications: NotificationItem[] = [
  {
    id: "notif_1",
    title: "Sol·licitud Aprovada",
    description: "La teva sol·licitud d'accés REQ008 per a Marc Soler ha estat aprovada.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // Fa 5 minuts
    read: false,
    href: "/requests/REQ008"
  },
  {
    id: "notif_2",
    title: "Nova Tasca Assignada",
    description: "Se t'ha assignat la tasca 'Configurar estació de treball per a Robert Grau'.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // Fa 2 hores
    read: false,
    href: "/tasks"
  },
  {
    id: "notif_3",
    title: "Recordatori: Aprovació Pendent",
    description: "La sol·licitud REQ002 per a Carles Bosch encara necessita la teva aprovació.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Fa 1 dia
    read: true,
    href: "/approvals"
  },
];

    
