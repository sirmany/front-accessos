
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { AccessLevelForm } from "@/components/admin/access-levels/AccessLevelForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function NewAccessLevelPageInternal() {
  return (
    <>
      <PageHeader
        title="Nou Nivell d'Accés"
        description="Crea un nou nivell d'accés per als sistemes."
      >
        <Button variant="outline" asChild>
          <Link href="/admin/access-levels">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar a Nivells d'Accés
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalls del Nou Nivell d'Accés</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <AccessLevelForm />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(NewAccessLevelPageInternal, [ROLES.ADMIN]);
