
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
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Department } from "@/types";
import { sampleDepartments } from "@/lib/sample-data";
import { useRouter } from "next/navigation";
import { generateMockId } from "@/lib/id-generator"; // Importat

const departmentSchema = z.object({
  id: z.string().optional(), // ID és opcional, es pot auto-generar
  name: z.string().min(3, { message: "El nom del departament ha de tenir almenys 3 caràcters." }),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  department?: Department;
}

export function DepartmentForm({ department }: DepartmentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!department;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      id: department?.id || "",
      name: department?.name || "",
    },
  });

  async function onSubmit(data: DepartmentFormValues) {
    setIsLoading(true);
    console.log("Department form data:", data);

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    let toastTitle = "";
    let toastDescription = "";

    if (isEditMode && department) {
      const departmentIndex = sampleDepartments.findIndex(d => d.id === department.id);
      if (departmentIndex !== -1) {
        // L'ID no hauria de canviar en mode edició si és la clau
        sampleDepartments[departmentIndex] = { ...sampleDepartments[departmentIndex], name: data.name };
      }
      toastTitle = "Departament Actualitzat";
      toastDescription = `S'han guardat els canvis per al departament ${data.name}.`;
    } else {
      const newDepartmentId = data.id || generateMockId("dept");
      if (sampleDepartments.some(d => d.id === newDepartmentId) && data.id) { // Només comprovem si l'ID va ser proporcionat manualment
        form.setError("id", { type: "manual", message: "Aquest ID de departament ja existeix. Prova amb un altre o deixa-ho en blanc." });
        setIsLoading(false);
        return;
      }
      const newDepartment: Department = {
        id: newDepartmentId,
        name: data.name,
      };
      sampleDepartments.push(newDepartment);
      toastTitle = "Departament Creat";
      toastDescription = `S'ha creat el departament ${data.name} amb ID: ${newDepartmentId}.`;
    }

    toast({
      title: toastTitle,
      description: toastDescription,
    });
    setIsLoading(false);
    router.push("/admin/departments");
    router.refresh(); 
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID del Departament</FormLabel>
              <FormControl>
                <Input placeholder="Ex: hr, it (o deixa en blanc per auto-generar)" {...field} disabled={isEditMode} />
              </FormControl>
              <FormDescription>
                {isEditMode ? "L'ID del departament no es pot modificar." : "Identificador únic (opcional, es generarà si es deixa buit)."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom del Departament</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Recursos Humans" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading
            ? "Processant..."
            : isEditMode
              ? "Guardar Canvis"
              : "Crear Departament"}
        </Button>
      </form>
    </Form>
  );
}
