
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { DepartmentList } from "@/components/admin/departments/DepartmentList";
import { sampleDepartments } from "@/lib/sample-data"; 
import { Card, CardContent } from "@/components/ui/card";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";
import { useAuth } from '@/context/AuthContext';

function AdminDepartmentsPageInternal() {
  const departments = sampleDepartments;
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes(ROLES.ADMIN);

  return (
    <>
      <PageHeader
        title="Gestió de Departaments"
        description="Administra els departaments de l'organització."
      >
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/departments/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nou Departament
            </Link>
          </Button>
        )}
      </PageHeader>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <DepartmentList departments={departments} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(AdminDepartmentsPageInternal, [ROLES.ADMIN]);
