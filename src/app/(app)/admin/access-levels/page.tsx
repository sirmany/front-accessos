
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { AccessLevelList } from "@/components/admin/access-levels/AccessLevelList";
import { sampleAccessLevels } from "@/lib/sample-data"; 
import { Card, CardContent } from "@/components/ui/card";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";
import { useAuth } from '@/context/AuthContext';

function AdminAccessLevelsPageInternal() {
  const accessLevels = sampleAccessLevels; 
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes(ROLES.ADMIN);

  return (
    <>
      <PageHeader
        title="Gestió de Nivells d'Accés"
        description="Administra els nivells d'accés per als sistemes."
      >
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/access-levels/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nou Nivell d'Accés
            </Link>
          </Button>
        )}
      </PageHeader>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <AccessLevelList accessLevels={accessLevels} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(AdminAccessLevelsPageInternal, [ROLES.ADMIN]);
