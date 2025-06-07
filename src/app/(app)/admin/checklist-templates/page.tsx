
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { ChecklistTemplateManager } from "@/components/checklist-templates/ChecklistTemplateManager";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";
import { useAuth } from '@/context/AuthContext';

function ChecklistTemplatesPageInternal() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes(ROLES.ADMIN);

  return (
    <>
      <PageHeader
        title="Plantilles de Checklist"
        description="Gestiona les plantilles de tasques per als diferents tipus de sol·licituds."
      >
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/checklist-templates/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Plantilla de Checklist
            </Link>
          </Button>
        )}
      </PageHeader>
      <ChecklistTemplateManager />
    </>
  );
}

export default withAuthRole(ChecklistTemplatesPageInternal, [ROLES.ADMIN]);
