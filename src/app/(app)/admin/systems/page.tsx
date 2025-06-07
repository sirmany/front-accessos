
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { SystemList } from "@/components/admin/systems/SystemList";
import { sampleSystems } from "@/lib/sample-data"; 
import { Card, CardContent } from "@/components/ui/card";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";
import { useAuth } from '@/context/AuthContext';

function AdminSystemsPageInternal() {
  const systems = sampleSystems; 
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes(ROLES.ADMIN);

  return (
    <>
      <PageHeader
        title="Gestió de Sistemes"
        description="Administra els sistemes d'accés de l'organització."
      >
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/systems/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nou Sistema
            </Link>
          </Button>
        )}
      </PageHeader>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <SystemList systems={systems} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(AdminSystemsPageInternal, [ROLES.ADMIN]);
