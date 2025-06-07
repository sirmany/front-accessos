"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const loginSchema = z.object({
  username: z.string().min(1, { message: "El nom d'usuari és requerit." }),
  password: z.string().min(1, { message: "La contrasenya είναι requerida." }),
});

export function LoginForm() {
  const { login } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    // Simulate LDAP login
    // In a real app, this would call an API endpoint that handles LDAP authentication
    // and returns user data.
    console.log("Login attempt with:", values);
    login({
      id: '1', // This would come from your backend/LDAP
      samAccountName: values.username,
      name: `Usuari ${values.username}`, // Mock name
      email: `${values.username}@example.com`, // Mock email
      roles: ['Employee'], // Default role, adjust as needed
      department: 'General' // Default department
    });
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Benvingut/da a {APP_NAME}</CardTitle>
        <CardDescription className="text-center">
          Inicia sessió amb les teves credencials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d'usuari (samaccountid)</FormLabel>
                  <FormControl>
                    <Input placeholder="el.teu.usuari" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrasenya</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Iniciar Sessió
            </Button>
          </form>
        </Form>
        <Alert className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Nota sobre LDAP</AlertTitle>
          <AlertDescription>
            Aquesta és una demostració. En un entorn de producció, la autenticació es realitzarà mitjançant LDAP.
            Les dades de l'empleat (com el NIF) es sincronitzaran des d'LDAP en el primer inici de sessió.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
