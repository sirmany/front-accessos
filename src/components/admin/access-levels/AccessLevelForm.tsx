
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
import type { AccessLevel } from "@/types";
import { sampleAccessLevels } from "@/lib/sample-data";
import { useRouter } from "next/navigation";
import { generateMockId } from "@/lib/id-generator"; // Importat

const accessLevelSchema = z.object({
  id: z.string().min(1, { message: "L'ID del nivell d'accés és requerit." }).regex(/^[a-zA-Z0-9_]+$/, "L'ID només pot contenir lletres, números i guions baixos."),
  name: z.string().min(3, { message: "El nom del nivell d'accés ha de tenir almenys 3 caràcters." }),
});

type AccessLevelFormValues = z.infer<typeof accessLevelSchema>;

interface AccessLevelFormProps {
  accessLevel?: AccessLevel;
}

export function AccessLevelForm({ accessLevel }: AccessLevelFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!accessLevel;

  const form = useForm<AccessLevelFormValues>({
    resolver: zodResolver(accessLevelSchema),
    defaultValues: {
      id: accessLevel?.id || "",
      name: accessLevel?.name || "",
    },
  });

  async function onSubmit(data: AccessLevelFormValues) {
    setIsLoading(true);
    console.log("AccessLevel form data:", data);

    await new Promise(resolve => setTimeout(resolve, 1000)); 

    if (isEditMode && accessLevel) {
      const levelIndex = sampleAccessLevels.findIndex(lvl => lvl.id === accessLevel.id);
      if (levelIndex !== -1) {
        // L'ID no hauria de canviar en mode edició si s'usa com a clau
        sampleAccessLevels[levelIndex] = { ...sampleAccessLevels[levelIndex], name: data.name };
      }
      toast({
        title: "Nivell d'Accés Actualitzat",
        description: `S'han guardat els canvis per al nivell ${data.name}.`,
      });
    } else {
      const newId = data.id || generateMockId("alvl");
      if (sampleAccessLevels.some(lvl => lvl.id === newId)) {
        form.setError("id", { type: "manual", message: "Aquest ID de nivell d'accés ja existeix. Prova amb un altre o deixa-ho en blanc per auto-generar." });
        setIsLoading(false);
        return;
      }
      const newAccessLevel: AccessLevel = {
        id: newId,
        name: data.name,
      };
      sampleAccessLevels.push(newAccessLevel);
      toast({
        title: "Nivell d'Accés Creat",
        description: `S'ha creat el nivell d'accés ${data.name} amb ID: ${newId}.`,
      });
    }

    setIsLoading(false);
    router.push("/admin/access-levels");
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
              <FormLabel>ID del Nivell d'Accés</FormLabel>
              <FormControl>
                <Input placeholder="Ex: read_only (o deixa en blanc per auto-generar)" {...field} disabled={isEditMode} />
              </FormControl>
              <FormDescription>
                {isEditMode ? "L'ID del nivell d'accés no es pot modificar." : "Identificador únic (lletres, números, guions baixos). Opcional, es generarà si es deixa buit."}
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
              <FormLabel>Nom del Nivell d'Accés</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Només Lectura" {...field} />
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
              : "Crear Nivell d'Accés"}
        </Button>
      </form>
    </Form>
  );
}
