
"use client";

import type { AccessLevel } from "@/types";
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
import { sampleAccessLevels } from "@/lib/sample-data";
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/lib/constants';

interface AccessLevelListProps {
  accessLevels?: AccessLevel[];
}

const ITEMS_PER_PAGE = 10;

export function AccessLevelList({ accessLevels = sampleAccessLevels }: AccessLevelListProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const isAdmin = currentUser?.roles.includes(ROLES.ADMIN);

  const totalPages = Math.ceil(accessLevels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAccessLevels = accessLevels.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleDeleteAccessLevel = (level: AccessLevel) => {
    console.log(`Simulant eliminació del nivell d'accés: ${level.name}`);
    toast({
      title: "Nivell d'Accés Eliminat (Simulat)",
      description: `S'ha simulat l'eliminació del nivell d'accés "${level.name}".`,
      variant: "destructive",
    });
  };

  if (!accessLevels || accessLevels.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No hi ha nivells d'accés definits.</p>
        {isAdmin && (
          <Button asChild className="mt-4">
            <Link href="/admin/access-levels/new">Crear Nou Nivell d'Accés</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>
          Llista de nivells d'accés definits. Mostrant {currentAccessLevels.length} de {accessLevels.length} nivells.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] py-2 px-4">ID Nivell</TableHead>
            <TableHead className="py-2 px-4">Nom del Nivell</TableHead>
            {isAdmin && <TableHead className="text-right py-2 px-4">Accions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentAccessLevels.map((level) => (
            <TableRow key={level.id}>
              <TableCell className="font-mono text-xs py-2 px-4">{level.id}</TableCell>
              <TableCell className="font-medium py-2 px-4">{level.name}</TableCell>
              {isAdmin && (
                <TableCell className="text-right space-x-1 py-2 px-4">
                  <Button variant="ghost" size="icon" asChild title="Editar nivell d'accés">
                    <Link href={`/admin/access-levels/${level.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Eliminar nivell d'accés" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Eliminació</AlertDialogTitle>
                        <AlertDialogDescription>
                          Estàs segur que vols eliminar el nivell d'accés {level.name}? Aquesta acció no es pot desfer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAccessLevel(level)}
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
