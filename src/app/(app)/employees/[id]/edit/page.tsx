
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { sampleEmployees } from "@/lib/sample-data"; 
import type { Employee } from "@/types";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

async function getEmployeeById(id: string): Promise<Employee | undefined> {
  return sampleEmployees.find(emp => emp.id === id);
}

function EditEmployeePageInternal() {
  const params = useParams();
  const employeeId = params.id as string;
  const [employee, setEmployee] = useState<Employee | undefined | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const empData = await getEmployeeById(employeeId);
      setEmployee(empData);
      setLoading(false);
    }
    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  if (loading) {
    return <PageHeader title="Carregant empleat..." />;
  }

  if (!employee) {
    return (
      <>
        <PageHeader
          title="Editar Empleat: No Trobat"
          description={`No s'ha pogut trobar cap empleat amb l'ID ${employeeId} per editar.`}
        >
          <Button variant="outline" asChild>
            <Link href="/employees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Empleats
            </Link>
          </Button>
        </PageHeader>
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>L'empleat que vols editar no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  const employeeDisplayName = employee.fullName;

  return (
    <>
      <PageHeader
        title={`Editar Empleat: ${employeeDisplayName}`}
        description={`Modifica la informació de ${employee.fullName}.`}
      >
        <Button variant="outline" asChild>
          <Link href="/employees"> 
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel·lar 
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <EmployeeForm employee={employee} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(EditEmployeePageInternal, [ROLES.ADMIN, ROLES.RRHH]);
