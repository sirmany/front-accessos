
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DepartmentForm } from "@/components/admin/departments/DepartmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function NewDepartmentPageInternal() {
  return (
    <>
      <PageHeader
        title="Nou Departament"
        description="Crea un nou departament per a l'organització."
      >
        <Button variant="outline" asChild>
          <Link href="/admin/departments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar a Departaments
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalls del Nou Departament</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <DepartmentForm />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(NewDepartmentPageInternal, [ROLES.ADMIN]);
