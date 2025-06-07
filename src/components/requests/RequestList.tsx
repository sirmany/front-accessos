
"use client";

import type { Request, Employee, RequestStatus } from "@/types"; // Added RequestStatus
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
import { Eye, FilePlus2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { sampleRequests, sampleEmployees } from "@/lib/sample-data";
import React, { useState } from "react";

interface RequestListProps {
  requests?: Request[];
  employees?: Employee[];
}

const ITEMS_PER_PAGE = 10;

const getEmployeeName = (employeeId?: string, employeesList: Employee[] = sampleEmployees): string => {
  if (!employeeId) return "N/A";
  const employee = employeesList.find(emp => emp.id === employeeId);
  return employee?.fullName || `ID: ${employeeId}`;
};

const getStatusVariant = (status: RequestStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "approved":
    case "completed":
      return "default"; 
    case "rejected":
    case "cancelled":
      return "destructive";
    case "pending":
    case "inProgress":
    case "pendingManagerApproval":
    case "pendingHRProcessing":
    case "pendingITProcessing":
    case "pendingFinalValidation":
    default:
      return "secondary"; 
  }
};

const getStatusColorClass = (status: RequestStatus): string => {
  switch (status) {
    case "approved":
    case "completed":
      return "bg-green-500/20 text-green-700 border-green-400";
    case "rejected":
    case "cancelled":
      return "bg-red-500/20 text-red-700 border-red-400";
    case "pending":
      return "bg-yellow-500/20 text-yellow-700 border-yellow-400";
    case "inProgress":
    case "pendingHRProcessing":
    case "pendingITProcessing":
      return "bg-blue-500/20 text-blue-700 border-blue-400";
    case "pendingManagerApproval":
      return "bg-orange-500/20 text-orange-700 border-orange-400"; 
    case "pendingFinalValidation":
      return "bg-purple-500/20 text-purple-700 border-purple-400";
    default:
      return "bg-gray-500/20 text-gray-700 border-gray-400";
  }
}

// Helper function to format status for display
const formatStatusForDisplay = (status: RequestStatus): string => {
  const statusMap: Record<RequestStatus, string> = {
    pending: "Pendent",
    pendingManagerApproval: "Pendent Aprov. Gestor",
    pendingHRProcessing: "Pendent RRHH",
    pendingITProcessing: "Pendent IT",
    pendingFinalValidation: "Pendent Valid. Final",
    inProgress: "En Curs",
    approved: "Aprovada",
    rejected: "Rebutjada",
    completed: "Completada",
    cancelled: "Cancel·lada",
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};


const formatType = (type: Request["type"]): string => {
  switch(type) {
    case "onboarding": return "Alta";
    case "offboarding": return "Baixa";
    case "access": return "Accés";
    default: return type;
  }
}

export function RequestList({ requests = sampleRequests, employees = sampleEmployees }: RequestListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort requests by creation date, newest first
  const sortedRequests = [...requests].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRequests = sortedRequests.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg shadow-md bg-card border">
        <Image
            src="https://placehold.co/300x200.png"
            alt="No s'han trobat sol·licituds"
            width={300} height={200}
            className="mb-6 rounded-md"
            data-ai-hint="empty state illustration"
        />
        <h3 className="text-xl font-semibold mb-2">No s'han trobat sol·licituds</h3>
        <p className="text-muted-foreground">Actualment no hi ha sol·licituds registrades al sistema o que coincideixin amb la teva cerca.</p>
        <div className="mt-4 flex gap-2">
            <Button asChild>
                <Link href="/employees/new"><FilePlus2 className="mr-2 h-4 w-4" /> Nova Sol·licitud d'Alta</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/requests/new-access">Nova Sol·licitud d'Accés</Link>
            </Button>
        </div>
      </div>
    );
  }
  return (
    <>
      <Table>
        <TableCaption>
          Llista de sol·licituds registrades al sistema. Mostrant {currentRequests.length} de {requests.length} sol·licituds.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="py-2 px-4">ID</TableHead>
            <TableHead className="py-2 px-4">Tipus</TableHead>
            <TableHead className="py-2 px-4">Resum</TableHead>
            <TableHead className="py-2 px-4">Empleat Afectat</TableHead>
            <TableHead className="py-2 px-4">Sol·licitant</TableHead>
            <TableHead className="py-2 px-4">Estat</TableHead>
            <TableHead className="py-2 px-4">Data Creació</TableHead>
            <TableHead className="text-right py-2 px-4">Accions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-mono text-xs py-2 px-4">{request.id}</TableCell>
              <TableCell className="py-2 px-4">{formatType(request.type)}</TableCell>
              <TableCell className="font-medium max-w-xs truncate py-2 px-4" title={request.summary}>{request.summary}</TableCell>
              <TableCell className="py-2 px-4">{getEmployeeName(request.employeeId || request.targetEmployeeId, employees)}</TableCell>
              <TableCell className="py-2 px-4">{getEmployeeName(request.requesterId, employees)}</TableCell>
              <TableCell className="py-2 px-4">
                <Badge variant={getStatusVariant(request.status)} className={getStatusColorClass(request.status)}>
                  {formatStatusForDisplay(request.status)}
                </Badge>
              </TableCell>
              <TableCell className="py-2 px-4">{format(new Date(request.createdAt), "P p", { locale: ca })}</TableCell>
              <TableCell className="text-right space-x-2 py-2 px-4">
                <Button variant="ghost" size="icon" asChild title="Veure detalls">
                  <Link href={`/requests/${request.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
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
