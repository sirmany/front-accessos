
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
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Request as RequestType } from "@/types";
import { sampleRequests } from "@/lib/sample-data";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const requestEditSchema = z.object({
  summary: z.string().min(5, { message: "El resum ha de tenir almenys 5 caràcters." }),
});

type RequestEditFormValues = z.infer<typeof requestEditSchema>;

interface RequestEditFormProps {
  request: RequestType;
}

export function RequestEditForm({ request }: RequestEditFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RequestEditFormValues>({
    resolver: zodResolver(requestEditSchema),
    defaultValues: {
      summary: request?.summary || "",
    },
  });

  async function onSubmit(data: RequestEditFormValues) {
    setIsLoading(true);
    console.log("Request edit form data:", data);

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const requestIndex = sampleRequests.findIndex(r => r.id === request.id);
    if (requestIndex !== -1) {
      sampleRequests[requestIndex] = {
        ...sampleRequests[requestIndex],
        summary: data.summary,
        updatedAt: new Date().toISOString(),
      };

      toast({
        title: "Sol·licitud Actualitzada",
        description: `S'han guardat els canvis per a la sol·licitud ${request.id}.`,
      });
      router.push(`/requests/${request.id}`);
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: "No s'ha pogut trobar la sol·licitud per actualitzar.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  const formatRequestType = (type: RequestType["type"]): string => {
    switch(type) {
      case "onboarding": return "Alta d'Empleat";
      case "offboarding": return "Baixa d'Empleat";
      case "access": return "Sol·licitud d'Accés";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle>Informació General (No Editable)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">ID Sol·licitud</p>
              <p className="font-mono">{request.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipus de Sol·licitud</p>
              <p>{formatRequestType(request.type)}</p>
            </div>
            {/* Es podrien afegir més camps no editables aquí si fos necessari */}
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resum de la Sol·licitud</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escriu un breu resum de la sol·licitud..."
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Aquest resum apareixerà a les llistes de sol·licituds.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel·lar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardant..." : "Guardar Canvis"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
