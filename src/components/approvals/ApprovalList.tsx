
"use client";

import type { Approval, Request as RequestType, User } from "@/types";
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
import { CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
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
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea"; // Importar Textarea
import { Label } from "@/components/ui/label"; // Importar Label

interface ApprovalListProps {
  approvals: Approval[];
  requests: RequestType[];
  users: User[];
  onApprovalAction: (
    approvalId: string, 
    newApprovalStatus: 'approved' | 'rejected',
    requestId: string,
    newRequestStatus: RequestType['status'],
    comments?: string // Nou paràmetre per a comentaris
  ) => void;
}

const ITEMS_PER_PAGE = 10;

const getRequestInfo = (requestId: string, requests: RequestType[]): RequestType | undefined => {
  return requests.find(req => req.id === requestId);
};

const getUserName = (userId: string, users: User[]): string => {
  const user = users.find(u => u.id === userId);
  return user?.name || user?.samAccountName || "N/A";
};

const formatRequestTypeForDisplay = (type: RequestType["type"]): string => {
  switch(type) {
    case "onboarding": return "Alta d'Empleat";
    case "offboarding": return "Baixa d'Empleat";
    case "access": return "Sol·licitud d'Accés";
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

export function ApprovalList({ approvals, requests, users, onApprovalAction }: ApprovalListProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [comment, setComment] = useState("");
  const [currentActionDetails, setCurrentActionDetails] = useState<{ approval: Approval; request: RequestType; type: 'approve' | 'reject' } | null>(null);


  const totalPages = Math.ceil(approvals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApprovals = approvals.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const openActionDialog = (approval: Approval, request: RequestType, type: 'approve' | 'reject') => {
    setCurrentActionDetails({ approval, request, type });
    setComment(approval.comments || ""); // Pre-fill comment if exists (e.g. editing a past decision, though not implemented here)
  };

  const executeAction = () => {
    if (!currentActionDetails) return;

    const { approval, request, type } = currentActionDetails;
    const newRequestStatus = type === 'approve' ? 'approved' : 'rejected'; // Pot ser més complex en el futur

    onApprovalAction(approval.id, type, request.id, newRequestStatus, comment);
    
    toast({
      title: type === 'approve' ? "Sol·licitud Aprovada" : "Sol·licitud Rebutjada",
      description: `La sol·licitud "${request.summary}" ha estat ${type === 'approve' ? 'aprovada' : 'rebutjada'}${comment ? ' amb comentaris.' : '.'}`,
      variant: type === 'approve' ? undefined : "destructive",
    });
    
    setCurrentActionDetails(null); // Tancar el diàleg i resetejar
    setComment(""); // Netejar comentari
  };


  if (!approvals || approvals.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No hi ha aprovacions pendents.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>
          Llista de sol·licituds pendents de la teva aprovació. Mostrant {currentApprovals.length} de {approvals.length} aprovacions.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="py-2 px-4">ID Sol·licitud</TableHead>
            <TableHead className="py-2 px-4">Tipus</TableHead>
            <TableHead className="py-2 px-4">Resum</TableHead>
            <TableHead className="py-2 px-4">Sol·licitant</TableHead>
            <TableHead className="py-2 px-4">Data Sol·licitud</TableHead>
            <TableHead className="text-right py-2 px-4">Accions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentApprovals.map((approval) => {
            const request = getRequestInfo(approval.requestId, requests);
            if (!request) return null; 

            return (
              <TableRow key={approval.id}>
                <TableCell className="font-mono text-xs py-2 px-4">
                  <Link href={`/requests/${request.id}`} className="hover:underline text-primary">
                    {request.id}
                  </Link>
                </TableCell>
                <TableCell className="py-2 px-4">
                  <Badge variant="outline">{formatRequestTypeForDisplay(request.type)}</Badge>
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate py-2 px-4" title={request.summary}>{request.summary}</TableCell>
                <TableCell className="py-2 px-4">{getUserName(request.requesterId, users)}</TableCell>
                <TableCell className="py-2 px-4">{format(new Date(request.createdAt), "P", { locale: ca })}</TableCell>
                <TableCell className="text-right space-x-2 py-2 px-4">
                  <Button variant="ghost" size="icon" asChild title="Veure detalls de la sol·licitud">
                    <Link href={`/requests/${request.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  <AlertDialogTrigger asChild onClick={() => openActionDialog(approval, request, 'approve')}>
                    <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" title="Aprovar">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogTrigger asChild onClick={() => openActionDialog(approval, request, 'reject')}>
                     <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Rebutjar">
                       <XCircle className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TableCell>
              </TableRow>
            );
          })}
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

      {currentActionDetails && (
        <AlertDialog open={!!currentActionDetails} onOpenChange={(open) => !open && setCurrentActionDetails(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirmar {currentActionDetails.type === 'approve' ? 'Aprovació' : 'Rebuig'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Estàs segur que vols {currentActionDetails.type === 'approve' ? 'aprovar' : 'rebutjar'} la sol·licitud "{currentActionDetails.request.summary}"?
                {currentActionDetails.type === 'reject' && " Aquesta acció no es pot desfer."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="approvalComment">Comentaris (opcional)</Label>
              <Textarea
                id="approvalComment"
                placeholder={currentActionDetails.type === 'reject' ? "Motiu del rebuig..." : "Afegeix un comentari..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setCurrentActionDetails(null); setComment(""); }}>Cancel·lar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={executeAction} 
                className={currentActionDetails.type === 'approve' ? "bg-primary hover:bg-primary/90" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}
              >
                {currentActionDetails.type === 'approve' ? 'Aprovar' : 'Rebutjar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

    