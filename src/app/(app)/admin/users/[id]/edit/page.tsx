
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { UserForm } from "@/components/admin/users/UserForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { sampleAppUsers } from "@/lib/sample-data";
import type { User } from "@/types";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function getUserByIdSync(id: string): User | undefined {
  return sampleAppUsers.find(user => user.id === id);
}

function EditUserPageInternal() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | undefined | null>(null);

  useEffect(() => {
    if (userId) {
      const foundUser = getUserByIdSync(userId);
      if (foundUser) {
        setUser(foundUser);
      } else {
        setUser(undefined); 
      }
    }
  }, [userId]);

  if (user === null) { 
    return (
      <PageHeader title="Carregant usuari..." description="Si us plau, espera." />
    );
  }

  if (user === undefined) { 
    return (
      <>
        <PageHeader
          title="Usuari no Trobat"
          description={`No s'ha pogut trobar cap usuari amb l'ID ${userId}.`}
        >
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Usuaris
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>L'usuari que vols editar no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar Usuari: ${user.name || user.samAccountName}`}
        description={`Modifica la informació de l'usuari ${user.name || user.samAccountName}.`}
      >
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel·lar
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
         <CardHeader>
            <CardTitle>Detalls de l'Usuari</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <UserForm user={user} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(EditUserPageInternal, [ROLES.ADMIN]);
