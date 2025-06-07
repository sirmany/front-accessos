
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OffboardingRequestForm } from "@/components/requests/OffboardingRequestForm";

export default function NewOffboardingRequestPage() {
  return (
    <>
      <PageHeader 
        title="Nova Sol·licitud de Baixa d'Empleat"
        description="Emplena el formulari per iniciar el procés de baixa (offboarding) d'un empleat."
      >
        <Button variant="outline" asChild>
          <Link href="/requests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar a Sol·licituds
          </Link>
        </Button>
      </PageHeader>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalls de la Sol·licitud de Baixa</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <OffboardingRequestForm />
        </CardContent>
      </Card>
    </>
  );
}
