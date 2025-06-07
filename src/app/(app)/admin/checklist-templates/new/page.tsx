
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChecklistTemplateForm } from "@/components/checklist-templates/ChecklistTemplateForm";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function NewChecklistTemplatePageInternal() {
  return (
    <>
      <PageHeader
        title="Nova Plantilla de Checklist"
        description="Defineix una nova plantilla amb les seves tasques associades."
      >
        <Button variant="outline" asChild>
          <Link href="/admin/checklist-templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar a Plantilles
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalls de la Nova Plantilla</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ChecklistTemplateForm />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(NewChecklistTemplatePageInternal, [ROLES.ADMIN]);
