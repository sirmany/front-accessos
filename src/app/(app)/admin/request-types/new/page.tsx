
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RequestTypeDefinitionForm } from "@/components/admin/request-types/RequestTypeDefinitionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { sampleChecklistTemplates } from "@/lib/sample-data";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function NewRequestTypePageInternal() {
  const checklistTemplates = sampleChecklistTemplates; 

  return (
    <>
      <PageHeader
        title="Nou Tipus de Sol·licitud"
        description="Defineix un nou tipus de sol·licitud i la seva plantilla de checklist associada."
      >
        <Button variant="outline" asChild>
          <Link href="/admin/request-types">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar a Tipus de Sol·licitud
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalls del Nou Tipus de Sol·licitud</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <RequestTypeDefinitionForm checklistTemplates={checklistTemplates} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(NewRequestTypePageInternal, [ROLES.ADMIN]);
