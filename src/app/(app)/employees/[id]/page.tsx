
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, AlertTriangle } from "lucide-react";
import { sampleEmployees } from "@/lib/sample-data"; // Updated import
import type { Employee } from "@/types";
import { Badge } from "@/components/ui/badge";

// This would be a server component fetching employee data by ID
// For now, we simulate fetching from sampleEmployees
async function getEmployeeById(id: string): Promise<Employee | undefined> {
  // In a real app, this would be an API call
  return sampleEmployees.find(emp => emp.id === id);
}

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const employeeId = params.id;
  const employee = await getEmployeeById(employeeId);

  if (!employee) {
    return (
      <>
        <PageHeader
          title="Empleat no Trobat"
          description={`No s'ha pogut trobar cap empleat amb l'ID ${employeeId}.`}
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
            <p>L'empleat que cerques no existeix o l'ID és incorrecte.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  const employeeDisplayName = employee.fullName;

  return (
    <>
      <PageHeader
        title={`Detalls de l'Empleat: ${employeeDisplayName}`}
        description={`Informació detallada de l'empleat ${employee.fullName}.`}
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/employees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Empleats
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/employees/${employeeId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Empleat
            </Link>
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Informació de l'Empleat</CardTitle>
            <CardDescription>Dades completes de {employee.fullName}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nom Complet</h3>
              <p className="text-lg">{employee.fullName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">NIF/NIE</h3>
              <p className="text-lg">{employee.nif}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Departament</h3>
              <p className="text-lg">{employee.department}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Rol / Càrrec</h3>
              <p className="text-lg">{employee.role}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Estat</h3>
              <Badge variant={employee.status === "active" ? "default" : "secondary"}
                className={`text-lg ${employee.status === "active" ? "bg-green-500/20 text-green-700 border-green-400" : "bg-red-500/20 text-red-700 border-red-400"}`}
              >
                {employee.status === "active" ? "Actiu" : "Inactiu"}
              </Badge>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
