
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { RequestTypeDefinitionList } from "@/components/admin/request-types/RequestTypeDefinitionList";
import { sampleRequestTypeDefinitions, sampleChecklistTemplates } from "@/lib/sample-data"; 
import { Card, CardContent } from "@/components/ui/card";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";
import { useAuth } from '@/context/AuthContext'; // Importat

function AdminRequestTypesPageInternal() {
  const { user: currentUser } = useAuth(); // Obtenir usuari actual
  const requestTypes = sampleRequestTypeDefinitions;
  const checklistTemplates = sampleChecklistTemplates;
  const isAdmin = currentUser?.roles.includes(ROLES.ADMIN);

  return (
    <>
      <PageHeader
        title="Gestió de Tipus de Sol·licitud"
        description="Defineix els diferents tipus de sol·licituds i assigna'ls plantilles de checklist."
      >
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/request-types/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nou Tipus de Sol·licitud
            </Link>
          </Button>
        )}
      </PageHeader>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <RequestTypeDefinitionList requestTypes={requestTypes} checklistTemplates={checklistTemplates} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(AdminRequestTypesPageInternal, [ROLES.ADMIN]);
