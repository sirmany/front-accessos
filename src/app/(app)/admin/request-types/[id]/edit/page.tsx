
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { RequestTypeDefinitionForm } from "@/components/admin/request-types/RequestTypeDefinitionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { sampleRequestTypeDefinitions, sampleChecklistTemplates } from "@/lib/sample-data";
import type { RequestTypeDefinition, ChecklistTemplate } from "@/types";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function getRequestTypeByIdSync(id: string): RequestTypeDefinition | undefined {
  return sampleRequestTypeDefinitions.find(rt => rt.id === id);
}

function EditRequestTypePageInternal() {
  const params = useParams();
  const requestTypeId = params.id as string;
  
  const [requestType, setRequestType] = useState<RequestTypeDefinition | undefined | null>(null);
  const checklistTemplates: ChecklistTemplate[] = sampleChecklistTemplates;

  useEffect(() => {
    if (requestTypeId) {
      const foundRequestType = getRequestTypeByIdSync(requestTypeId);
      setRequestType(foundRequestType);
    }
  }, [requestTypeId]);

  if (requestType === null) {
    return <PageHeader title="Carregant tipus de sol·licitud..." description="Si us plau, espera." />;
  }

  if (requestType === undefined) {
    return (
      <>
        <PageHeader
          title="Tipus de Sol·licitud no Trobat"
          description={`No s'ha pogut trobar cap tipus de sol·licitud amb l'ID ${requestTypeId}.`}
        >
          <Button variant="outline" asChild>
            <Link href="/admin/request-types">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Tipus de Sol·licitud
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>El tipus de sol·licitud que vols editar no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar Tipus de Sol·licitud: ${requestType.name}`}
        description={`Modifica la informació del tipus de sol·licitud.`}
      >
        <Button variant="outline" asChild>
          <Link href="/admin/request-types">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel·lar
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
         <CardHeader>
            <CardTitle>Detalls del Tipus de Sol·licitud</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <RequestTypeDefinitionForm requestTypeDefinition={requestType} checklistTemplates={checklistTemplates} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(EditRequestTypePageInternal, [ROLES.ADMIN]);
