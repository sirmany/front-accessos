
"use client";

import type { User } from "@/types";
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
import { Edit, Trash2, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
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
import { sampleAppUsers, sampleRequests, sampleTasks, sampleApprovals, sampleSystems } from "@/lib/sample-data";
import { useAuth } from '@/context/AuthContext'; 
import { ROLES } from '@/lib/constants'; 

interface UserListProps {
  users?: User[]; 
}

const ITEMS_PER_PAGE = 10;

export function UserList({ users: initialUsers }: UserListProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth(); 
  const [managedUsers, setManagedUsers] = useState<User[]>(initialUsers || [...sampleAppUsers]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setManagedUsers(initialUsers || [...sampleAppUsers]);
  }, [initialUsers]);


  const totalPages = Math.ceil(managedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = managedUsers.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleDeleteUser = (userToDelete: User) => {
    // Comprovació de dependències
    const activeRequestsAsRequester = sampleRequests.filter(
      req => req.requesterId === userToDelete.id && !['completed', 'cancelled', 'rejected'].includes(req.status)
    );
    const activeTasksAsAssignee = sampleTasks.filter(
      task => task.assigneeId === userToDelete.id && task.status !== 'completed'
    );
    const pendingApprovalsAsApprover = sampleApprovals.filter(
      appr => appr.approverId === userToDelete.id && appr.status === 'pending'
    );
    const systemsRequiringApprovalByUser = sampleSystems.filter(
      sys => sys.requiresApprovalBy === `Usuari: ${userToDelete.name}` || sys.requiresApprovalBy === `Usuari: ${userToDelete.samAccountName}`
    );

    let blockingDependencies: string[] = [];
    if (activeRequestsAsRequester.length > 0) {
      blockingDependencies.push(`és sol·licitant de ${activeRequestsAsRequester.length} sol·licitud(s) activa(es)`);
    }
    if (activeTasksAsAssignee.length > 0) {
      blockingDependencies.push(`té ${activeTasksAsAssignee.length} tasca(es) activa(es) assignada(es)`);
    }
    if (pendingApprovalsAsApprover.length > 0) {
      blockingDependencies.push(`té ${pendingApprovalsAsApprover.length} aprovació(ns) pendent(s)`);
    }
    if (systemsRequiringApprovalByUser.length > 0) {
      blockingDependencies.push(`és aprovador designat per a ${systemsRequiringApprovalByUser.length} sistema(es) (${systemsRequiringApprovalByUser.map(s => s.name).join(', ')})`);
    }

    if (blockingDependencies.length > 0) {
      toast({
        title: "Eliminació Bloquejada",
        description: `L'usuari "${userToDelete.name || userToDelete.samAccountName}" no es pot eliminar perquè ${blockingDependencies.join('; ')}. Si us plau, resol aquestes dependències primer.`,
        variant: "destructive",
        duration: 8000,
      });
      return;
    }

    // Procedir amb l'eliminació si no hi ha dependències
    const indexInGlobal = sampleAppUsers.findIndex(u => u.id === userToDelete.id);
    if (indexInGlobal > -1) {
      sampleAppUsers.splice(indexInGlobal, 1);
    }

    setManagedUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));

    if (currentUsers.length === 1 && currentPage > 1 && totalPages > 1) {
      setCurrentPage(currentPage - 1);
    }
    
    toast({
      title: "Usuari Eliminat",
      description: `S'ha eliminat l'usuari "${userToDelete.name || userToDelete.samAccountName}".`,
      variant: "destructive",
    });
  };
  
  const isAdmin = currentUser?.roles.includes(ROLES.ADMIN);

  if (managedUsers.length === 0 && sampleAppUsers.length > 0 && !initialUsers) {
     return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Carregant usuaris...</p>
      </div>
    );
  }


  if (currentUsers.length === 0 && currentPage === 1 && managedUsers.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No hi ha usuaris de l'aplicació definits.</p>
        {isAdmin && (
          <Button asChild className="mt-4">
            <Link href="/admin/users/new">Crear Nou Usuari</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>
          Llista d'usuaris de l'aplicació Gestió Sol·licituds. Mostrant {currentUsers.length} de {managedUsers.length} usuaris.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="py-2 px-4">SamAccountName</TableHead>
            <TableHead className="py-2 px-4">Nom Complet</TableHead>
            <TableHead className="py-2 px-4">Email</TableHead>
            <TableHead className="py-2 px-4">NIF</TableHead>
            <TableHead className="py-2 px-4">Rols</TableHead>
            <TableHead className="py-2 px-4">Departaments</TableHead>
            {isAdmin && <TableHead className="text-right py-2 px-4">Accions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-mono text-xs py-2 px-4">{user.samAccountName}</TableCell>
              <TableCell className="font-medium py-2 px-4">{user.name || "-"}</TableCell>
              <TableCell className="py-2 px-4">{user.email || "-"}</TableCell>
              <TableCell className="py-2 px-4">{user.nif || "-"}</TableCell>
              <TableCell className="py-2 px-4">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">Sense rols</Badge>
                )}
              </TableCell>
              <TableCell className="py-2 px-4">
                {user.departments && user.departments.length > 0 ? (
                  user.departments.map((dept, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {dept}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">Sense departaments</Badge>
                )}
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right space-x-1 py-2 px-4">
                  <Button variant="ghost" size="icon" asChild title="Veure dashboard de l'usuari">
                    <Link href={`/admin/users/${user.id}/dashboard`}>
                      <LayoutDashboard className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild title="Editar usuari">
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Eliminar usuari" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Eliminació</AlertDialogTitle>
                        <AlertDialogDescription>
                          Estàs segur que vols eliminar l'usuari {user.name || user.samAccountName}? Aquesta acció no es pot desfer.
                          L'eliminació d'usuaris amb tasques o sol·licituds assignades pot afectar l'històric del sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user)}
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

