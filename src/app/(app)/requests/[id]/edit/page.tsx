
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { RequestEditForm } from "@/components/requests/RequestEditForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { sampleRequests } from "@/lib/sample-data";
import type { Request as RequestType } from "@/types";

function getRequestByIdSync(id: string): RequestType | undefined {
  return sampleRequests.find(req => req.id === id);
}

export default function EditRequestPage() {
  const params = useParams();
  const requestId = params.id as string;
  
  const [request, setRequest] = useState<RequestType | undefined | null>(null); // null for loading state

  useEffect(() => {
    if (requestId) {
      const foundRequest = getRequestByIdSync(requestId);
      setRequest(foundRequest || undefined); // if not found, set to undefined
    }
  }, [requestId]);

  if (request === null) { // Still loading or ID not processed
    return (
      <PageHeader title="Carregant sol·licitud..." description="Si us plau, espera." />
    );
  }

  if (request === undefined) { // Request not found after search
    return (
      <>
        <PageHeader
          title="Sol·licitud no Trobada"
          description={`No s'ha pogut trobar cap sol·licitud amb l'ID ${requestId}.`}
        >
          <Button variant="outline" asChild>
            <Link href="/requests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Sol·licituds
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>La sol·licitud que vols editar no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar Sol·licitud: ${request.id}`}
        description={`Modifica els detalls de la sol·licitud.`}
      >
        <Button variant="outline" asChild>
          <Link href={`/requests/${request.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel·lar i Tornar
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
         <CardHeader>
            <CardTitle>Editar Resum de la Sol·licitud</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <RequestEditForm request={request} />
        </CardContent>
      </Card>
    </>
  );
}
