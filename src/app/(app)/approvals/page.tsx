"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { ApprovalList } from "@/components/approvals/ApprovalList";
import { sampleApprovals, sampleRequests, sampleAppUsers, sampleNotifications } from "@/lib/sample-data";
import type { Approval, Request as RequestType, User, NotificationItem } from "@/types";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { generateMockId } from '@/lib/id-generator';
import { withAuthRole } from "@/components/auth/withAuthRole";
import { ROLES } from "@/lib/constants";

function ApprovalsPageInternal() {
  const { user: currentUser } = useAuth();
  
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setApprovals([...sampleApprovals]);
    setRequests([...sampleRequests]);
    setUsers([...sampleAppUsers]);
  }, []);

  const handleApprovalAction = (
    approvalId: string, 
    newApprovalStatus: 'approved' | 'rejected',
    requestId: string,
    newRequestStatus: RequestType['status'],
    comments?: string
  ) => {
    const now = new Date().toISOString();
    
    const updatedApprovals = approvals.map(appr => 
      appr.id === approvalId 
        ? { ...appr, status: newApprovalStatus, updatedAt: now, approvedAt: now, comments: comments || appr.comments } 
        : appr
    );
    setApprovals(updatedApprovals);
    const approvalIndexGlobal = sampleApprovals.findIndex(a => a.id === approvalId);
    if (approvalIndexGlobal > -1) {
        const globalApproval = updatedApprovals.find(a => a.id === approvalId);
        if (globalApproval) {
            sampleApprovals[approvalIndexGlobal] = globalApproval;
        }
    }

    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        const updatedReq = { ...req, status: newRequestStatus, updatedAt: now };
        if (newApprovalStatus === 'rejected' && comments) {
          updatedReq.details = { ...updatedReq.details, rejectionReason: comments };
        }
        return updatedReq;
      }
      return req;
    });
    setRequests(updatedRequests);
    const requestIndexGlobal = sampleRequests.findIndex(r => r.id === requestId);
    if (requestIndexGlobal > -1) {
        const globalRequest = updatedRequests.find(r => r.id === requestId);
        if (globalRequest) {
            sampleRequests[requestIndexGlobal] = globalRequest;
        }
    }

    const affectedRequest = sampleRequests.find(r => r.id === requestId);
    const newNotificationId = generateMockId("notif_appr");
    const newNotification: NotificationItem = {
      id: newNotificationId,
      title: "Acció d'Aprovació Realitzada",
      description: `La sol·licitud "${affectedRequest?.summary || requestId}" ha estat ${newApprovalStatus === 'approved' ? 'aprovada' : 'rebutjada'} per tu.`,
      createdAt: now,
      read: false,
      href: `/requests/${requestId}`
    };
    sampleNotifications.unshift(newNotification);
    console.log("New notification generated for approval action:", newNotification);
    console.log("Current notifications:", sampleNotifications.length);
  };

  const pendingUserApprovals = currentUser
    ? approvals.filter(approval => approval.approverId === currentUser.id && approval.status === 'pending')
    : [];

  return (
    <>
      <PageHeader 
        title="Aprovacions Pendents"
        description="Revisa i aprova o rebutja les sol·licituds que requereixen la teva validació."
      />
      {currentUser ? (
        pendingUserApprovals.length > 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <ApprovalList
                approvals={pendingUserApprovals}
                requests={requests}
                users={users}
                onApprovalAction={handleApprovalAction}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No tens cap aprovació pendent.</p>
            </CardContent>
          </Card>
        )
      ) : (
         <Card className="shadow-lg">
            <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Carregant informació d'usuari...</p>
            </CardContent>
          </Card>
      )}
    </>
  );
}

export default withAuthRole(ApprovalsPageInternal, [ROLES.MANAGER, ROLES.IT, ROLES.ADMIN, ROLES.RRHH]);