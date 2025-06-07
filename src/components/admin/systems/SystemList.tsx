
"use client";

import type { System } from "@/types";
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
import React, { useState } from "react";
import { sampleSystems } from "@/lib/sample-data";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/lib/constants';

interface SystemListProps {
  systems?: System[];
}

const ITEMS_PER_PAGE = 10;

export function SystemList({ systems = sampleSystems }: SystemListProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const isAdmin = currentUser?.roles.includes(ROLES.ADMIN);

  const totalPages = Math.ceil(systems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSystems = systems.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleDeleteSystem = (system: System) => {
    console.log(`Simulant eliminació del sistema: ${system.name}`);
    toast({
      title: "Sistema Eliminat (Simulat)",
      description: `S'ha simulat l'eliminació del sistema "${system.name}".`,
      variant: "destructive",
    });
  };

  if (!systems || systems.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No hi ha sistemes definits.</p>
        {isAdmin && (
          <Button asChild className="mt-4">
            <Link href="/admin/systems/new">Crear Nou Sistema</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>
          Llista de sistemes gestionables. Mostrant {currentSystems.length} de {systems.length} sistemes.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] py-2 px-4">ID Sistema</TableHead>
            <TableHead className="py-2 px-4">Nom del Sistema</TableHead>
            <TableHead className="py-2 px-4">Requereix Aprovació De</TableHead>
            {isAdmin && <TableHead className="text-right py-2 px-4">Accions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentSystems.map((system) => (
            <TableRow key={system.id}>
              <TableCell className="font-mono text-xs py-2 px-4">{system.id}</TableCell>
              <TableCell className="font-medium py-2 px-4">{system.name}</TableCell>
              <TableCell className="py-2 px-4">
                {system.requiresApprovalBy ? (
                  <Badge variant="secondary">{system.requiresApprovalBy}</Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">N/A</span>
                )}
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right space-x-1 py-2 px-4">
                  <Button variant="ghost" size="icon" asChild title="Editar sistema">
                    <Link href={`/admin/systems/${system.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Eliminar sistema" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Eliminació</AlertDialogTitle>
                        <AlertDialogDescription>
                          Estàs segur que vols eliminar el sistema {system.name}? Aquesta acció no es pot desfer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSystem(system)}
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
