
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { RequestTypeDefinition, ChecklistTemplate } from "@/types";
import { sampleRequestTypeDefinitions } from "@/lib/sample-data";
import { useRouter } from "next/navigation";
import { REQUEST_TYPE_APPLIES_TO_OPTIONS } from "@/lib/constants";
import { generateMockId } from "@/lib/id-generator"; // Importat

const requestTypeDefinitionSchema = z.object({
  id: z.string().optional(), // ID és opcional
  name: z.string().min(3, { message: "El nom ha de tenir almenys 3 caràcters." }),
  description: z.string().optional(),
  appliesTo: z.enum(['onboarding', 'offboarding', 'access', 'other']),
  checklistTemplateId: z.string().min(1, { message: "S'ha de seleccionar una plantilla de checklist." }),
  isEnabled: z.boolean(),
});

type RequestTypeDefinitionFormValues = z.infer<typeof requestTypeDefinitionSchema>;

interface RequestTypeDefinitionFormProps {
  requestTypeDefinition?: RequestTypeDefinition;
  checklistTemplates: ChecklistTemplate[];
}

export function RequestTypeDefinitionForm({ requestTypeDefinition, checklistTemplates }: RequestTypeDefinitionFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!requestTypeDefinition;

  const form = useForm<RequestTypeDefinitionFormValues>({
    resolver: zodResolver(requestTypeDefinitionSchema),
    defaultValues: {
      id: requestTypeDefinition?.id || "",
      name: requestTypeDefinition?.name || "",
      description: requestTypeDefinition?.description || "",
      appliesTo: requestTypeDefinition?.appliesTo || "other",
      checklistTemplateId: requestTypeDefinition?.checklistTemplateId || "",
      isEnabled: requestTypeDefinition?.isEnabled === undefined ? true : requestTypeDefinition.isEnabled,
    },
  });

  async function onSubmit(data: RequestTypeDefinitionFormValues) {
    setIsLoading(true);
    console.log("RequestTypeDefinition form data:", data);

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    if (isEditMode && requestTypeDefinition) {
      const index = sampleRequestTypeDefinitions.findIndex(rt => rt.id === requestTypeDefinition.id);
      if (index !== -1) {
        // L'ID no hauria de canviar en mode edició
        sampleRequestTypeDefinitions[index] = { 
          ...sampleRequestTypeDefinitions[index], 
          name: data.name,
          description: data.description,
          appliesTo: data.appliesTo,
          checklistTemplateId: data.checklistTemplateId,
          isEnabled: data.isEnabled,
        };
      }
      toast({
        title: "Tipus de Sol·licitud Actualitzat",
        description: `S'han guardat els canvis per a ${data.name}.`,
      });
    } else {
      const newId = data.id || generateMockId("rtdef");
      if (sampleRequestTypeDefinitions.some(rt => rt.id === newId) && data.id) {
        form.setError("id", { type: "manual", message: "Aquest ID de tipus de sol·licitud ja existeix. Deixa'l buit per auto-generar." });
        setIsLoading(false);
        return;
      }
      const newRequestTypeDefinition: RequestTypeDefinition = {
        id: newId,
        name: data.name,
        description: data.description,
        appliesTo: data.appliesTo,
        checklistTemplateId: data.checklistTemplateId,
        isEnabled: data.isEnabled,
      };
      sampleRequestTypeDefinitions.push(newRequestTypeDefinition);
      toast({
        title: "Tipus de Sol·licitud Creat",
        description: `S'ha creat el tipus de sol·licitud ${data.name} amb ID: ${newId}.`,
      });
    }

    setIsLoading(false);
    router.push("/admin/request-types");
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
              <FormLabel>ID del Tipus de Sol·licitud</FormLabel>
              <FormControl>
                <Input placeholder="ex: onboarding_general (o deixa buit per auto-generar)" {...field} disabled={isEditMode} />
              </FormControl>
              <FormDescription>
                {isEditMode ? "L'ID no es pot modificar." : "Identificador únic (opcional, es generarà si es deixa buit)."}
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
              <FormLabel>Nom del Tipus de Sol·licitud</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Alta General d'Empleat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripció (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripció breu del tipus de sol·licitud." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appliesTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aplica A (Categoria General)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REQUEST_TYPE_APPLIES_TO_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Defineix a quin procés principal s'associa aquest tipus.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="checklistTemplateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plantilla de Checklist Associada</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla de checklist" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {checklistTemplates.length > 0 ? (
                    checklistTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No hi ha plantilles disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>La plantilla de checklist que s'utilitzarà quan es creï aquest tipus de sol·licitud.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Actiu</FormLabel>
                <FormDescription>
                  Si està actiu, aquest tipus de sol·licitud es podrà seleccionar.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading
            ? "Processant..."
            : isEditMode
              ? "Guardar Canvis"
              : "Crear Tipus de Sol·licitud"}
        </Button>
      </form>
    </Form>
  );
}
