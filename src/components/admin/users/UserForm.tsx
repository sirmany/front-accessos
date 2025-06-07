
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
import type { User, Department } from "@/types";
import { sampleAppUsers, sampleDepartments } from "@/lib/sample-data";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { generateMockId } from "@/lib/id-generator"; // Importat

const userSchema = z.object({
  samAccountName: z.string().min(3, { message: "El SamAccountName ha de tenir almenys 3 caràcters." }),
  name: z.string().min(3, { message: "El nom complet ha de tenir almenys 3 caràcters." }),
  email: z.string().email({ message: "Format d'email invàlid." }),
  nif: z.string()
    .regex(/^[XYZ\d]\d{7}[A-Z]$|^[A-HJ-NP-SUVW]\d{7}[A-J\d]$/, { message: "Format de NIF/NIE invàlid." })
    .optional()
    .or(z.literal('')),
  roles: z.string().min(1, { message: "S'ha d'assignar almenys un rol." }), 
  departments: z.array(z.string()).min(1, { message: "S'ha d'assignar almenys un departament." }),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
}

export function UserForm({ user }: UserFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDepartmentPopoverOpen, setIsDepartmentPopoverOpen] = useState(false);
  const isEditMode = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      samAccountName: user?.samAccountName || "",
      name: user?.name || "",
      email: user?.email || "",
      nif: user?.nif || "",
      roles: user?.roles?.join(", ") || "",
      departments: user?.departments || [],
    },
  });

  async function onSubmit(data: UserFormValues) {
    setIsLoading(true);
    console.log("User form data:", data);

    const rolesArray = data.roles.split(",").map(role => role.trim()).filter(role => role.length > 0);
    const nifValue = data.nif === "" ? undefined : data.nif;
    const departmentsArray = data.departments;

    await new Promise(resolve => setTimeout(resolve, 1000));

    let toastTitle = "";
    let toastDescription = "";

    if (isEditMode && user) {
      const userIndex = sampleAppUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        sampleAppUsers[userIndex] = {
          ...sampleAppUsers[userIndex],
          // samAccountName no es pot canviar si és part de l'ID o clau única
          name: data.name,
          email: data.email,
          nif: nifValue,
          roles: rolesArray,
          departments: departmentsArray,
          id: user.id, 
          avatarUrl: user.avatarUrl 
        };
      }
      toastTitle = "Usuari Actualitzat";
      toastDescription = `S'han guardat els canvis per a ${data.name}.`;
    } else {
      const newUserId = generateMockId("user");
      const newUser: User = {
        id: newUserId,
        samAccountName: data.samAccountName,
        name: data.name,
        email: data.email,
        nif: nifValue,
        roles: rolesArray,
        departments: departmentsArray,
        avatarUrl: `https://placehold.co/100x100.png?text=${data.name?.substring(0, 2).toUpperCase() || 'U'}`,
      };
      sampleAppUsers.push(newUser);
      toastTitle = "Usuari Creat";
      toastDescription = `S'ha creat l'usuari ${data.name} amb ID: ${newUserId}.`;
    }

    toast({
      title: toastTitle,
      description: toastDescription,
    });
    setIsLoading(false);
    router.push("/admin/users");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="samAccountName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SamAccountName (Login LDAP)</FormLabel>
              <FormControl>
                <Input placeholder="nom.usuari" {...field} disabled={isEditMode && !!user?.samAccountName} />
              </FormControl>
              <FormDescription>
                {isEditMode && !!user?.samAccountName ? "El SamAccountName no es pot modificar." : "Aquest serà l'identificador d'inici de sessió."}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correu Electrònic</FormLabel>
              <FormControl>
                <Input type="email" placeholder="usuari@example.com" {...field} />
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
              <FormLabel>NIF (Enllaç a Empleat)</FormLabel>
              <FormControl>
                <Input placeholder="Opcional, ex: 12345678A" {...field} />
              </FormControl>
              <FormDescription>
                NIF de l'empleat associat a aquest usuari, si aplica.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departments"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Departaments</FormLabel>
              <Popover open={isDepartmentPopoverOpen} onOpenChange={setIsDepartmentPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isDepartmentPopoverOpen}
                      className={cn(
                        "w-full justify-between",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      {field.value?.length > 0
                        ? `${field.value.length} departament(s) seleccionat(s)`
                        : "Selecciona departaments..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                  <Command>
                    <CommandInput placeholder="Cerca departament..." />
                    <CommandList>
                      <CommandEmpty>No s'ha trobat cap departament.</CommandEmpty>
                      <CommandGroup>
                        {sampleDepartments.map((department: Department) => (
                          <CommandItem
                            key={department.id}
                            value={department.name}
                            onSelect={() => {
                              const currentValues = field.value || [];
                              const newValue = currentValues.includes(department.name)
                                ? currentValues.filter((val) => val !== department.name)
                                : [...currentValues, department.name];
                              form.setValue("departments", newValue, { shouldValidate: true, shouldDirty: true });
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                (field.value || []).includes(department.name) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {department.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-1 mt-2">
                {(field.value || []).map((departmentName) => (
                  <Badge key={departmentName} variant="secondary" className="pl-2 pr-1 py-0.5">
                    {departmentName}
                    <button
                      type="button"
                      className="ml-1 p-0.5 rounded-full outline-none ring-offset-background focus:ring-1 focus:ring-ring focus:ring-offset-1 hover:bg-destructive/20"
                      onClick={() => {
                        const currentValues = field.value || [];
                        form.setValue("departments", currentValues.filter((val) => val !== departmentName), { shouldValidate: true, shouldDirty: true });
                      }}
                      aria-label={`Eliminar ${departmentName}`}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
              <FormDescription>
                Selecciona un o més departaments als quals pertany l'usuari.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rols de l'Aplicació</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Admin, RRHH, Manager (separats per comes)"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Introdueix els rols de l'usuari dins de Gestió Àgil, separats per comes.
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
              : "Crear Usuari"}
        </Button>
      </form>
    </Form>
  );
}
