
"use client";

import type { Employee } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, UserMinus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { sampleEmployees } from "@/lib/sample-data";
import { useAuth } from '@/context/AuthContext'; // Importar useAuth
import { ROLES } from '@/lib/constants'; // Importar ROLES

interface EmployeeListProps {
  employees?: Employee[];
}

const ITEMS_PER_PAGE = 10;

export function EmployeeList({ employees = sampleEmployees }: EmployeeListProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const { user: currentUser } = useAuth(); // Obtenir usuari actual

  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEmployees = employees.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleInitiateOffboarding = (employee: Employee) => {
    // En un futur, això redirigiria a /requests/new-offboarding amb l'empleat preseleccionat.
    // Per ara, només simulem la intenció.
    toast({
      title: "Inici de Baixa (Simulat)",
      description: `Redirigint per iniciar la baixa de ${employee.fullName}... (Funció no implementada completament)`,
    });
    // router.push(`/requests/new-offboarding?employeeId=${employee.id}`);
  };

  const canEditEmployee = currentUser?.roles.some(role => [ROLES.ADMIN, ROLES.RRHH].includes(role));
  const canInitiateOffboarding = currentUser?.roles.some(role => [ROLES.ADMIN, ROLES.RRHH].includes(role));

  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg shadow-md bg-card border">
        <Image src="https://placehold.co/300x200.png" alt="No employees found" width={300} height={200} className="mb-6 rounded-md" data-ai-hint="empty state illustration" />
        <h3 className="text-xl font-semibold mb-2">No s'han trobat empleats</h3>
        <p className="text-muted-foreground">Actualment no hi ha empleats registrats al sistema o que coincideixin amb la teva cerca.</p>
        <Button asChild className="mt-4">
          <Link href="/employees/new">Crear Nou Empleat</Link>
        </Button>
      </div>
    );
  }
  return (
    <>
      <Table>
        <TableCaption>Llista d'empleats registrats al sistema. Mostrant {currentEmployees.length} de {employees.length} empleats.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="py-2 px-4">Nom Complet</TableHead>
            <TableHead className="py-2 px-4">NIF</TableHead>
            <TableHead className="py-2 px-4">Departament</TableHead>
            <TableHead className="py-2 px-4">Rol</TableHead>
            <TableHead className="py-2 px-4">Estat</TableHead>
            <TableHead className="text-right py-2 px-4">Accions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentEmployees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium py-2 px-4">
                <Link href={`/employees/${employee.id}`} className="hover:underline">
                  {employee.fullName}
                </Link>
              </TableCell>
              <TableCell className="py-2 px-4">{employee.nif}</TableCell>
              <TableCell className="py-2 px-4">{employee.department}</TableCell>
              <TableCell className="py-2 px-4">{employee.role}</TableCell>
              <TableCell className="py-2 px-4">
                <Badge variant={employee.status === "active" ? "default" : "secondary"}
                  className={employee.status === "active" ? "bg-green-500/20 text-green-700 border-green-400" : "bg-red-500/20 text-red-700 border-red-400"}
                >
                  {employee.status === "active" ? "Actiu" : "Inactiu"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-1 py-2 px-4">
                {canEditEmployee && (
                  <Button variant="ghost" size="icon" asChild title="Editar empleat">
                    <Link href={`/employees/${employee.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {canInitiateOffboarding && employee.status === "active" && (
                  // Aquest botó ara hauria de redirigir al formulari de baixa preomplert si és possible,
                  // o almenys a la pàgina per crear una nova sol·licitud de baixa.
                  <Button variant="ghost" size="icon" asChild title="Iniciar baixa" className="text-destructive hover:text-destructive">
                     <Link href={`/requests/new-offboarding?employeeId=${employee.id}`}>
                        <UserMinus className="h-4 w-4" />
                     </Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
          <span className="text-sm text-muted-foreground">
            Pàgina {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Següent
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}

    