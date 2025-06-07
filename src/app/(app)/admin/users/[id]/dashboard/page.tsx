
// Note: This page is a Server Component, but `withAuthRole` expects a Client Component.
// For Server Components, role-based access is typically handled in layouts or middleware.
// For this prototype, we'll convert it to a Client Component to use `withAuthRole`.
// A more robust solution for RSCs would involve checking roles in a parent layout or using Next.js middleware.
"use client"; 

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, ShieldCheck, History, FileText, UserCheck, UserX, CheckSquare, ThumbsUp, ThumbsDown, Link2 } from "lucide-react";
import { sampleAppUsers, sampleEmployees, sampleRequests, sampleApprovals } from "@/lib/sample-data";
import type { User, Employee, Request as RequestType, RequestStatus, Approval, ApprovalStatus, RequestedAccessItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

interface ActivityHistoryItem {
  id: string;
  type: 'request_created' | 'request_affected' | 'approval_action';
  date: string; 
  summary: string;
  status?: RequestStatus | ApprovalStatus; 
  statusText?: string; 
  icon: React.ReactNode;
  href?: string;
  details?: string | React.ReactNode; 
}

const getStatusVariant = (status: RequestStatus | ApprovalStatus | undefined): "default" | "secondary" | "destructive" => {
  if (!status) return "secondary";
  switch (status) {
    case "approved":
    case "completed":
      return "default";
    case "rejected":
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusColorClass = (status: RequestStatus | ApprovalStatus | undefined): string => {
  if (!status) return "bg-gray-500/20 text-gray-700 border-gray-400";
  switch (status) {
    case "approved":
    case "completed":
      return "bg-green-500/20 text-green-700 border-green-400";
    case "rejected":
    case "cancelled":
      return "bg-red-500/20 text-red-700 border-red-400";
    case "pending":
      return "bg-yellow-500/20 text-yellow-700 border-yellow-400";
    case "inProgress":
    case "pendingHRProcessing":
    case "pendingITProcessing":
      return "bg-blue-500/20 text-blue-700 border-blue-400";
    case "pendingManagerApproval":
        return "bg-orange-500/20 text-orange-700 border-orange-400";
    case "pendingFinalValidation":
        return "bg-purple-500/20 text-purple-700 border-purple-400";
    default: 
      return "bg-gray-500/20 text-gray-700 border-gray-400";
  }
}

const formatRequestStatusForDisplay = (status: RequestStatus): string => {
  const statusMap: Record<RequestStatus, string> = {
    pending: "Pendent",
    pendingManagerApproval: "Pendent Aprov. Gestor",
    pendingHRProcessing: "Pendent RRHH",
    pendingITProcessing: "Pendent IT",
    pendingFinalValidation: "Pendent Valid. Final",
    inProgress: "En Curs",
    approved: "Aprovada",
    rejected: "Rebutjada",
    completed: "Completada",
    cancelled: "Cancel·lada",
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

const formatApprovalStatusForDisplay = (status: ApprovalStatus): string => {
    const statusMap: Record<ApprovalStatus, string> = {
        pending: "Pendent d'aprovació",
        approved: "Aprovada",
        rejected: "Rebutjada",
    };
    return statusMap[status] || status;
}

const getActionIcon = (type: ActivityHistoryItem['type'], requestType?: RequestType['type'], approvalStatus?: ApprovalStatus) => {
  switch(type) {
    case 'request_created':
    case 'request_affected':
      if (requestType === 'onboarding') return <UserCheck className="h-5 w-5 mr-3 text-green-600 flex-shrink-0" />;
      if (requestType === 'offboarding') return <UserX className="h-5 w-5 mr-3 text-red-600 flex-shrink-0" />;
      if (requestType === 'access') return <FileText className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />;
      return <FileText className="h-5 w-5 mr-3 text-gray-600 flex-shrink-0" />;
    case 'approval_action':
      if (approvalStatus === 'approved') return <ThumbsUp className="h-5 w-5 mr-3 text-green-600 flex-shrink-0" />;
      if (approvalStatus === 'rejected') return <ThumbsDown className="h-5 w-5 mr-3 text-red-600 flex-shrink-0" />;
      return <CheckSquare className="h-5 w-5 mr-3 text-gray-600 flex-shrink-0" />;
    default: return <History className="h-5 w-5 mr-3 text-gray-600 flex-shrink-0" />;
  }
};

interface UserData {
  user: User | undefined; 
  employee: Employee | undefined; 
  assignedAccesses: { request: RequestType, accessItem: RequestedAccessItem }[];
  activityHistory: ActivityHistoryItem[];
}

function UserDashboardPageInternal() {
  const params = useParams();
  const userId = params.id as string;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const user = sampleAppUsers.find(u => u.id === userId);
      let employee: Employee | undefined = undefined;
      const assignedAccesses: { request: RequestType, accessItem: RequestedAccessItem }[] = [];
      const activityHistory: ActivityHistoryItem[] = [];

      if (user) {
        if (user.nif) {
          employee = sampleEmployees.find(emp => emp.nif === user.nif);
        }

        if (employee) {
          sampleRequests.filter(req => 
            req.type === 'access' &&
            (req.status === 'approved' || req.status === 'completed') &&
            req.targetEmployeeId === employee.id
          ).forEach(req => {
            if (req.details?.requestedAccesses && Array.isArray(req.details.requestedAccesses)) {
              req.details.requestedAccesses.forEach((accessItem: RequestedAccessItem) => {
                assignedAccesses.push({ request: req, accessItem });
              });
            }
          });
        }

        sampleRequests.forEach(req => {
          let activityType: ActivityHistoryItem['type'] | null = null;
          let detailText: string | undefined;

          if (req.requesterId === user.id) {
            activityType = 'request_created';
            detailText = "Sol·licitada per tu";
            if (employee && (req.employeeId === employee.id || req.targetEmployeeId === employee.id) && req.requesterId !== user.id) {
              detailText += ` (afecta a ${employee.fullName})`; 
            } else if (req.employeeId || req.targetEmployeeId) {
                const affectedEmp = sampleEmployees.find(e => e.id === (req.employeeId || req.targetEmployeeId));
                if (affectedEmp) detailText += ` (afecta a ${affectedEmp.fullName})`;
            }

          } else if (employee && (req.employeeId === employee.id || req.targetEmployeeId === employee.id)) {
            activityType = 'request_affected';
            detailText = `T'afecta directament`;
            const requester = sampleAppUsers.find(u => u.id === req.requesterId);
            if (requester) detailText += ` (sol·licitada per ${requester.name || requester.samAccountName})`;
          }
          
          if (activityType) {
            activityHistory.push({
              id: `req-${req.id}-${activityType}`,
              type: activityType,
              date: req.updatedAt, 
              summary: `${req.summary || `Sol·licitud ${req.id}`}`,
              status: req.status,
              statusText: formatRequestStatusForDisplay(req.status),
              icon: getActionIcon(activityType, req.type),
              href: `/requests/${req.id}`,
              details: detailText
            });
          }
        });

        sampleApprovals.filter(appr => appr.approverId === user.id && (appr.status === 'approved' || appr.status === 'rejected'))
        .forEach(appr => {
          const relatedRequest = sampleRequests.find(r => r.id === appr.requestId);
          const actionText = appr.status === 'approved' ? 'Has aprovat' : 'Has rebutjat';
          activityHistory.push({
            id: `appr-${appr.id}`,
            type: 'approval_action',
            date: appr.approvedAt || appr.updatedAt,
            summary: `${actionText} la sol·licitud: ${relatedRequest?.summary || appr.requestId}`,
            status: appr.status,
            statusText: formatApprovalStatusForDisplay(appr.status),
            icon: getActionIcon('approval_action', undefined, appr.status),
            href: `/requests/${appr.requestId}`,
            details: appr.comments ? <span className="text-xs text-muted-foreground block mt-1">El teu comentari: {appr.comments}</span> : undefined,
          });
        });
        
        activityHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      setUserData({ user, employee, assignedAccesses, activityHistory: activityHistory.slice(0, 20) });
      setIsLoading(false);
    }
    if (userId) {
        fetchData();
    }
  }, [userId]);


  if (isLoading || !userData) {
    return (
      <PageHeader title="Carregant Dashboard..." description="Si us plau, espera." />
    );
  }

  const { user, employee, assignedAccesses, activityHistory } = userData;

  if (!user) {
    return (
      <>
        <PageHeader
          title="Dashboard d'Usuari: No Trobat"
          description={`No s'ha pogut trobar cap usuari amb l'ID ${userId}.`}
        >
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Usuaris
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>L'usuari no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  const userDisplayName = user.name || user.samAccountName;

  return (
    <>
      <PageHeader
        title={`Dashboard de: ${userDisplayName}`}
        description={`Visió general dels accessos i activitat de ${userDisplayName}.`}
      >
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar a Llista d'Usuaris
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
              Accessos Assignats
            </CardTitle>
            <CardDescription>Sistemes i permisos actualment concedits a {employee ? employee.fullName : `l'usuari ${userDisplayName}`}.</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedAccesses.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {assignedAccesses.map(({request, accessItem}, index) => (
                  <li key={`${request.id}-${index}`} className="p-3 border rounded-md bg-muted/50">
                    <p className="font-semibold">{accessItem.system}</p>
                    <p className="text-sm text-muted-foreground">
                      Nivell: <Badge variant="secondary">{accessItem.accessLevel}</Badge>
                    </p>
                    <Link href={`/requests/${request.id}`} className="text-xs text-primary hover:underline mt-1 flex items-center">
                      <Link2 className="h-3 w-3 mr-1" /> Sol·licitud {request.id}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              employee ? (
                <p className="text-muted-foreground">L'empleat {employee.fullName} (associat a aquest usuari) no té accessos actius registrats a través de sol·licituds completades.</p>
              ) : (
                 <p className="text-muted-foreground">Aquest usuari no està enllaçat a un empleat amb NIF o no té accessos assignats.</p>
              )
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5 text-primary" />
              Històric d'Activitat Recent
            </CardTitle>
            <CardDescription>Registre de sol·licituds i aprovacions relacionades amb {userDisplayName}.</CardDescription>
          </CardHeader>
          <CardContent>
            {activityHistory && activityHistory.length > 0 ? (
              <ul className="space-y-4 max-h-96 overflow-y-auto">
                {activityHistory.map(item => (
                  <li key={item.id} className="p-3 border rounded-md bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-start">
                      {item.icon}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1 gap-2">
                           {item.href ? (
                                <Link href={item.href} className="font-semibold text-primary hover:underline text-sm break-words flex-grow">
                                    {item.summary}
                                </Link>
                           ) : (
                                <span className="font-semibold text-sm break-words flex-grow">{item.summary}</span>
                           )}
                           {item.statusText && item.status && (
                            <Badge variant={getStatusVariant(item.status)} className={`text-xs ${getStatusColorClass(item.status)} whitespace-nowrap flex-shrink-0`}>
                                {item.statusText}
                            </Badge>
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Data: {format(new Date(item.date), "P p", { locale: ca })}
                        </p>
                        {item.details && typeof item.details === 'string' && (
                           <p className="text-xs text-muted-foreground">{item.details}</p>
                        )}
                        {item.details && typeof item.details !== 'string' && item.details}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No hi ha activitat recent registrada per a aquest usuari.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default withAuthRole(UserDashboardPageInternal, [ROLES.ADMIN]);
