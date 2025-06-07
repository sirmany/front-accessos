
"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { sampleEmployees, sampleRequests, sampleChecklistTemplates, sampleTasks, sampleRequestTypeDefinitions, sampleNotifications } from "@/lib/sample-data";
import type { Employee, Task, RequestTypeDefinition, NotificationItem, Request as RequestType, RequestedAccessItem } from "@/types";
import { useAuth } from '@/context/AuthContext';
import { generateMockId } from "@/lib/id-generator";
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

const offboardingRequestSchema = z.object({
  targetEmployeeId: z.string().min(1, { message: "L'empleat és requerit." }),
  requestTypeDefinitionId: z.string().min(1, { message: "S'ha de seleccionar un tipus de sol·licitud de baixa." }),
  lastDay: z.date({ required_error: "La data de l'últim dia és requerida." }),
  reason: z.string().min(10, { message: "El motiu ha de tenir almenys 10 caràcters." }),
});

type OffboardingRequestFormValues = z.infer<typeof offboardingRequestSchema>;

export function OffboardingRequestForm() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeComboboxOpen, setIsEmployeeComboboxOpen] = useState(false);

  const form = useForm<OffboardingRequestFormValues>({
    resolver: zodResolver(offboardingRequestSchema),
    defaultValues: {
      targetEmployeeId: "",
      requestTypeDefinitionId: "",
      reason: "",
    },
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

  const availableOffboardingRequestTypes: RequestTypeDefinition[] = sampleRequestTypeDefinitions.filter(
    rt => rt.appliesTo === 'offboarding' && rt.isEnabled
  );

  const activeEmployees = sampleEmployees.filter(emp => emp.status === 'active');

  async function onSubmit(data: OffboardingRequestFormValues) {
    setIsLoading(true);
    console.log("Offboarding request form data:", data);

    if (!currentUser) {
        toast({ title: "Error", description: "No s'ha pogut identificar l'usuari sol·licitant.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    
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

    const employeeToOffboard = sampleEmployees.find(emp => emp.id === data.targetEmployeeId);
    if (!employeeToOffboard) {
        toast({ title: "Error", description: "No s'ha pogut trobar l'empleat seleccionat.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const newRequestId = generateMockId("req_off");
    const newRequestSummary = `${selectedRequestTypeDefinition.name} per a ${employeeToOffboard.fullName}`;
    const now = new Date().toISOString();
    const lastDayIso = data.lastDay.toISOString();
    
    const newRequest: RequestType = {
      id: newRequestId,
      type: 'offboarding' as 'offboarding', 
      employeeId: data.targetEmployeeId, 
      requesterId: currentUser.id, 
      status: "pending" as 'pending',
      createdAt: now,
      updatedAt: now,
      summary: newRequestSummary,
      details: { 
        lastDay: lastDayIso,
        reason: data.reason,
        employeeFullName: employeeToOffboard.fullName, 
      },
      requestTypeDefinitionId: selectedRequestTypeDefinition.id,
      assignedDepartment: "Recursos Humans" 
    };
    sampleRequests.push(newRequest);
    console.log("Simulated new offboarding request:", newRequest);

    let toastDescription = `S'ha creat la sol·licitud "${newRequestSummary}" (ID: ${newRequestId}).`;

    const employeeIndex = sampleEmployees.findIndex(emp => emp.id === data.targetEmployeeId);
    if (employeeIndex !== -1) {
        sampleEmployees[employeeIndex].status = 'inactive'; 
        sampleEmployees[employeeIndex].offboardingRequestId = newRequestId;
        console.log(`Employee ${sampleEmployees[employeeIndex].fullName} status set to inactive.`);
    }

    const checklist = sampleChecklistTemplates.find(
      (cl) => cl.id === selectedRequestTypeDefinition.checklistTemplateId
    );

    let lastOrderFromTemplate = 0;
    if (checklist) {
      checklist.taskTemplates.forEach((template, index) => {
        const newTaskId = generateMockId("task_off_tpl");
        lastOrderFromTemplate = template.order || (index + 1);
        const newTask: Task = {
          id: newTaskId,
          requestId: newRequestId,
          checklistTemplateId: checklist.id,
          taskTemplateId: template.id,
          title: `${template.title} (Sol: ${newRequestId}) per a ${employeeToOffboard.fullName}`,
          description: template.description,
          assigneeDepartment: template.assigneeDepartment,
          status: "pending",
          createdAt: now,
          updatedAt: now,
          order: lastOrderFromTemplate,
          visibleFromDate: lastDayIso, 
          dueDate: lastDayIso, 
        };
        sampleTasks.push(newTask);
      });
      toastDescription += " Les tasques de la plantilla s'han generat.";
      console.log("Generated tasks from template for offboarding:", sampleTasks.filter(t => t.requestId === newRequestId && t.checklistTemplateId === checklist.id));
    } else {
      console.warn(`Checklist template with ID ${selectedRequestTypeDefinition.checklistTemplateId} not found.`);
      toastDescription += " No s'ha trobat la plantilla de checklist associada.";
    }

    // Generar tasques de revocació d'accessos existents
    const existingAccesses = sampleRequests.filter(
        req => req.targetEmployeeId === employeeToOffboard.id &&
               req.type === 'access' &&
               (req.status === 'completed' || req.status === 'approved')
    );
    
    const systemsToRevoke = new Set<string>();
    existingAccesses.forEach(accessReq => {
        if (accessReq.details?.requestedAccesses && Array.isArray(accessReq.details.requestedAccesses)) {
            accessReq.details.requestedAccesses.forEach((item: RequestedAccessItem) => {
                systemsToRevoke.add(item.system);
            });
        }
    });

    let revocationTaskOrder = lastOrderFromTemplate;
    if (systemsToRevoke.size > 0) {
        systemsToRevoke.forEach(systemName => {
            revocationTaskOrder++;
            const revocationTaskId = generateMockId("task_off_revk");
            const revocationTask: Task = {
                id: revocationTaskId,
                requestId: newRequestId,
                title: `Revocar accés a "${systemName}" per a ${employeeToOffboard.fullName}`,
                description: `Revocar tots els permisos i accessos concedits prèviament al sistema ${systemName} per a l'empleat ${employeeToOffboard.fullName} en procés de baixa.`,
                assigneeDepartment: "Informàtica",
                status: "pending",
                createdAt: now,
                updatedAt: now,
                visibleFromDate: lastDayIso,
                dueDate: lastDayIso,
                order: revocationTaskOrder,
            };
            sampleTasks.push(revocationTask);
        });
        toastDescription += ` S'han generat ${systemsToRevoke.size} tasques de revocació d'accessos.`;
        console.log("Generated access revocation tasks:", sampleTasks.filter(t => t.requestId === newRequestId && t.id.startsWith("TASK_OFF_REVK")));
    }
    
    const newOffboardingNotificationId = generateMockId("notif_off");
    const newOffboardingNotification: NotificationItem = {
        id: newOffboardingNotificationId,
        title: "Nova Sol·licitud de Baixa Creada",
        description: `S'ha creat una sol·licitud de baixa (${selectedRequestTypeDefinition.name}) per a ${employeeToOffboard.fullName} (Sol·licitud: ${newRequestId}). L'empleat ha estat marcat com a inactiu.`,
        createdAt: now,
        read: false,
        href: `/requests/${newRequestId}`
    };
    sampleNotifications.unshift(newOffboardingNotification);
    console.log("New offboarding request notification generated:", newOffboardingNotification);
    
    toast({
      title: "Sol·licitud de Baixa Creada",
      description: toastDescription,
      duration: 7000, 
    });
    setIsLoading(false);
    form.reset({
        targetEmployeeId: "",
        requestTypeDefinitionId: "",
        lastDay: undefined,
        reason: "",
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
              <FormLabel>Empleat a Donar de Baixa</FormLabel>
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
                        : "Selecciona un empleat actiu"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                  <Command>
                    <CommandInput placeholder="Cerca empleat..." />
                    <CommandList>
                      <CommandEmpty>No s'ha trobat cap empleat actiu.</CommandEmpty>
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
              <FormLabel>Tipus de Sol·licitud de Baixa</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipus de sol·licitud de baixa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableOffboardingRequestTypes.length > 0 ? (
                    availableOffboardingRequestTypes.map(rt => (
                      <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                    ))
                  ) : (
                     <SelectItem value="" disabled>No hi ha tipus de sol·licitud de baixa disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Defineix el procés i la plantilla de checklist que s'aplicarà.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastDay"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de l'Últim Dia Laborable</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ca })
                      ) : (
                        <span>Selecciona una data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1 ))} 
                    initialFocus
                    locale={ca}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motiu de la Baixa</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descriu el motiu de la baixa de l'empleat..."
                  className="resize-none"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full md:w-auto" disabled={isLoading || !selectedEmployee}>
          {isLoading ? "Processant..." : "Crear Sol·licitud de Baixa"}
        </Button>
      </form>
    </Form>
  );
}

    
