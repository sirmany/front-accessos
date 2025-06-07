
"use client"; 

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Save } from "lucide-react";
import { sampleChecklistTemplates } from "@/lib/sample-data";
import type { ChecklistTemplate } from "@/types";
import { ChecklistTemplateForm } from "@/components/checklist-templates/ChecklistTemplateForm";
import { useToast } from "@/hooks/use-toast";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function getChecklistTemplateByIdClone(id: string): ChecklistTemplate | undefined {
  const template = sampleChecklistTemplates.find(template => template.id === id);
  return template ? JSON.parse(JSON.stringify(template)) : undefined;
}

function EditChecklistTemplatePageInternal() {
  const { toast } = useToast(); 
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string; 
  
  const [templateToEdit, setTemplateToEdit] = useState<ChecklistTemplate | undefined | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (templateId) {
      const foundTemplate = getChecklistTemplateByIdClone(templateId);
      setTemplateToEdit(foundTemplate);
      setIsLoading(false);
    }
  }, [templateId]);

  if (isLoading) { 
    return (
      <PageHeader title="Carregant plantilla..." description="Si us plau, espera." />
    );
  }

  if (!templateToEdit) {
    return (
      <>
        <PageHeader
          title="Plantilla no Trobada"
          description={`No s'ha pogut trobar cap plantilla amb l'ID ${templateId}.`}
        >
          <Button variant="outline" asChild>
            <Link href="/admin/checklist-templates">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Plantilles
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>La plantilla que vols editar no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar Plantilla: ${templateToEdit.name}`}
        description={`Modifica els detalls i tasques de la plantilla "${templateToEdit.name}".`}
      >
        <Button variant="outline" asChild>
            <Link href="/admin/checklist-templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel·lar
            </Link>
        </Button>
      </PageHeader>

      <Card className="shadow-lg mb-6">
        <CardHeader>
          <CardTitle>Detalls de la Plantilla</CardTitle>
          <CardDescription>Informació principal de la plantilla de checklist.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ChecklistTemplateForm template={templateToEdit} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(EditChecklistTemplatePageInternal, [ROLES.ADMIN]);
