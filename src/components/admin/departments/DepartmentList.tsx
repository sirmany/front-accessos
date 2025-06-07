
"use client";

import type { Department } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
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
import React, { useState, useEffect } from "react";
import { sampleDepartments, sampleEmployees, sampleAppUsers, sampleTasks, sampleRequests } from "@/lib/sample-data";
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/lib/constants';

interface DepartmentListProps {
  departments?: Department[];
}

const ITEMS_PER_PAGE = 10;

export function DepartmentList({ departments: initialDepartments }: DepartmentListProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [managedDepartments, setManagedDepartments] = useState<Department[]>(initialDepartments || [...sampleDepartments]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setManagedDepartments(initialDepartments || [...sampleDepartments]);
  }, [initialDepartments]);

  const isAdmin = currentUser?.roles.includes(ROLES.ADMIN);

  const totalPages = Math.ceil(managedDepartments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDepartments = managedDepartments.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleDeleteDepartment = (departmentToDelete: Department) => {
    const isUsedByEmployee = sampleEmployees.some(emp => emp.department === departmentToDelete.name);
    const isUsedByUser = sampleAppUsers.some(user => user.departments?.includes(departmentToDelete.name));
    const isUsedByActiveTask = sampleTasks.some(
      task => task.assigneeDepartment === departmentToDelete.name && task.status !== 'completed'
    );
    const isUsedByActiveRequest = sampleRequests.some(
      req => req.assignedDepartment === departmentToDelete.name && !['completed', 'cancelled', 'rejected'].includes(req.status)
    );

    let blockingDependencies: string[] = [];
    if (isUsedByEmployee) {
      blockingDependencies.push("empleats");
    }
    if (isUsedByUser) {
      blockingDependencies.push("usuaris de l'aplicació");
    }
    if (isUsedByActiveTask) {
      blockingDependencies.push("tasques actives");
    }
    if (isUsedByActiveRequest) {
      blockingDependencies.push("sol·licituds actives");
    }

    if (blockingDependencies.length > 0) {
      toast({
        title: "Advertència: Departament en Ús",
        description: `El departament "${departmentToDelete.name}" està sent utilitzat per ${blockingDependencies.join(', ')}. No es pot eliminar fins que no es desassigni.`,
        variant: "destructive",
        duration: 8000,
      });
      return;
    }

    const indexInGlobal = sampleDepartments.findIndex(d => d.id === departmentToDelete.id);
    if (indexInGlobal > -1) {
      sampleDepartments.splice(indexInGlobal, 1);
    }

    setManagedDepartments(prevDepartments => prevDepartments.filter(d => d.id !== departmentToDelete.id));

    if (currentDepartments.length === 1 && currentPage > 1 && totalPages > 1) {
      setCurrentPage(currentPage - 1);
    }
    
    toast({
      title: "Departament Eliminat",
      description: `S'ha eliminat el departament "${departmentToDelete.name}".`,
      variant: "destructive",
    });
  };

  if (managedDepartments.length === 0 && sampleDepartments.length > 0 && !initialDepartments) {
     return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Carregant departaments...</p>
      </div>
    );
  }

  if (currentDepartments.length === 0 && currentPage === 1 && managedDepartments.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No hi ha departaments definits.</p>
        {isAdmin && (
          <Button asChild className="mt-4">
            <Link href="/admin/departments/new">Crear Nou Departament</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>
          Llista de departaments de l'organització. Mostrant {currentDepartments.length} de {managedDepartments.length} departaments.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] py-2 px-4">ID Departament</TableHead>
            <TableHead className="py-2 px-4">Nom del Departament</TableHead>
            {isAdmin && <TableHead className="text-right py-2 px-4">Accions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentDepartments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className="font-mono text-xs py-2 px-4">{department.id}</TableCell>
              <TableCell className="font-medium py-2 px-4">{department.name}</TableCell>
              {isAdmin && (
                <TableCell className="text-right space-x-1 py-2 px-4">
                  <Button variant="ghost" size="icon" asChild title="Editar departament">
                    <Link href={`/admin/departments/${department.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Eliminar departament" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Eliminació</AlertDialogTitle>
                        <AlertDialogDescription>
                          Estàs segur que vols eliminar el departament {department.name}? Aquesta acció no es pot desfer.
                          Si el departament està en ús per empleats, usuaris, tasques o sol·licituds, primer hauràs de desassignar-lo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteDepartment(department)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Confirmar Eliminació
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              )}
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
