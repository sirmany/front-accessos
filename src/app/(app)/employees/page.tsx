"use client"; 

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Employee } from '@/types';
import { sampleEmployees } from "@/lib/sample-data";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function EmployeesPageInternal() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) {
      return sampleEmployees;
    }
    return sampleEmployees.filter((employee: Employee) => {
      const term = searchTerm.toLowerCase();
      return (
        employee.fullName.toLowerCase().includes(term) ||
        employee.nif.toLowerCase().includes(term) ||
        employee.department.toLowerCase().includes(term) ||
        employee.role.toLowerCase().includes(term)
      );
    });
  }, [searchTerm]);

  return (
    <>
      <PageHeader
        title="Gestió d'Empleats"
        description="Consulta, afegeix o modifica la informació dels empleats."
      >
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cercar empleats..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button asChild>
            <Link href="/employees/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nou Empleat
            </Link>
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <EmployeeList employees={filteredEmployees} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(EmployeesPageInternal, [ROLES.ADMIN, ROLES.RRHH, ROLES.MANAGER]);