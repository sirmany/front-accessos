"use client"; // Afegit per convertir a Client Component

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilePlus2, UserMinus } from "lucide-react"; 
import { RequestList } from "@/components/requests/RequestList";
import { Card, CardContent } from "@/components/ui/card";
import { sampleRequests, sampleEmployees } from "@/lib/sample-data";
import type { Request, Employee } from '@/types';
import { useAuth } from '@/context/AuthContext'; 
import { ROLES } from '@/lib/constants'; 

export default function RequestsPage() {
  const { user: currentUser } = useAuth(); 
  const requestsData: Request[] = sampleRequests;
  const employeesData: Employee[] = sampleEmployees;

  const canManageOnboardingOffboarding = currentUser?.roles.some(role => 
    [ROLES.ADMIN, ROLES.RRHH].includes(role)
  );

  return (
    <>
      <PageHeader 
        title="Sol·licituds" 
        description="Visualitza i gestiona totes les sol·licituds del sistema (alta, baixa, accessos)."
      >
        <div className="flex flex-wrap items-center gap-2">
            {canManageOnboardingOffboarding && (
              <Button asChild>
                  <Link href="/employees/new"><FilePlus2 className="mr-2 h-4 w-4" /> Nova Sol·licitud d'Alta</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
                <Link href="/requests/new-access">Nova Sol·licitud d'Accés</Link>
            </Button>
            {canManageOnboardingOffboarding && (
              <Button variant="outline" className="bg-destructive/10 border-destructive/50 text-destructive hover:bg-destructive/20 hover:text-destructive" asChild>
                  <Link href="/requests/new-offboarding"><UserMinus className="mr-2 h-4 w-4" /> Nova Sol·licitud de Baixa</Link>
              </Button>
            )}
        </div>
      </PageHeader>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <RequestList requests={requestsData} employees={employeesData} />
        </CardContent>
      </Card>
    </>
  );
}
