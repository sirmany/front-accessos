
"use client"; 

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, AlertTriangle, Info } from "lucide-react";
import { sampleRequests, sampleEmployees, sampleDepartments } from "@/lib/sample-data"; 
import type { Request as RequestType, Employee, RequestedAccessItem, RequestStatus, Department } from "@/types"; 
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { RequestTransferControls } from '@/components/requests/RequestTransferControls'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/context/AuthContext'; 
import { ROLES } from '@/lib/constants'; 
import React from "react"; // Importat React

// Helper to get employee name from ID
const getEmployeeNameById = (employeeId?: string): string => {
  if (!employeeId) return "N/A";
  const employee = sampleEmployees.find(emp => emp.id === employeeId);
  return employee?.fullName || `ID: ${employeeId}`;
};

// Helper to format request type
const formatRequestType = (type: RequestType["type"]): string => {
  switch(type) {
    case "onboarding": return "Alta d'Empleat";
    case "offboarding": return "Baixa d'Empleat";
    case "access": return "Sol·licitud d'Accés";
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

// Helper to get badge variant based on status
const getStatusVariant = (status: RequestStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "approved":
    case "completed":
      return "default";
    case "rejected":
    case "cancelled":
      return "destructive";
    case "pending":
    case "inProgress":
    case "pendingManagerApproval":
    case "pendingHRProcessing":
    case "pendingITProcessing":
    case "pendingFinalValidation":
    default:
      return "secondary";
  }
};

// Helper to get badge color class based on status
const getStatusColorClass = (status: RequestStatus): string => {
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

// Helper function to format status for display
const formatStatusForDisplay = (status: RequestStatus): string => {
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


async function getRequestById(id: string): Promise<RequestType | undefined> {
  return sampleRequests.find(req => req.id === id);
}

async function getDepartments(): Promise<Department[]> {
    return sampleDepartments;
}

// Convertit a Client Component per poder usar useAuth
export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { user: currentUser } = useAuth(); // Obtenir usuari actual
  const [request, setRequest] = React.useState<RequestType | undefined | null>(undefined);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);

  const requestId = params.id;

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const reqData = await getRequestById(requestId);
      const deptData = await getDepartments();
      setRequest(reqData);
      setDepartments(deptData);
      setLoading(false);
    }
    fetchData();
  }, [requestId]);

  if (loading) {
     return <PageHeader title="Carregant detalls de la sol·licitud..." />;
  }

  if (!request) {
    return (
      <>
        <PageHeader
          title="Sol·licitud no Trobada"
          description={`No s'ha pogut trobar cap sol·licitud amb l'ID ${requestId}.`}
        >
          <Button variant="outline" asChild>
            <Link href="/requests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Sol·licituds
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>La sol·licitud que cerques no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  const requestDisplayName = `ID ${request.id}`;
  const employeeAffected = getEmployeeNameById(request.employeeId || request.targetEmployeeId);
  const requesterName = getEmployeeNameById(request.requesterId); 

  const canEditRequest = currentUser?.roles.includes(ROLES.ADMIN) || currentUser?.id === request.requesterId;
  const canTransferRequest = currentUser?.roles.some(role => [ROLES.ADMIN, ROLES.MANAGER].includes(role));

  return (
    <>
      <PageHeader 
        title={`Detalls de la Sol·licitud: ${requestDisplayName}`}
        description={`Informació detallada de la sol·licitud amb ID ${request.id}.`}
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/requests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Sol·licituds
            </Link>
          </Button>
          {canEditRequest && (
            <Button asChild>
              <Link href={`/requests/${request.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Sol·licitud
              </Link>
            </Button>
          )}
        </div>
      </PageHeader>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Informació de la Sol·licitud</CardTitle>
            <CardDescription>Dades completes de la sol·licitud {request.id}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID Sol·licitud</h3>
              <p className="text-lg font-mono">{request.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Tipus</h3>
              <p className="text-lg">{formatRequestType(request.type)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Estat</h3>
              <Badge variant={getStatusVariant(request.status)} className={`text-base ${getStatusColorClass(request.status)}`}>
                {formatStatusForDisplay(request.status)}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Resum</h3>
              <p className="text-lg">{request.summary || "N/A"}</p>
            </div>
            {(request.type === "onboarding" || request.type === "offboarding") && request.employeeId && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Empleat Afectat</h3>
                <p className="text-lg">{employeeAffected}</p>
              </div>
            )}
            {request.type === "access" && request.targetEmployeeId && (
               <div>
                <h3 className="text-sm font-medium text-muted-foreground">Empleat Destinatari</h3>
                <p className="text-lg">{employeeAffected}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Sol·licitant</h3>
              <p className="text-lg">{requesterName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Departament Assignat Actualment</h3>
              <p className="text-lg">{request.assignedDepartment || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Data de Creació</h3>
              <p className="text-lg">{format(new Date(request.createdAt), "P p", { locale: ca })}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Darrera Actualització</h3>
              <p className="text-lg">{format(new Date(request.updatedAt), "P p", { locale: ca })}</p>
            </div>
          </div>

          {request.details && Object.keys(request.details).length > 0 && (
            <div>
              <h3 className="text-md font-semibold mt-4 mb-2">Detalls Específics:</h3>
              <Card className="bg-muted/50 p-0">
                <CardContent className="space-y-3 pt-4">
                  {request.type === "onboarding" && (
                    <>
                      {request.details.fullName && <p><strong>Nom Complet:</strong> {request.details.fullName}</p>}
                      {request.details.nif && <p><strong>NIF:</strong> {request.details.nif}</p>}
                      {request.details.role && <p><strong>Rol:</strong> {request.details.role}</p>}
                      {request.details.department && <p><strong>Departament:</strong> {request.details.department}</p>}
                    </>
                  )}
                  {request.type === "offboarding" && (
                    <>
                      {request.details.lastDay && <p><strong>Darrer Dia:</strong> {format(new Date(request.details.lastDay), "P", { locale: ca })}</p>}
                      {request.details.reason && <p><strong>Motiu:</strong> {request.details.reason}</p>}
                      {request.details.employeeFullName && <p><strong>Empleat:</strong> {request.details.employeeFullName}</p>}
                    </>
                  )}
                  {request.type === "access" && request.details.requestedAccesses && Array.isArray(request.details.requestedAccesses) && (
                    <div className="space-y-4">
                      {request.details.multiSystemApprovalNote && (
                        <Alert variant="default" className="bg-blue-500/10 border-blue-500/30 text-blue-800">
                          <Info className="h-4 w-4 !text-blue-700" />
                          <AlertTitle className="text-blue-800 font-semibold">Nota d'Aprovació Múltiple</AlertTitle>
                          <AlertDescription className="text-blue-700">
                            {request.details.multiSystemApprovalNote}
                          </AlertDescription>
                        </Alert>
                      )}
                      {request.details.requestedAccesses.map((accessItem: RequestedAccessItem, index: number) => (
                        <Card key={index} className="p-4 bg-background/70 shadow-sm">
                          <CardHeader className="p-0 pb-2">
                            <CardTitle className="text-base">Accés #{index + 1}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0 space-y-1 text-sm">
                            <p><strong>Sistema:</strong> {accessItem.system}</p>
                            <p><strong>Nivell d'Accés:</strong> {accessItem.accessLevel}</p>
                            <p><strong>Justificació:</strong> {accessItem.justification}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {request.details.rejectionReason && <p className="text-destructive"><strong>Motiu del Rebuig:</strong> {request.details.rejectionReason}</p>}
                  {request.details.cancellationReason && <p className="text-destructive"><strong>Motiu de la Cancel·lació:</strong> {request.details.cancellationReason}</p>}
                  
                  {/* Fallback for other details not specifically handled (excluding already handled ones) */}
                  {Object.entries(request.details).map(([key, value]) => {
                    const handledKeys = ["fullName", "nif", "role", "department", "lastDay", "reason", "requestedAccesses", "rejectionReason", "cancellationReason", "employeeFullName", "multiSystemApprovalNote"];
                    if (handledKeys.includes(key)) return null;
                    return <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
      {canTransferRequest && <RequestTransferControls request={request} departments={departments} />}
    </>
  );
}
