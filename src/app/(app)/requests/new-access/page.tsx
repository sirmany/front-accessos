
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccessRequestForm } from "@/components/requests/AccessRequestForm";

export default function NewAccessRequestPage() {
  return (
    <>
      <PageHeader 
        title="Nova Sol·licitud d'Accés"
        description="Emplena el formulari per sol·licitar nous accessos o modificar els existents per a un empleat."
      >
        <Button variant="outline" asChild>
          <Link href="/requests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar a Sol·licituds
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <AccessRequestForm />
        </CardContent>
      </Card>
    </>
  );
}
