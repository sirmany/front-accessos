
import type { NavItem } from '@/types';
import { LayoutDashboard, Users, FileText, ListChecks, CheckSquare, Settings, ClipboardList, UserCog, Building, ListFilter, ListTree, KeyRound } from 'lucide-react';
import type { RequestTypeDefinition } from '@/types';

export const APP_NAME = "Gestió Sol·licituds";

export const ROLES = {
  RRHH: "RRHH",
  IT: "IT",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
  ADMIN: "Admin"
};


export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Panell",
    // allowedRoles: undefined or empty array means accessible to all authenticated users
  },
  {
    href: "/employees",
    icon: Users,
    label: "Empleats",
    allowedRoles: [ROLES.ADMIN, ROLES.RRHH, ROLES.MANAGER],
  },
  {
    href: "/requests",
    icon: FileText,
    label: "Sol·licituds",
    // allowedRoles: undefined (all authenticated can view list)
  },
  {
    href: "/tasks",
    icon: ListChecks,
    label: "Tasques",
    // allowedRoles: undefined (all authenticated can view their tasks - filtering will be done in component)
  },
  {
    href: "/approvals",
    icon: CheckSquare,
    label: "Aprovacions",
    allowedRoles: [ROLES.MANAGER, ROLES.IT, ROLES.ADMIN, ROLES.RRHH], // Broad for now, specific approvals depend on assignment
  },
  {
    href: "#",
    icon: Settings,
    label: "Administració",
    allowedRoles: [ROLES.ADMIN], // Only Admin can see the Administration parent menu
    submenu: [
      {
        href: "/admin/request-types",
        icon: ListFilter,
        label: "Tipus de Sol·licitud",
        // allowedRoles: [ROLES.ADMIN] // Inherited from parent
      },
      {
        href: "/admin/checklist-templates",
        icon: ClipboardList,
        label: "Plantilles de Checklist",
        // allowedRoles: [ROLES.ADMIN] // Inherited
      },
      {
        href: "/admin/users",
        icon: UserCog,
        label: "Gestió d'Usuaris",
        // allowedRoles: [ROLES.ADMIN] // Inherited
      },
      {
        href: "/admin/departments",
        icon: Building,
        label: "Gestió de Departaments",
        // allowedRoles: [ROLES.ADMIN] // Inherited
      },
      {
        href: "/admin/systems",
        icon: ListTree,
        label: "Gestió de Sistemes",
        // allowedRoles: [ROLES.ADMIN] // Inherited
      },
      {
        href: "/admin/access-levels",
        icon: KeyRound,
        label: "Nivells d'Accés",
        // allowedRoles: [ROLES.ADMIN] // Inherited
      },
    ],
  },
];


export const EMPLOYEE_ROLES = [
 "Desenvolupador/a", "Analista de Sistemes", "Cap de Projecte", "Administratiu/va", "Tècnic/a de Suport", "Especialista en Màrqueting", "Comptable", "Director/a de Departament"
];

export const REQUEST_TYPE_APPLIES_TO_OPTIONS: { value: RequestTypeDefinition['appliesTo']; label: string }[] = [
    { value: 'onboarding', label: 'Onboarding (Alta)' },
    { value: 'offboarding', label: 'Offboarding (Baixa)' },
    { value: 'access', label: 'Sol·licitud d\'Accés' },
    { value: 'other', label: 'Altres' },
];
