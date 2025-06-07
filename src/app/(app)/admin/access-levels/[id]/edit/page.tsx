
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { AccessLevelForm } from "@/components/admin/access-levels/AccessLevelForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { sampleAccessLevels } from "@/lib/sample-data";
import type { AccessLevel } from "@/types";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function getAccessLevelByIdSync(id: string): AccessLevel | undefined {
  return sampleAccessLevels.find(lvl => lvl.id === id);
}

function EditAccessLevelPageInternal() {
  const params = useParams();
  const accessLevelId = params.id as string;
  
  const [accessLevel, setAccessLevel] = useState<AccessLevel | undefined | null>(null);

  useEffect(() => {
    if (accessLevelId) {
      const foundLevel = getAccessLevelByIdSync(accessLevelId);
      setAccessLevel(foundLevel || undefined);
    }
  }, [accessLevelId]);

  if (accessLevel === null) {
    return (
      <PageHeader title="Carregant nivell d'accés..." description="Si us plau, espera." />
    );
  }

  if (accessLevel === undefined) {
    return (
      <>
        <PageHeader
          title="Nivell d'Accés no Trobat"
          description={`No s'ha pogut trobar cap nivell d'accés amb l'ID ${accessLevelId}.`}
        >
          <Button variant="outline" asChild>
            <Link href="/admin/access-levels">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Nivells d'Accés
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>El nivell d'accés que vols editar no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar Nivell d'Accés: ${accessLevel.name}`}
        description={`Modifica la informació del nivell d'accés ${accessLevel.name}.`}
      >
        <Button variant="outline" asChild>
          <Link href="/admin/access-levels">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel·lar
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
         <CardHeader>
            <CardTitle>Detalls del Nivell d'Accés</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <AccessLevelForm accessLevel={accessLevel} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(EditAccessLevelPageInternal, [ROLES.ADMIN]);
