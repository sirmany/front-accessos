
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, AlertTriangle, Save, XCircle, Users2, CalendarIcon, CalendarDays } from "lucide-react";
import { sampleTasks, sampleRequests, sampleAppUsers, sampleChecklistTemplates, sampleDepartments } from "@/lib/sample-data";
import type { Task, Request as RequestType, User, ChecklistTemplate, TaskTemplate, TaskStatus, Department } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext'; // Importat
import { ROLES } from '@/lib/constants'; // Importat


const getRequestSummaryById = (requestId?: string): string => {
  if (!requestId) return "N/A";
  const request = sampleRequests.find(req => req.id === requestId);
  return request?.summary || `ID: ${requestId}`;
};

const getUserNameById = (userId?: string): string => {
  if (!userId) return "No assignat";
  const user = sampleAppUsers.find(u => u.id === userId);
  return user?.name || user?.samAccountName || `ID: ${userId}`;
};

const getChecklistTemplateNameById = (templateId?: string): string => {
  if (!templateId) return "N/A";
  const template = sampleChecklistTemplates.find(t => t.id === templateId);
  return template?.name || `ID: ${templateId}`;
};

const getTaskTemplateTitleById = (checklistTemplateId?: string, taskTemplateId?: string): string => {
    if (!checklistTemplateId || !taskTemplateId) return "N/A";
    const checklist = sampleChecklistTemplates.find(t => t.id === checklistTemplateId);
    if (!checklist) return "N/A";
    const taskTemplate = checklist.taskTemplates.find(tt => tt.id === taskTemplateId);
    return taskTemplate?.title || `ID: ${taskTemplateId}`;
};

const getStatusVariant = (status: TaskStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "completed":
      return "default";
    case "inProgress":
    default:
      return "secondary";
  }
};

const getStatusColorClass = (status: TaskStatus): string => {
  switch (status) {
    case "completed":
      return "bg-green-500/20 text-green-700 border-green-400";
    case "inProgress":
      return "bg-blue-500/20 text-blue-700 border-blue-400";
    case "pending":
    default:
      return "bg-yellow-500/20 text-yellow-700 border-yellow-400";
  }
};

const formatStatusForDisplay = (status: TaskStatus): string => {
  const statusMap: Record<TaskStatus, string> = {
    pending: "Pendent",
    inProgress: "En Curs",
    completed: "Completada",
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const { toast } = useToast();
  const router = useRouter();
  const { user: currentUser } = useAuth(); // Obtenir usuari

  const [taskData, setTaskData] = useState<Task | null | undefined>(undefined);
  const [observationsInput, setObservationsInput] = useState('');
  const [isEditingObservations, setIsEditingObservations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isAssignDialogVisible, setIsAssignDialogVisible] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | undefined>(undefined);

  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(undefined);


  useEffect(() => {
    setIsLoading(true);
    if (taskId) {
      const foundTask = sampleTasks.find(t => t.id === taskId);
      if (foundTask) {
        setTaskData(foundTask);
        setObservationsInput(foundTask.observations || '');
        setSelectedDepartment(foundTask.assigneeDepartment);
        setSelectedAssigneeId(foundTask.assigneeId);
        setSelectedDueDate(foundTask.dueDate ? new Date(foundTask.dueDate) : undefined);
      } else {
        setTaskData(null);
      }
    }
    setIsLoading(false);
  }, [taskId]);

  const canManageTaskDetails = currentUser?.roles.some(role => [ROLES.ADMIN, ROLES.MANAGER].includes(role));

  const handleEditObservations = () => {
    if (taskData) {
      setObservationsInput(taskData.observations || '');
    }
    setIsEditingObservations(true);
  };

  const handleSaveObservations = () => {
    if (!taskData) return;

    const taskIndex = sampleTasks.findIndex(t => t.id === taskData.id);
    if (taskIndex !== -1) {
      const updatedTask = {
        ...sampleTasks[taskIndex],
        observations: observationsInput,
        updatedAt: new Date().toISOString(),
      };
      sampleTasks[taskIndex] = updatedTask;
      setTaskData(updatedTask);
      toast({
        title: "Observacions Guardades",
        description: "Les observacions de la tasca s'han actualitzat correctament.",
      });
    } else {
      toast({
        title: "Error",
        description: "No s'ha pogut trobar la tasca per actualitzar les observacions.",
        variant: "destructive",
      });
    }
    setIsEditingObservations(false);
  };

  const handleCancelEditObservations = () => {
    if (taskData) {
      setObservationsInput(taskData.observations || '');
    }
    setIsEditingObservations(false);
  };

  const handleOpenAssignDialog = () => {
    if (taskData) {
      setSelectedDepartment(taskData.assigneeDepartment);
      setSelectedAssigneeId(taskData.assigneeId);
    }
    setIsAssignDialogVisible(true);
  };

  const handleSaveAssignment = () => {
    if (!taskData || selectedDepartment === undefined) {
      toast({
        title: "Error d'Assignació",
        description: "S'ha de seleccionar un departament.",
        variant: "destructive",
      });
      return;
    }

    const taskIndex = sampleTasks.findIndex(t => t.id === taskData.id);
    if (taskIndex !== -1) {
      const updatedTask = {
        ...sampleTasks[taskIndex],
        assigneeDepartment: selectedDepartment,
        assigneeId: selectedAssigneeId === "" ? undefined : selectedAssigneeId, // Handle "Cap usuari"
        updatedAt: new Date().toISOString(),
      };
      sampleTasks[taskIndex] = updatedTask;
      setTaskData(updatedTask);
      toast({
        title: "Assignació Actualitzada",
        description: "La tasca s'ha reassignat correctament.",
      });
    } else {
      toast({
        title: "Error",
        description: "No s'ha pogut trobar la tasca per reassignar.",
        variant: "destructive",
      });
    }
    setIsAssignDialogVisible(false);
  };

  const handleToggleEditDueDate = () => {
    if (taskData && !isEditingDueDate) {
        setSelectedDueDate(taskData.dueDate ? new Date(taskData.dueDate) : undefined);
    }
    setIsEditingDueDate(!isEditingDueDate);
  };

  const handleSaveDueDate = () => {
    if (!taskData) return;

    const taskIndex = sampleTasks.findIndex(t => t.id === taskData.id);
    if (taskIndex !== -1) {
      const updatedTask = {
        ...sampleTasks[taskIndex],
        dueDate: selectedDueDate ? selectedDueDate.toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
      sampleTasks[taskIndex] = updatedTask;
      setTaskData(updatedTask);
      toast({
        title: "Data de Venciment Actualitzada",
        description: `La data de venciment s'ha ${selectedDueDate ? 'establert a ' + format(selectedDueDate, "P", {locale: ca}) : 'eliminat'}.`,
      });
    } else {
       toast({
        title: "Error",
        description: "No s'ha pogut trobar la tasca per actualitzar la data de venciment.",
        variant: "destructive",
      });
    }
    setIsEditingDueDate(false);
  };


  if (isLoading || taskData === undefined) {
    return <PageHeader title="Carregant detalls de la tasca..." description="Si us plau, espera." />;
  }

  if (!taskData) {
    return (
      <>
        <PageHeader
          title="Tasca no Trobada"
          description={`No s'ha pogut trobar cap tasca amb l'ID ${taskId}.`}
        >
          <Button variant="outline" asChild>
            <Link href="/tasks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Tasques
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>La tasca que cerques no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  const taskDisplayName = taskData.title || `Tasca ${taskData.id}`;
  const requestSummary = getRequestSummaryById(taskData.requestId);
  const assignedUserName = getUserNameById(taskData.assigneeId);
  const checklistTemplateName = getChecklistTemplateNameById(taskData.checklistTemplateId);
  const taskTemplateOriginTitle = getTaskTemplateTitleById(taskData.checklistTemplateId, taskData.taskTemplateId);

  return (
    <>
      <PageHeader
        title={taskDisplayName}
        description={`Detalls de la tasca amb ID ${taskData.id}.`}
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/tasks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Tasques
            </Link>
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Informació de la Tasca</CardTitle>
            <CardDescription>Dades completes de la tasca.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID Tasca</h3>
              <p className="text-lg font-mono">{taskData.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Títol</h3>
              <p className="text-lg">{taskData.title}</p>
            </div>
             {taskData.description && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Descripció</h3>
                <p className="text-base whitespace-pre-wrap">{taskData.description}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Sol·licitud Associada</h3>
              <Link href={`/requests/${taskData.requestId}`} className="text-lg text-primary hover:underline">
                {requestSummary} (ID: {taskData.requestId})
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Estat</h3>
              <Badge variant={getStatusVariant(taskData.status)} className={`text-base ${getStatusColorClass(taskData.status)}`}>
                {formatStatusForDisplay(taskData.status)}
              </Badge>
            </div>
            
            <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Assignació</h3>
                    {canManageTaskDetails && (
                      <Button variant="outline" size="sm" onClick={handleOpenAssignDialog}>
                          <Users2 className="mr-2 h-4 w-4" />
                          Editar Assignació
                      </Button>
                    )}
                </div>
                <Card className="bg-muted/30 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Departament Assignat</p>
                            <p className="text-base">{taskData.assigneeDepartment}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Usuari Assignat Específic</p>
                            <p className="text-base">{assignedUserName}</p>
                        </div>
                    </div>
                </Card>
            </div>


             <div>
              <h3 className="text-sm font-medium text-muted-foreground">Ordre (dins la Checklist)</h3>
              <p className="text-lg">{taskData.order || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Plantilla Checklist Origen</h3>
              <p className="text-base">{checklistTemplateName}</p>
            </div>
            {taskData.taskTemplateId && (
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Plantilla Tasca Origen</h3>
                    <p className="text-base">{taskTemplateOriginTitle}</p>
                </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Data de Creació</h3>
              <p className="text-lg">{format(new Date(taskData.createdAt), "P p", { locale: ca })}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Darrera Actualització</h3>
              <p className="text-lg">{format(new Date(taskData.updatedAt), "P p", { locale: ca })}</p>
            </div>
            
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Venciment</h3>
                {isEditingDueDate ? (
                  canManageTaskDetails ? (
                    <Popover open={isEditingDueDate} onOpenChange={setIsEditingDueDate}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDueDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {selectedDueDate ? format(selectedDueDate, "PPP", { locale: ca}) : <span>Selecciona una data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDueDate}
                            onSelect={setSelectedDueDate}
                            initialFocus
                            locale={ca}
                        />
                        <div className="p-2 border-t flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedDueDate(undefined); handleSaveDueDate(); }}>Netejar</Button>
                            <Button variant="outline" size="sm" onClick={handleToggleEditDueDate}>Cancel·lar</Button>
                            <Button size="sm" onClick={handleSaveDueDate}>Guardar Data</Button>
                        </div>
                        </PopoverContent>
                    </Popover>
                    ) : (
                       <p className={`text-lg ${taskData.dueDate && new Date(taskData.dueDate) < new Date() && taskData.status !== 'completed' ? 'text-destructive font-semibold' : ''}`}>
                          {taskData.dueDate ? format(new Date(taskData.dueDate), "P", { locale: ca }) : "N/A"}
                       </p>
                    )
                ) : (
                    <div className="flex items-center gap-2">
                        <p className={`text-lg ${taskData.dueDate && new Date(taskData.dueDate) < new Date() && taskData.status !== 'completed' ? 'text-destructive font-semibold' : ''}`}>
                            {taskData.dueDate ? format(new Date(taskData.dueDate), "P", { locale: ca }) : "N/A"}
                        </p>
                        {canManageTaskDetails && (
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={handleToggleEditDueDate}>
                              <Edit className="mr-1 h-3 w-3" />
                              {taskData.dueDate ? "Editar" : "Establir"}
                          </Button>
                        )}
                    </div>
                )}
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-md font-semibold mb-2">Observacions</h3>
            {isEditingObservations ? (
              <div className="space-y-3">
                <Textarea
                  value={observationsInput}
                  onChange={(e) => setObservationsInput(e.target.value)}
                  placeholder="Afegeix les teves observacions aquí..."
                  rows={4}
                  className="text-base"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleCancelEditObservations} size="sm">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel·lar
                  </Button>
                  <Button onClick={handleSaveObservations} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Observacions
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="bg-muted/50 p-4 min-h-[80px]">
                {taskData.observations ? (
                  <p className="text-base whitespace-pre-wrap">{taskData.observations}</p>
                ) : (
                  <p className="text-muted-foreground italic">No hi ha observacions registrades.</p>
                )}
                 <Button variant="link" className="p-0 h-auto mt-2 text-sm" onClick={handleEditObservations}>
                    <Edit className="mr-1 h-3 w-3" />
                    {taskData.observations ? "Editar Observacions" : "Afegir Observacions"}
                 </Button>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {isAssignDialogVisible && canManageTaskDetails && (
        <AlertDialog open={isAssignDialogVisible} onOpenChange={setIsAssignDialogVisible}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Editar Assignació de la Tasca</AlertDialogTitle>
              <AlertDialogDescription>
                Selecciona el nou departament i, opcionalment, un usuari específic per a la tasca "{taskData?.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="assign-department">Departament</Label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger id="assign-department">
                    <SelectValue placeholder="Selecciona un departament" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleDepartments.map((dept: Department) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assign-user">Usuari Específic (Opcional)</Label>
                <Select
                  value={selectedAssigneeId}
                  onValueChange={(value) => setSelectedAssigneeId(value === "NONE" ? undefined : value)}
                >
                  <SelectTrigger id="assign-user">
                    <SelectValue placeholder="Selecciona un usuari (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-- Cap usuari específic --</SelectItem>
                    {sampleAppUsers.map((user: User) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.samAccountName} ({user.departments?.join(', ') || 'N/A'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveAssignment}>Guardar Assignació</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

    

    

