
"use client";

import type { RequestTypeDefinition, ChecklistTemplate } from "@/types";
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
import { Edit, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
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
import { sampleRequestTypeDefinitions, sampleChecklistTemplates as defaultChecklistTemplates } from "@/lib/sample-data";

interface RequestTypeDefinitionListProps {
  requestTypes?: RequestTypeDefinition[];
  checklistTemplates?: ChecklistTemplate[];
}

const ITEMS_PER_PAGE = 10;

export function RequestTypeDefinitionList({ 
  requestTypes = sampleRequestTypeDefinitions, 
  checklistTemplates = defaultChecklistTemplates 
}: RequestTypeDefinitionListProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(requestTypes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRequestTypes = requestTypes.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getChecklistTemplateName = (templateId: string): string => {
    const template = checklistTemplates.find(t => t.id === templateId);
    return template?.name || "N/A";
  };

  const handleDelete = (item: RequestTypeDefinition) => {
    console.log(`Simulant eliminació del tipus de sol·licitud: ${item.name}`);
    toast({
      title: "Tipus de Sol·licitud Eliminat (Simulat)",
      description: `S'ha simulat l'eliminació de "${item.name}".`,
      variant: "destructive",
    });
  };

  if (!requestTypes || requestTypes.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No hi ha tipus de sol·licitud definits.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/request-types/new">Crear Nou Tipus de Sol·licitud</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>
          Llista de tipus de sol·licitud definits. Mostrant {currentRequestTypes.length} de {requestTypes.length} tipus.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="py-2 px-4">ID</TableHead>
            <TableHead className="py-2 px-4">Nom</TableHead>
            <TableHead className="py-2 px-4">Aplica A</TableHead>
            <TableHead className="py-2 px-4">Plantilla Checklist Associada</TableHead>
            <TableHead className="text-center py-2 px-4">Actiu</TableHead>
            <TableHead className="text-right py-2 px-4">Accions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentRequestTypes.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs py-2 px-4">{item.id}</TableCell>
              <TableCell className="font-medium py-2 px-4">{item.name}</TableCell>
              <TableCell className="py-2 px-4">
                <Badge variant="secondary">{item.appliesTo.charAt(0).toUpperCase() + item.appliesTo.slice(1)}</Badge>
              </TableCell>
              <TableCell className="py-2 px-4">{getChecklistTemplateName(item.checklistTemplateId)}</TableCell>
              <TableCell className="text-center py-2 px-4">
                {item.isEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500 inline-block" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 inline-block" />
                )}
              </TableCell>
              <TableCell className="text-right space-x-1 py-2 px-4">
                <Button variant="ghost" size="icon" asChild title="Editar tipus de sol·licitud">
                  <Link href={`/admin/request-types/${item.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Eliminar tipus de sol·licitud" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Eliminació</AlertDialogTitle>
                      <AlertDialogDescription>
                        Estàs segur que vols eliminar el tipus de sol·licitud "{item.name}"? Aquesta acció no es pot desfer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item)}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Confirmar Eliminació
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
