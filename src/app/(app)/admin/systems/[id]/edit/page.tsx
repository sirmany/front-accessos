
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { SystemForm } from "@/components/admin/systems/SystemForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { sampleSystems } from "@/lib/sample-data";
import type { System } from "@/types";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function getSystemByIdSync(id: string): System | undefined {
  return sampleSystems.find(sys => sys.id === id);
}

function EditSystemPageInternal() {
  const params = useParams();
  const systemId = params.id as string;
  
  const [system, setSystem] = useState<System | undefined | null>(null);

  useEffect(() => {
    if (systemId) {
      const foundSystem = getSystemByIdSync(systemId);
      setSystem(foundSystem || undefined);
    }
  }, [systemId]);

  if (system === null) {
    return (
      <PageHeader title="Carregant sistema..." description="Si us plau, espera." />
    );
  }

  if (system === undefined) {
    return (
      <>
        <PageHeader
          title="Sistema no Trobat"
          description={`No s'ha pogut trobar cap sistema amb l'ID ${systemId}.`}
        >
          <Button variant="outline" asChild>
            <Link href="/admin/systems">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Sistemes
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>El sistema que vols editar no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar Sistema: ${system.name}`}
        description={`Modifica la informació del sistema ${system.name}.`}
      >
        <Button variant="outline" asChild>
          <Link href="/admin/systems">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel·lar
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
         <CardHeader>
            <CardTitle>Detalls del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <SystemForm system={system} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(EditSystemPageInternal, [ROLES.ADMIN]);
