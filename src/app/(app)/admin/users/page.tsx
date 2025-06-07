
"use client"; // Keep as client component if UserList has client interactions

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { UserList } from "@/components/admin/users/UserList";
import { sampleAppUsers } from "@/lib/sample-data"; 
import { Card, CardContent } from "@/components/ui/card";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function AdminUsersPageInternal() {
  const users = sampleAppUsers;

  return (
    <>
      <PageHeader
        title="Gestió d'Usuaris de l'Aplicació"
        description="Administra els usuaris que poden accedir i operar a Gestió Àgil."
      >
        <Button asChild>
          <Link href="/admin/users/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nou Usuari
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <UserList users={users} />
        </CardContent>
      </Card>
    </>
  );
}

export default withAuthRole(AdminUsersPageInternal, [ROLES.ADMIN]);
