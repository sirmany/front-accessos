
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";
import { PageHeader } from "./PageHeader";

export function AccessDenied() {
  return (
    <>
      <PageHeader title="Accés Denegat" />
      <Card className="shadow-lg text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <CardTitle className="text-2xl">No tens permís</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Ho sentim, no tens els permisos necessaris per accedir a aquesta pàgina.
          </p>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Tornar al Panell
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
