
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Request as RequestType, Department } from '@/types';
import { sampleRequests, sampleNotifications }
from '@/lib/sample-data';
import { ArrowRightLeft } from 'lucide-react';
import { generateMockId } from '@/lib/id-generator';

interface RequestTransferControlsProps {
  request: RequestType;
  departments: Department[];
}

export function RequestTransferControls({ request, departments }: RequestTransferControlsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string>(request.assignedDepartment || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    if (!selectedDepartmentName || selectedDepartmentName === request.assignedDepartment) {
      toast({
        title: "Sense Canvis",
        description: "Selecciona un departament diferent per transferir la sol·licitud.",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);

    const requestIndex = sampleRequests.findIndex(r => r.id === request.id);
    if (requestIndex !== -1) {
      const oldDepartment = sampleRequests[requestIndex].assignedDepartment;
      sampleRequests[requestIndex].assignedDepartment = selectedDepartmentName;
      sampleRequests[requestIndex].updatedAt = new Date().toISOString();
      
      // Canvi d'estat potencial (simplificat per ara)
      if (request.type === 'onboarding' && oldDepartment === 'Informàtica' && selectedDepartmentName === 'Recursos Humans') {
        sampleRequests[requestIndex].status = 'pendingHRProcessing';
      } else if (request.status === 'pendingManagerApproval' || request.status === 'pendingFinalValidation') {
        // Si estava pendent d'aprovació/validació i es transfereix, potser torna a un estat general pendent.
        sampleRequests[requestIndex].status = 'pending'; 
      }


      toast({
        title: "Sol·licitud Transferida",
        description: `La sol·licitud ${request.id} ha estat transferida a ${selectedDepartmentName}.`,
      });

      const newNotificationId = generateMockId("notif_transfer");
      const newNotification = {
        id: newNotificationId,
        title: "Sol·licitud Transferida",
        description: `La sol·licitud "${request.summary || request.id}" ha estat transferida de ${oldDepartment || 'N/A'} a ${selectedDepartmentName}.`,
        createdAt: new Date().toISOString(),
        read: false,
        href: `/requests/${request.id}`
      };
      sampleNotifications.unshift(newNotification);

      router.refresh();
    } else {
      toast({
        title: "Error",
        description: "No s'ha pogut trobar la sol·licitud per transferir.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="mt-6 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowRightLeft className="mr-2 h-5 w-5 text-primary" />
          Transferir Sol·licitud
        </CardTitle>
        <CardDescription>
          Reassigna aquesta sol·licitud a un altre departament per a la seva gestió.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="current-department">Departament Assignat Actualment:</Label>
          <p id="current-department" className="font-semibold">{request.assignedDepartment || "Cap departament assignat"}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="transfer-department">Transferir a Departament:</Label>
          <div className="flex items-center gap-2">
            <Select
              value={selectedDepartmentName}
              onValueChange={setSelectedDepartmentName}
            >
              <SelectTrigger id="transfer-department" className="flex-grow">
                <SelectValue placeholder="Selecciona un departament" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleTransfer} disabled={isLoading || !selectedDepartmentName || selectedDepartmentName === request.assignedDepartment}>
              {isLoading ? "Transferint..." : "Transferir"}
            </Button>
          </div>
        </div>
        {request.type === 'onboarding' && request.assignedDepartment === 'Informàtica' && selectedDepartmentName === 'Recursos Humans' && (
            <p className="text-xs text-muted-foreground">Nota: En transferir d'IT a RRHH per una alta, l'estat canviarà a 'Pendent Processament RRHH'.</p>
        )}
      </CardContent>
    </Card>
  );
}
