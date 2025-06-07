
"use client";

import { sampleChecklistTemplates, sampleRequestTypeDefinitions } from "@/lib/sample-data";
import type { ChecklistTemplate, RequestTypeDefinition } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
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
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/lib/constants';

const ITEMS_PER_PAGE = 10;

export function ChecklistTemplateManager() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [managedTemplates, setManagedTemplates] = useState<ChecklistTemplate[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setManagedTemplates([...sampleChecklistTemplates]);
  }, []);

  const isAdmin = currentUser?.roles.includes(ROLES.ADMIN);

  const totalPages = Math.ceil(managedTemplates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTemplates = managedTemplates.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleDeleteTemplate = (templateToDelete: ChecklistTemplate) => {
    const usedByRequestTypes = sampleRequestTypeDefinitions.filter(
      rt => rt.checklistTemplateId === templateToDelete.id
    );

    if (usedByRequestTypes.length > 0) {
       toast({
        title: "Eliminació Bloquejada: Plantilla en Ús",
        description: `La plantilla "${templateToDelete.name}" està sent utilitzada per ${usedByRequestTypes.length} tipus de sol·licitud (${usedByRequestTypes.map(rt => rt.name).join(', ')}). Si us plau, actualitza aquests tipus de sol·licitud primer o assigna'ls una altra plantilla.`,
        variant: "destructive",
        duration: 8000,
      });
      return; 
    }

    const indexInGlobal = sampleChecklistTemplates.findIndex(t => t.id === templateToDelete.id);
    if (indexInGlobal > -1) {
      sampleChecklistTemplates.splice(indexInGlobal, 1);
    }

    setManagedTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateToDelete.id));
    
    // Ajustar la pàgina actual si l'últim element de la pàgina s'elimina
    if (currentTemplates.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }

    toast({
      title: "Plantilla Eliminada",
      description: `S'ha eliminat la plantilla "${templateToDelete.name}".`,
      variant: "destructive",
    });
  };


  if (managedTemplates.length === 0 && sampleChecklistTemplates.length > 0) {
     return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Carregant plantilles...</p>
        </CardContent>
      </Card>
    );
  }


  if (currentTemplates.length === 0 && currentPage === 1 && managedTemplates.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No hi ha plantilles de checklist definides.</p>
          {isAdmin && (
             <Button asChild className="mt-4">
                <Link href="/admin/checklist-templates/new">Nova Plantilla</Link>
             </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        <Table>
          <TableCaption>
            Llista de plantilles de checklist disponibles. Mostrant {currentTemplates.length} de {managedTemplates.length} plantilles.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="py-2 px-4">Nom de la Plantilla</TableHead>
              <TableHead className="py-2 px-4">Identificador (deprecated)</TableHead>
              <TableHead className="text-center py-2 px-4">Nº de Tasques</TableHead>
              {isAdmin && <TableHead className="text-right py-2 px-4">Accions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium py-2 px-4">
                  <Link href={`/admin/checklist-templates/${template.id}/edit`} className="hover:underline">
                    {template.name}
                  </Link>
                </TableCell>
                <TableCell className="py-2 px-4">
                  <Badge variant="outline">{template.requestTypeIdentifier}</Badge>
                </TableCell>
                <TableCell className="text-center py-2 px-4">{template.taskTemplates.length}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right space-x-1 py-2 px-4">
                    <Button variant="ghost" size="icon" asChild title="Editar plantilla">
                      <Link href={`/admin/checklist-templates/${template.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Eliminar plantilla">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Eliminació</AlertDialogTitle>
                          <AlertDialogDescription>
                            Estàs segur que vols eliminar la plantilla "{template.name}"? Aquesta acció no es pot desfer.
                            Si aquesta plantilla està en ús per algun Tipus de Sol·licitud, primer hauràs d'actualitzar-lo.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTemplate(template)}
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
      </CardContent>
    </Card>
  );
}
