
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { SystemForm } from "@/components/admin/systems/SystemForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function NewSystemPageInternal() {
  return (
    <>
      <PageHeader
        title="Nou Sistema"
        description="Crea un nou sistema d'accés per a l'organització."
      >
        <Button variant="outline" asChild>
          <Link href="/admin/systems">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar a Sistemes
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalls del Nou Sistema</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <SystemForm />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(NewSystemPageInternal, [ROLES.ADMIN]);
