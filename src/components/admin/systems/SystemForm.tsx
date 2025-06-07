
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
import React, { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { System } from "@/types";
import { sampleSystems, sampleAppUsers } from "@/lib/sample-data";
import { ROLES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMockId } from "@/lib/id-generator"; // Importat

const systemSchema = z.object({
  id: z.string().optional(), // ID és opcional
  name: z.string().min(3, { message: "El nom del sistema ha de tenir almenys 3 caràcters." }),
  requiresApprovalBy: z.string().optional(),
});

type SystemFormValues = z.infer<typeof systemSchema>;

interface SystemFormProps {
  system?: System;
}

type ApproverOption = {
  value: string;
  label: string;
  type: 'role' | 'user' | 'none';
};

export function SystemForm({ system }: SystemFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const isEditMode = !!system;

  const approverOptions = useMemo(() => {
    const options: ApproverOption[] = [];

    options.push({ value: "", label: "No requerit / Cap", type: 'none' });

    const uniqueRoles = new Set<string>(Object.values(ROLES));
    sampleAppUsers.forEach(user => {
      user.roles.forEach(role => uniqueRoles.add(role));
    });
    
    Array.from(uniqueRoles).sort().forEach(role => {
      options.push({ value: `Rol: ${role}`, label: `Rol: ${role}`, type: 'role' });
    });

    sampleAppUsers.forEach(user => {
      const userName = user.name || user.samAccountName;
      options.push({ value: `Usuari: ${userName}`, label: `Usuari: ${userName} (${user.samAccountName})`, type: 'user' });
    });
    
    return Array.from(new Map(options.map(item => [item.value, item])).values())
      .sort((a, b) => {
        if (a.type === 'none') return -1;
        if (b.type === 'none') return 1;
        return a.label.localeCompare(b.label);
      });
  }, []);

  const form = useForm<SystemFormValues>({
    resolver: zodResolver(systemSchema),
    defaultValues: {
      id: system?.id || "",
      name: system?.name || "",
      requiresApprovalBy: system?.requiresApprovalBy || "",
    },
  });

  async function onSubmit(data: SystemFormValues) {
    setIsLoading(true);
    console.log("System form data:", data);

    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const newId = isEditMode && system ? system.id : (data.id || generateMockId("sys"));
    
    const systemDataToSave: System = {
      id: newId,
      name: data.name,
      requiresApprovalBy: data.requiresApprovalBy || undefined, 
    };

    if (isEditMode && system) {
      const systemIndex = sampleSystems.findIndex(s => s.id === system.id);
      if (systemIndex !== -1) {
        sampleSystems[systemIndex] = systemDataToSave;
      }
      toast({
        title: "Sistema Actualitzat",
        description: `S'han guardat els canvis per al sistema ${data.name}.`,
      });
    } else {
      if (sampleSystems.some(s => s.id === newId) && data.id) { // Comprova si l'ID manual ja existeix
        form.setError("id", { type: "manual", message: "Aquest ID de sistema ja existeix. Deixa'l buit per auto-generar." });
        setIsLoading(false);
        return;
      }
      sampleSystems.push(systemDataToSave);
      toast({
        title: "Sistema Creat",
        description: `S'ha creat el sistema ${data.name} amb ID: ${newId}.`,
      });
    }

    setIsLoading(false);
    router.push("/admin/systems");
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
              <FormLabel>ID del Sistema</FormLabel>
              <FormControl>
                <Input placeholder="Ex: erp, crm_sales (o deixa buit per auto-generar)" {...field} disabled={isEditMode} />
              </FormControl>
              <FormDescription>
                {isEditMode ? "L'ID del sistema no es pot modificar." : "Identificador únic (opcional, es generarà si es deixa buit)."}
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
              <FormLabel>Nom del Sistema</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Sistema de Planificació de Recursos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requiresApprovalBy"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Requereix Aprovació De (Opcional)</FormLabel>
              <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
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
                        ? approverOptions.find(
                            (option) => option.value === field.value
                          )?.label
                        : "Selecciona un aprovador..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                  <Command>
                    <CommandInput placeholder="Cerca rol o usuari..." />
                    <CommandList>
                      <CommandEmpty>No s'ha trobat cap rol o usuari.</CommandEmpty>
                      <CommandGroup>
                        {approverOptions.map((option) => (
                          <CommandItem
                            value={option.label}
                            key={option.value}
                            onSelect={() => {
                              form.setValue("requiresApprovalBy", option.value === field.value ? "" : option.value);
                              setIsComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                option.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Selecciona un rol o usuari que ha d'aprovar l'accés a aquest sistema, o deixa-ho com a "No requerit".
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading
            ? "Processant..."
            : isEditMode
              ? "Guardar Canvis"
              : "Crear Sistema"}
        </Button>
      </form>
    </Form>
  );
}
