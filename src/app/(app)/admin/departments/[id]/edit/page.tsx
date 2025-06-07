
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { DepartmentForm } from "@/components/admin/departments/DepartmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { sampleDepartments } from "@/lib/sample-data";
import type { Department } from "@/types";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function getDepartmentByIdSync(id: string): Department | undefined {
  return sampleDepartments.find(dept => dept.id === id);
}

function EditDepartmentPageInternal() {
  const params = useParams();
  const departmentId = params.id as string;
  
  const [department, setDepartment] = useState<Department | undefined | null>(null);

  useEffect(() => {
    if (departmentId) {
      const foundDepartment = getDepartmentByIdSync(departmentId);
      if (foundDepartment) {
        setDepartment(foundDepartment);
      } else {
        setDepartment(undefined); 
      }
    }
  }, [departmentId]);

  if (department === null) {
    return (
      <PageHeader title="Carregant departament..." description="Si us plau, espera." />
    );
  }

  if (department === undefined) {
    return (
      <>
        <PageHeader
          title="Departament no Trobat"
          description={`No s'ha pogut trobar cap departament amb l'ID ${departmentId}.`}
        >
          <Button variant="outline" asChild>
            <Link href="/admin/departments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Departaments
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>El departament que vols editar no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar Departament: ${department.name}`}
        description={`Modifica la informació del departament ${department.name}.`}
      >
        <Button variant="outline" asChild>
          <Link href="/admin/departments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel·lar
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
         <CardHeader>
            <CardTitle>Detalls del Departament</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <DepartmentForm department={department} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(EditDepartmentPageInternal, [ROLES.ADMIN]);
