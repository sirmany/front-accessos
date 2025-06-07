
"use client"; 

import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Task, NotificationItem, Request as RequestType, TaskStatus, RequestTypeDefinition } from "@/types"; 
import { sampleTasks, sampleRequests, sampleNotifications, sampleRequestTypeDefinitions } from "@/lib/sample-data"; 
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronLeft, ChevronRight, Eye, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { generateMockId } from '@/lib/id-generator';
import { useAuth } from '@/context/AuthContext'; // Importat
import { ROLES } from '@/lib/constants'; // Importat

const ITEMS_PER_PAGE = 10;

const getRequestSummary = (requestId: string): string => {
  const request = sampleRequests.find(r => r.id === requestId);
  return request?.summary || "N/A";
}

const getStatusVariant = (status: Task["status"]): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "completed":
      return "default"; 
    case "inProgress":
      return "secondary"; 
    case "pending":
    default:
      return "secondary"; 
  }
};

const getStatusColorClass = (status: Task["status"]): string => {
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

// Helper to format status for display
const formatStatusForDisplay = (status: TaskStatus): string => {
  const statusMap: Record<TaskStatus, string> = {
    pending: "Pendent",
    inProgress: "En Curs",
    completed: "Completada",
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};


export default function TasksPage() {
  const { user: currentUser } = useAuth(); // Obtenir usuari
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setAllTasks([...sampleTasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); 
  }, []); 

  const visibleTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    return allTasks.filter(task => {
      if (!task.visibleFromDate) {
        return true; 
      }
      const visibleDate = new Date(task.visibleFromDate);
      visibleDate.setHours(0, 0, 0, 0);
      return visibleDate <= today;
    });
  }, [allTasks]);


  const totalPages = Math.ceil(visibleTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTasks = visibleTasks.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleCompleteTask = (taskId: string) => {
    const now = new Date().toISOString();
    const globalTaskIndex = sampleTasks.findIndex(t => t.id === taskId);

    if (globalTaskIndex !== -1) {
      const completedTask = sampleTasks[globalTaskIndex];
      if (completedTask.status === 'completed') {
        toast({ title: "Tasca Ja Completada", description: `La tasca "${completedTask.title}" ja estava marcada com a completada.`});
        return;
      }
      completedTask.status = "completed";
      completedTask.updatedAt = now;
      
      setAllTasks([...sampleTasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); 
      
      toast({
        title: "Tasca Completada",
        description: `La tasca "${completedTask.title}" s'ha marcat com a completada.`,
      });

      const newNotificationTask: NotificationItem = {
        id: generateMockId("notif_task_comp"),
        title: "Tasca Completada",
        description: `La tasca "${completedTask.title}" (ID: ${completedTask.id}) ha estat completada.`,
        createdAt: now,
        read: false,
        href: `/tasks/${completedTask.id}` 
      };
      sampleNotifications.unshift(newNotificationTask);

      const relatedRequestIndex = sampleRequests.findIndex(r => r.id === completedTask.requestId);
      if (relatedRequestIndex !== -1) {
        const relatedRequest = sampleRequests[relatedRequestIndex];
        const requestTypeDefinition = sampleRequestTypeDefinitions.find(rt => rt.id === relatedRequest.requestTypeDefinitionId);
        const allTasksForRequest = sampleTasks.filter(t => t.requestId === relatedRequest.id);
        
        let allITTasksCompletedForSpecificFlow = false;
        if (relatedRequest.type === 'access' && requestTypeDefinition?.id === 'access_hr_validation') {
           allITTasksCompletedForSpecificFlow = allTasksForRequest
            .filter(t => t.assigneeDepartment === 'IT')
            .every(t => t.status === 'completed');
        }
        
        if (allITTasksCompletedForSpecificFlow) {
          const pendingHRTasksExist = allTasksForRequest
            .filter(t => t.assigneeDepartment === 'RRHH')
            .some(t => t.status === 'pending');
          
          if (pendingHRTasksExist && relatedRequest.status !== 'pendingFinalValidation') {
            relatedRequest.status = 'pendingFinalValidation';
            relatedRequest.assignedDepartment = 'Recursos Humans';
            relatedRequest.updatedAt = now;
            toast({
              title: "Sol·licitud Pendent de Validació Final",
              description: `Totes les tasques d'IT per a "${relatedRequest.summary}" completades. Pendent de validació per RRHH.`,
            });
            const newNotificationITtoHRValidation: NotificationItem = {
              id: generateMockId("notif_val_hr"),
              title: "Sol·licitud Requereix Validació Final",
              description: `La sol·licitud d'accés "${relatedRequest.summary}" (ID: ${relatedRequest.id}) està pendent de la teva validació final.`,
              createdAt: now,
              read: false,
              href: `/requests/${relatedRequest.id}`
            };
            sampleNotifications.unshift(newNotificationITtoHRValidation);
          }
        } else if (completedTask.assigneeDepartment === 'IT' && relatedRequest.status === 'pendingITProcessing') {
          const allITTasksCompleted = allTasksForRequest
            .filter(t => t.assigneeDepartment === 'IT')
            .every(t => t.status === 'completed');
          
          if (allITTasksCompleted) {
            const pendingHRTasksExist = allTasksForRequest
              .filter(t => t.assigneeDepartment === 'RRHH')
              .some(t => t.status === 'pending');
            
            if (pendingHRTasksExist && relatedRequest.status !== 'pendingHRProcessing' && (relatedRequest.type === 'onboarding')) {
              relatedRequest.status = 'pendingHRProcessing';
              relatedRequest.assignedDepartment = 'Recursos Humans';
              relatedRequest.updatedAt = now;
              toast({
                title: "Sol·licitud Actualitzada",
                description: `Totes les tasques d'IT per a "${relatedRequest.summary}" completades. Pendent de RRHH.`,
              });
              const newNotificationITtoHR: NotificationItem = {
                id: generateMockId("notif_it_hr"),
                title: "Procés d'Onboarding Avança",
                description: `Sol·licitud "${relatedRequest.summary}" (ID: ${relatedRequest.id}) ara està pendent de RRHH.`,
                createdAt: now,
                read: false,
                href: `/requests/${relatedRequest.id}`
              };
              sampleNotifications.unshift(newNotificationITtoHR);
            }
          }
        }
        
        if (relatedRequest.status !== 'completed' && relatedRequest.status !== 'pendingHRProcessing' && relatedRequest.status !== 'pendingFinalValidation') { 
            const allTasksTrulyCompleted = allTasksForRequest.every(t => t.status === "completed");
            if (allTasksTrulyCompleted) {
                relatedRequest.status = "completed";
                relatedRequest.updatedAt = now;

                toast({
                    title: "Sol·licitud Completada Automàticament",
                    description: `La sol·licitud "${relatedRequest.summary}" (ID: ${relatedRequest.id}) s'ha completat.`,
                });

                const newNotificationRequestComplete: NotificationItem = {
                    id: generateMockId("notif_req_comp"),
                    title: "Sol·licitud Completada",
                    description: `La sol·licitud "${relatedRequest.summary}" (ID: ${relatedRequest.id}) s'ha completat.`,
                    createdAt: now,
                    read: false,
                    href: `/requests/${relatedRequest.id}`
                };
                sampleNotifications.unshift(newNotificationRequestComplete);
            }
        }
      }
      console.log("Notificacions actuals:", sampleNotifications);

    } else {
      toast({
        title: "Error",
        description: "No s'ha pogut trobar la tasca per completar.",
        variant: "destructive",
      });
    }
  };
  
  const refreshTasks = () => {
    setAllTasks([...sampleTasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setCurrentPage(1); 
    console.log("Tasks refreshed, current count:", sampleTasks.length);
  };


  return (
    <>
      <PageHeader 
        title="Les Meves Tasques"
        description="Aquí apareixeran totes les tasques que tens assignades o que s'han generat i són visibles."
      >
        <Button onClick={refreshTasks} variant="outline" size="sm">Refrescar Tasques (Demo)</Button>
      </PageHeader>

      {allTasks.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No hi ha tasques generades o assignades de moment.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crea una nova sol·licitud d'alta o d'accés per generar tasques automàticament.
            </p>
          </CardContent>
        </Card>
      ) : currentTasks.length === 0 && allTasks.length > 0 ? (
        <Card className="shadow-lg">
           <CardContent className="pt-6 text-center">
             <p className="text-muted-foreground">No hi ha tasques visibles en aquesta pàgina o amb els filtres actuals.</p>
             <p className="text-sm text-muted-foreground mt-2">
               Algunes tasques poden estar programades per a una data futura.
             </p>
           </CardContent>
         </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableCaption>
                Llista de tasques generades i visibles. Mostrant {currentTasks.length} de {visibleTasks.length} tasques visibles (Total: {allTasks.length}).
                Clica a "Refrescar Tasques" si has generat noves tasques. Algunes tasques poden estar programades per a més endavant.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2 px-4">Títol de la Tasca</TableHead>
                  <TableHead className="py-2 px-4">Sol·licitud Associada</TableHead>
                  <TableHead className="py-2 px-4">Departament Assignat</TableHead>
                  <TableHead className="py-2 px-4">Estat</TableHead>
                  <TableHead className="py-2 px-4">Data Venciment</TableHead>
                  <TableHead className="py-2 px-4">Data Visibilitat</TableHead>
                  <TableHead className="text-right py-2 px-4">Accions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTasks.map((task) => {
                  const canCompleteThisTask = currentUser?.roles.includes(ROLES.ADMIN) || 
                                              (currentUser?.departments && currentUser.departments.includes(task.assigneeDepartment));
                  return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium py-2 px-4">
                      <Link href={`/tasks/${task.id}`} className="hover:underline text-primary">
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      <Link href={`/requests/${task.requestId}`} className="hover:underline text-primary">
                        {getRequestSummary(task.requestId)} ({task.requestId})
                      </Link>
                    </TableCell>
                    <TableCell className="py-2 px-4">{task.assigneeDepartment}</TableCell>
                    <TableCell className="py-2 px-4">
                      <Badge variant={getStatusVariant(task.status)} className={`${getStatusColorClass(task.status)} text-xs`}>
                        {formatStatusForDisplay(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      {task.dueDate ? (
                        <span className={new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-destructive font-semibold' : ''}>
                          <CalendarClock className="inline-block mr-1 h-3 w-3" />
                          {format(new Date(task.dueDate), "P", { locale: ca })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                     <TableCell className="py-2 px-4">
                      {task.visibleFromDate ? (
                        <span>
                          {format(new Date(task.visibleFromDate), "P", { locale: ca })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Immediata</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1 py-2 px-4">
                       <Button variant="ghost" size="icon" asChild title="Veure detalls tasca">
                          <Link href={`/tasks/${task.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      {canCompleteThisTask && task.status !== "completed" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCompleteTask(task.id)}
                          className="px-2 py-1 h-auto text-xs"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Completar
                        </Button>
                      )}
                      {task.status === "completed" && (
                         <Button 
                            variant="outline" 
                            size="sm" 
                            disabled
                            className="border-green-500 text-green-700 px-2 py-1 h-auto text-xs"
                          >
                            <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                            Completada
                          </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Pàgina {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Següent
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

    
