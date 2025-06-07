
"use client";

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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMPLOYEE_ROLES } from "@/lib/constants";
import { sampleDepartments, sampleChecklistTemplates, sampleTasks, sampleRequests, sampleRequestTypeDefinitions, sampleEmployees, sampleNotifications } from "@/lib/sample-data";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Employee, Task, RequestTypeDefinition, NotificationItem } from "@/types";
import { generateMockId } from "@/lib/id-generator"; // Importat

const employeeSchemaBase = z.object({
  fullName: z.string().min(3, { message: "El nom complet ha de tenir almenys 3 caràcters." }),
  nif: z.string().regex(/^[XYZ\d]\d{7}[A-Z]$|^[A-HJ-NP-SUVW]\d{7}[A-J\d]$/, { message: "Format de NIF/NIE invàlid." }),
  department: z.string().min(1, { message: "El departament és requerit." }),
  role: z.string().min(1, { message: "El rol és requerit." }),
});

const employeeOnboardingSchema = employeeSchemaBase.extend({
  requestTypeDefinitionId: z.string().min(1, { message: "S'ha de seleccionar un tipus de sol·licitud d'alta." }),
});

const employeeEditingSchema = employeeSchemaBase; 

interface EmployeeFormProps {
  employee?: Employee; 
}

export function EmployeeForm({ employee }: EmployeeFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!employee;

  const formSchema = isEditMode ? employeeEditingSchema : employeeOnboardingSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: employee?.fullName || "",
      nif: employee?.nif || "",
      department: employee?.department || "",
      role: employee?.role || "",
      ...(isEditMode ? {} : { requestTypeDefinitionId: "" }),
    },
  });

  const availableOnboardingRequestTypes: RequestTypeDefinition[] = sampleRequestTypeDefinitions.filter(
    rt => rt.appliesTo === 'onboarding' && rt.isEnabled
  );

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log("Employee form data:", data);
    
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    let toastTitle = "";
    let toastDescription = "";

    if (isEditMode && employee) {
      const employeeIndex = sampleEmployees.findIndex(emp => emp.id === employee.id);
      if (employeeIndex !== -1) {
        sampleEmployees[employeeIndex] = {
          ...sampleEmployees[employeeIndex],
          fullName: data.fullName,
          department: data.department,
          role: data.role,
        };
      }
      toastTitle = "Empleat Actualitzat";
      toastDescription = `S'han guardat els canvis per a ${data.fullName}.`;
    } else if (!isEditMode && 'requestTypeDefinitionId' in data) {
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

      const newEmployeeId = generateMockId("emp"); 
      const newEmployee: Employee = {
        id: newEmployeeId,
        fullName: data.fullName,
        nif: data.nif,
        department: data.department,
        role: data.role,
        status: "active",
      };
      
      if (!sampleEmployees.some(e => e.nif === newEmployee.nif)) {
        sampleEmployees.push(newEmployee);
      } else {
        const existingEmp = sampleEmployees.find(e => e.nif === newEmployee.nif);
        if (existingEmp) newEmployee.id = existingEmp.id; // Reutilitza ID si ja existeix amb aquest NIF
      }

      const newRequestId = generateMockId("req_onb");
      const newRequest = {
        id: newRequestId,
        type: 'onboarding' as 'onboarding',
        employeeId: newEmployee.id, 
        requesterId: "user_003", 
        status: "pending" as 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summary: `${selectedRequestTypeDefinition.name}: ${data.fullName}`,
        details: { ...data, employeeId: newEmployee.id }, 
        requestTypeDefinitionId: selectedRequestTypeDefinition.id,
      };
      sampleRequests.push(newRequest as any); 
      console.log("Simulated new onboarding request:", newRequest);

      toastTitle = `Sol·licitud d'Alta Processada`;
      toastDescription = `S'ha creat el registre per a ${data.fullName} (ID Sol: ${newRequestId}, ID Emp: ${newEmployee.id}).`;

      const checklist = sampleChecklistTemplates.find(
        (cl) => cl.id === selectedRequestTypeDefinition.checklistTemplateId
      );

      if (checklist) {
        const now = new Date().toISOString();
        checklist.taskTemplates.forEach((template) => {
          const newTaskId = generateMockId("task_onb");
          const newTask: Task = {
            id: newTaskId,
            requestId: newRequestId,
            checklistTemplateId: checklist.id,
            taskTemplateId: template.id,
            title: `${template.title} per a ${data.fullName}`,
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
        console.log("Generated tasks for onboarding:", sampleTasks.filter(t => t.requestId === newRequestId));
      } else {
        console.warn(`Checklist template with ID ${selectedRequestTypeDefinition.checklistTemplateId} not found.`);
        toastDescription += " No s'ha trobat la plantilla de checklist associada; no s'han generat tasques.";
      }

      const newOnboardingNotificationId = generateMockId("notif_onb");
      const newOnboardingNotification: NotificationItem = {
        id: newOnboardingNotificationId,
        title: "Nova Sol·licitud d'Alta Iniciada",
        description: `S'ha iniciat el procés d'alta per a ${data.fullName} (Sol·licitud: ${newRequestId}).`,
        createdAt: new Date().toISOString(),
        read: false,
        href: `/requests/${newRequestId}`
      };
      sampleNotifications.unshift(newOnboardingNotification);
      console.log("New onboarding notification generated:", newOnboardingNotification);
    }

    toast({
      title: toastTitle,
      description: toastDescription,
    });
    setIsLoading(false);
    if (!isEditMode) form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {!isEditMode && (
          <FormField
            control={form.control}
            name="requestTypeDefinitionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipus de Sol·licitud d'Alta</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipus d'alta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableOnboardingRequestTypes.length > 0 ? (
                      availableOnboardingRequestTypes.map(rt => (
                        <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No hi ha tipus d'alta disponibles</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>Defineix el procés d'onboarding que s'aplicarà.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom Complet</FormLabel>
              <FormControl>
                <Input placeholder="Joan Cirera Puig" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nif"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NIF/NIE</FormLabel>
              <FormControl>
                <Input placeholder="12345678A" {...field} disabled={isEditMode && !!employee?.nif} />
              </FormControl>
              <FormDescription>
                {isEditMode && !!employee?.nif ? "El NIF no es pot modificar." : "L'EmployeeID d'LDAP s'utilitzarà com a NIF."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departament</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un departament" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sampleDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol / Càrrec</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EMPLOYEE_ROLES.map((roleName) => (
                    <SelectItem key={roleName} value={roleName}>{roleName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading 
            ? "Processant..." 
            : isEditMode 
              ? "Guardar Canvis" 
              : "Crear Sol·licitud d'Alta"}
        </Button>
      </form>
    </Form>
  );
}
