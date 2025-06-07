
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { Card, CardContent } from "@/components/ui/card";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function NewEmployeePageInternal() {
  return (
    <>
      <PageHeader 
        title="Nova Alta d'Empleat"
        description="Emplena el formulari per iniciar el procés d'onboarding d'un nou empleat." 
      />
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <EmployeeForm />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(NewEmployeePageInternal, [ROLES.ADMIN, ROLES.RRHH]);
