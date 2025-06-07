"use client"; // Converted to Client Component

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListChecks, CheckSquare, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";
import { sampleTasks, sampleApprovals, sampleEmployees } from "@/lib/sample-data"; // Import sample data for counts
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user: currentUser } = useAuth();

  // Simulate dynamic counts - in a real app, these would come from API calls filtered by current user
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const activeEmployeesCount = sampleEmployees.filter(e => e.status === 'active').length;

  useEffect(() => {
    if (currentUser) {
      // For simplicity, sampleTasks doesn't have specific user assignment yet,
      // so we'll show a general count of pending tasks for now.
      // A real implementation would filter tasks assigned to currentUser or their departments.
      setPendingTasksCount(sampleTasks.filter(t => t.status === 'pending' || t.status === 'inProgress').length);
      
      // Filter approvals assigned to the current user
      setPendingApprovalsCount(sampleApprovals.filter(appr => appr.approverId === currentUser.id && appr.status === 'pending').length);
    }
  }, [currentUser]);

  const canManageEmployees = currentUser?.roles.some(role => [ROLES.ADMIN, ROLES.RRHH, ROLES.MANAGER].includes(role));
  const canAccessApprovals = currentUser?.roles.some(role => [ROLES.MANAGER, ROLES.IT, ROLES.ADMIN, ROLES.RRHH].includes(role));
  
  return (
    <>
      <PageHeader title="Panell d'Estat" description="Visió general de les teves tasques i activitats del sistema." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Les Meves Tasques Pendents</CardTitle>
            <ListChecks className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasksCount}</div>
            <p className="text-xs text-muted-foreground">Tasques que requereixen la teva atenció.</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/tasks">Veure Tasques</Link>
            </Button>
          </CardContent>
        </Card>

        {canAccessApprovals && (
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sol·licituds per Aprovar</CardTitle>
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovalsCount}</div>
              <p className="text-xs text-muted-foreground">Sol·licituds esperant la teva validació.</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/approvals">Veure Aprovacions</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        {canManageEmployees && (
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gestió d'Empleats</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployeesCount} Empleats Actius</div>
              <p className="text-xs text-muted-foreground">Gestiona altes, baixes i perfils d'empleats.</p>
              <Button size="sm" className="mt-4" asChild>
                <Link href="/employees/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Nova Alta
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>Accions Ràpides</CardTitle>
          <CardDescription>Accedeix directament a les funcionalitats clau.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {canManageEmployees && (
            <Button variant="secondary" asChild>
              <Link href="/employees">Veure Tots els Empleats</Link>
            </Button>
          )}
          <Button variant="secondary" asChild>
            <Link href="/requests">Veure Totes les Sol·licituds</Link>
          </Button>
           <Button variant="secondary" asChild>
            <Link href="/requests/new-access">Nova Sol·licitud d'Accés</Link>
          </Button>
           {/* Potser afegir aquí "Nova Sol·licitud de Baixa" si l'usuari té permisos */}
        </CardContent>
      </Card>
    </>
  );
}
