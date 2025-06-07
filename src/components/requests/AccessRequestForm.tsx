
"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sampleEmployees, sampleRequests, sampleChecklistTemplates, sampleTasks, sampleRequestTypeDefinitions, sampleSystems, sampleAccessLevels, sampleNotifications, sampleApprovals, sampleAppUsers } from "@/lib/sample-data";
import type { Employee, Task, RequestTypeDefinition, NotificationItem, System as SystemType, Approval, Request as RequestType } from "@/types";
import { AiAccessRecommender } from '@/components/access/AiAccessRecommender';
import { PlusCircle, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateMockId } from "@/lib/id-generator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { ROLES } from '@/lib/constants';


const requestedAccessItemSchema = z.object({
  system: z.string().min(1, { message: "El sistema és requerit." }),
  accessLevel: z.string().min(1, { message: "El nivell d'accés és requerit." }),
  justification: z.string().min(10, { message: "La justificació ha de tenir almenys 10 caràcters." }),
});

const accessRequestSchema = z.object({
  targetEmployeeId: z.string().min(1, { message: "L'empleat és requerit." }),
  requestTypeDefinitionId: z.string().min(1, { message: "S'ha de seleccionar un tipus de sol·licitud d'accés." }),
  requestedAccesses: z.array(requestedAccessItemSchema)
    .min(1, "S'ha de sol·licitar accés a almenys un sistema.")
    .max(5, "No es poden sol·licitar més de 5 sistemes a la vegada."),
});

type AccessRequestFormValues = z.infer<typeof accessRequestSchema>;

export function AccessRequestForm() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth(); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeComboboxOpen, setIsEmployeeComboboxOpen] = useState(false);

  const form = useForm<AccessRequestFormValues>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      targetEmployeeId: "",
      requestTypeDefinitionId: "",
      requestedAccesses: [{ system: "", accessLevel: "", justification: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "requestedAccesses",
  });

  const targetEmployeeIdValue = form.watch("targetEmployeeId");

  useEffect(() => {
    if (targetEmployeeIdValue) {
      const employee = sampleEmployees.find(emp => emp.id === targetEmployeeIdValue);
      setSelectedEmployee(employee || null);
    } else {
      setSelectedEmployee(null);
    }
  }, [targetEmployeeIdValue]);

  const availableAccessRequestTypes: RequestTypeDefinition[] = sampleRequestTypeDefinitions.filter(
    rt => rt.appliesTo === 'access' && rt.isEnabled
  );
  
  const activeEmployees = sampleEmployees.filter(e => e.status === 'active');


  async function onSubmit(data: AccessRequestFormValues) {
    setIsLoading(true);
    if (!currentUser) {
        toast({ title: "Error", description: "No s'ha pogut identificar l'usuari sol·licitant.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    console.log("Access request form data:", data);
    
    const selectedRequestTypeDefinition = sampleRequestTypeDefinitions.find(rt => rt.id === data.requestTypeDefinitionId);

    if (!selectedRequestTypeDefinition) {
      toast({
        title: "Error",
        description: "No s'ha trobat el tipus de sol·licitud seleccionat.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const newRequestId = generateMockId("req_acc");
    const currentSelectedEmployee = sampleEmployees.find(e => e.id === data.targetEmployeeId);
    const now = new Date().toISOString();
    let requestStatus: RequestType['status'] = "pending";
    let needsOverallApproval = false;
    let multiSystemApprovalNote: string | undefined = undefined;
    
    const approvalRequirements = new Set<string>();
    let firstApproverId: string | undefined = "user_005"; // Default a Manager IT (David Mas)

    data.requestedAccesses.forEach(accessItem => {
        const systemDetails = sampleSystems.find(s => s.name === accessItem.system);
        if (systemDetails && systemDetails.requiresApprovalBy) {
            needsOverallApproval = true;
            approvalRequirements.add(systemDetails.requiresApprovalBy);

            // Lògica per determinar l'aprovador (simplificada)
            if (systemDetails.requiresApprovalBy.startsWith("Rol:")) {
                const roleToFind = systemDetails.requiresApprovalBy.substring(5); // Treu "Rol: "
                const approverUser = sampleAppUsers.find(u => u.roles.includes(roleToFind) && u.departments?.includes("Informàtica")); // Prioritza IT per ara
                if (approverUser) firstApproverId = approverUser.id;
                else { // Fallback si no es troba un usuari IT amb aquest rol, assigna a un Manager IT per defecte
                    const managerIT = sampleAppUsers.find(u => u.roles.includes(ROLES.IT) && u.roles.includes(ROLES.MANAGER));
                    firstApproverId = managerIT?.id || "user_005";
                }
            } else if (systemDetails.requiresApprovalBy.startsWith("Usuari:")) {
                 const userNameToFind = systemDetails.requiresApprovalBy.substring(8); // Treu "Usuari: "
                 const approverUser = sampleAppUsers.find(u => (u.name === userNameToFind || u.samAccountName === userNameToFind));
                 if (approverUser) firstApproverId = approverUser.id;
            }
        }
    });

    if (approvalRequirements.size > 1) {
        multiSystemApprovalNote = "Aquesta sol·licitud inclou sistemes amb diferents requisits d'aprovació que han de ser revisats pel responsable designat.";
    }

    const newRequestDetails: RequestType['details'] = { 
      requestedAccesses: data.requestedAccesses 
    };
    if (multiSystemApprovalNote) {
      newRequestDetails.multiSystemApprovalNote = multiSystemApprovalNote;
    }

    if (needsOverallApproval) {
        requestStatus = "pendingManagerApproval";
        const newApprovalId = generateMockId("appr_acc_multi");
        const newApproval: Approval = {
            id: newApprovalId,
            requestId: newRequestId,
            approverId: firstApproverId!, 
            status: "pending",
            createdAt: now,
            updatedAt: now,
            comments: multiSystemApprovalNote ? `Nota: ${multiSystemApprovalNote}` : undefined,
        };
        sampleApprovals.push(newApproval);
        console.log("Generated approval for access request:", newApproval);

        const approverForNotification = sampleAppUsers.find(u => u.id === firstApproverId);
        const approvalNotificationId = generateMockId("notif_appr_pend");
        const approvalNotification: NotificationItem = {
            id: approvalNotificationId,
            title: "Aprovació Requerida",
            description: `La sol·licitud d'accés "${newRequestId}" per a ${currentSelectedEmployee?.fullName} requereix la teva aprovació. ${multiSystemApprovalNote || ''}`.trim(),
            createdAt: now,
            read: false,
            href: `/approvals` 
        };
        if (approverForNotification) { // Simula enviar només a l'aprovador
            sampleNotifications.unshift(approvalNotification);
        } else { // Si no es troba, la deixa global (per a la demo)
            sampleNotifications.unshift(approvalNotification);
        }
    }

    const newRequest: RequestType = {
      id: newRequestId,
      type: 'access', 
      targetEmployeeId: data.targetEmployeeId,
      requesterId: currentUser.id, 
      status: requestStatus,
      createdAt: now,
      updatedAt: now,
      summary: `${selectedRequestTypeDefinition.name} per a ${currentSelectedEmployee?.fullName || 'l\'empleat seleccionat'} (${data.requestedAccesses.length} sistema/es)`,
      details: newRequestDetails,
      requestTypeDefinitionId: selectedRequestTypeDefinition.id,
      assignedDepartment: "Informàtica" 
    };
    sampleRequests.push(newRequest);
    console.log("Simulated new access request:", newRequest);

    let toastDescription = `S'ha creat la sol·licitud "${selectedRequestTypeDefinition.name}" per a ${currentSelectedEmployee?.fullName || 'l\'empleat seleccionat'} (ID: ${newRequestId}).`;
    if (needsOverallApproval) {
        toastDescription += " La sol·licitud està pendent d'aprovació.";
        if (multiSystemApprovalNote) {
            toastDescription += " Nota: Múltiples requisits d'aprovació.";
        }
    }

    const checklist = sampleChecklistTemplates.find(
      (cl) => cl.id === selectedRequestTypeDefinition.checklistTemplateId
    );

    if (checklist) {
      checklist.taskTemplates.forEach((template) => {
        const newTaskId = generateMockId("task_acc");
        const newTask: Task = {
          id: newTaskId,
          requestId: newRequestId,
          checklistTemplateId: checklist.id,
          taskTemplateId: template.id,
          title: `${template.title} (Sol: ${newRequestId}) per a ${currentSelectedEmployee?.fullName}`,
          description: template.description,
          assigneeDepartment: template.assigneeDepartment,
          status: "pending",
          createdAt: now,
          updatedAt: now,
          order: template.order,
        };
        sampleTasks.push(newTask);
      });
      toastDescription += " Les tasques associades s'han generat.";
      console.log("Generated tasks for access request:", sampleTasks.filter(t => t.requestId === newRequestId));
    } else {
      console.warn(`Checklist template with ID ${selectedRequestTypeDefinition.checklistTemplateId} not found.`);
      toastDescription += " No s'ha trobat la plantilla de checklist associada; no s'han generat tasques.";
    }
    
    const newAccessNotificationId = generateMockId("notif_acc_create");
    const newAccessNotification: NotificationItem = {
        id: newAccessNotificationId,
        title: "Nova Sol·licitud d'Accés Creada",
        description: `S'ha creat una sol·licitud d'accés (${selectedRequestTypeDefinition.name}) per a ${currentSelectedEmployee?.fullName || 'l\'empleat seleccionat'} (Sol·licitud: ${newRequestId}). ${needsOverallApproval ? 'Pendent d\'aprovació.' : ''}`.trim(),
        createdAt: now,
        read: false,
        href: `/requests/${newRequestId}`
    };
    sampleNotifications.unshift(newAccessNotification);
    console.log("New access request creation notification generated:", newAccessNotification);
    
    toast({
      title: "Sol·licitud d'Accés Creada",
      description: toastDescription,
      duration: needsOverallApproval ? 7000 : 5000,
    });
    setIsLoading(false);
    form.reset({
        targetEmployeeId: "",
        requestTypeDefinitionId: "",
        requestedAccesses: [{ system: "", accessLevel: "", justification: "" }],
    }); 
    setSelectedEmployee(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="targetEmployeeId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Empleat</FormLabel>
              <Popover open={isEmployeeComboboxOpen} onOpenChange={setIsEmployeeComboboxOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? activeEmployees.find(
                            (employee) => employee.id === field.value
                          )?.fullName
                        : "Selecciona un empleat"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                  <Command>
                    <CommandInput placeholder="Cerca empleat..." />
                    <CommandList>
                      <CommandEmpty>No s'ha trobat cap empleat.</CommandEmpty>
                      <CommandGroup>
                        {activeEmployees.map((employee) => (
                          <CommandItem
                            value={employee.fullName}
                            key={employee.id}
                            onSelect={() => {
                              form.setValue("targetEmployeeId", employee.id);
                              setIsEmployeeComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                employee.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {employee.fullName} ({employee.department} - {employee.role})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requestTypeDefinitionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipus de Sol·licitud d'Accés</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipus de sol·licitud d'accés" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableAccessRequestTypes.length > 0 ? (
                    availableAccessRequestTypes.map(rt => (
                      <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                    ))
                  ) : (
                     <SelectItem value="" disabled>No hi ha tipus de sol·licitud d'accés disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Defineix el procés i la plantilla de checklist que s'aplicarà.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Sistemes Sol·licitats</CardTitle>
                <CardDescription>Afegeix els sistemes als quals l'empleat necessita accés (màxim 5 per sol·licitud).</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ system: "", accessLevel: "", justification: "" })}
                disabled={fields.length >= 5}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Afegir Sistema
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {fields.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Sistema</TableHead>
                      <TableHead className="min-w-[200px]">Nivell d'Accés</TableHead>
                      <TableHead className="min-w-[250px]">Justificació</TableHead>
                      <TableHead className="text-right w-[50px]">Accions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="pt-2 pb-4 align-top">
                          <FormField
                            control={form.control}
                            name={`requestedAccesses.${index}.system`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">Sistema Sol·licitat #{index + 1}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona un sistema" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {sampleSystems.map((system) => (
                                      <SelectItem key={system.id} value={system.name}>{system.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="pt-2 pb-4 align-top">
                          <FormField
                            control={form.control}
                            name={`requestedAccesses.${index}.accessLevel`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">Nivell d'Accés Sol·licitat #{index + 1}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona un nivell" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {sampleAccessLevels.map((level) => (
                                      <SelectItem key={level.id} value={level.name}>{level.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="pt-2 pb-4 align-top">
                          <FormField
                            control={form.control}
                            name={`requestedAccesses.${index}.justification`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">Justificació #{index + 1}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Justificació..."
                                    {...field}
                                    rows={2} 
                                    className="min-h-[calc(2.5rem+2px)]" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right pt-2 pb-4 align-top">
                           {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                              onClick={() => remove(index)}
                              title="Eliminar sistema"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar sistema</span>
                            </Button>
                           )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {form.formState.errors.requestedAccesses && !form.formState.errors.requestedAccesses.root?.message && (
                <FormMessage>{form.formState.errors.requestedAccesses.message}</FormMessage>
            )}
            {form.formState.errors.requestedAccesses?.root && (
                 <FormMessage>{form.formState.errors.requestedAccesses.root.message}</FormMessage>
            )}
             {fields.length >= 5 && <p className="text-sm text-muted-foreground text-center mt-2">Has arribat al límit de 5 sistemes per sol·licitud.</p>}
          </CardContent>
        </Card>

        {selectedEmployee && (
            <AiAccessRecommender 
                initialRole={selectedEmployee.role}
                initialDepartment={selectedEmployee.department}
                onRecommendations={(recs) => {
                    console.log("AI Recommendations received:", recs);
                    toast({ title: "Recomanacions IA Rebudes", description: "Pots utilitzar aquestes recomanacions per omplir una de les sol·licituds de sistema."})
                }}
            />
        )}

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading || !selectedEmployee}>
          {isLoading ? "Processant..." : "Crear Sol·licitud d'Accés"}
        </Button>
      </form>
    </Form>
  );
}
