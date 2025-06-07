
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { UserForm } from "@/components/admin/users/UserForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function NewUserPageInternal() {
  return (
    <>
      <PageHeader
        title="Nou Usuari de l'Aplicació"
        description="Configura un nou compte d'usuari per a Gestió Àgil."
      >
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar a Usuaris
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalls del Nou Usuari</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <UserForm />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(NewUserPageInternal, [ROLES.ADMIN]);
