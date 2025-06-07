
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BellRing, CheckCheck, MailWarning } from "lucide-react";
import { sampleNotifications } from "@/lib/sample-data";
import type { NotificationItem } from "@/types";
import { formatDistanceToNow, format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Ordenar per data, les més noves primer
    setNotifications([...sampleNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const handleMarkAllAsRead = () => {
    const allRead = notifications.every(n => n.read);
    if (allRead) {
        toast({
            title: "Sense canvis",
            description: "Totes les notificacions ja estaven marcades com a llegides.",
        });
        return;
    }

    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    // Actualitzar l'array global (simulació)
    sampleNotifications.forEach(n => n.read = true);
    toast({
      title: "Notificacions Actualitzades",
      description: "Totes les notificacions s'han marcat com a llegides.",
    });
  };

  const handleMarkAsRead = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && notification.read) {
         toast({
            title: "Ja llegida",
            description: "Aquesta notificació ja estava marcada com a llegida.",
        });
        return;
    }

    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    const globalNotification = sampleNotifications.find(n => n.id === id);
    if (globalNotification) {
      globalNotification.read = true;
    }
    toast({
      title: "Notificació Llegida",
      description: `La notificació "${notification?.title || id}" s'ha marcat com a llegida.`,
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <PageHeader
        title="Totes les Notificacions"
        description={`Tens ${unreadCount} notificacions no llegides.`}
      >
        {notifications.length > 0 && (
          <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar Totes com a Llegides
          </Button>
        )}
      </PageHeader>

      {notifications.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <BellRing className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold">No tens notificacions</p>
            <p className="text-muted-foreground">Quan hi hagi novetats, apareixeran aquí.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Card key={notification.id} className={`shadow-md hover:shadow-lg transition-shadow ${!notification.read ? 'border-primary border-2' : 'border'}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg mb-1">{notification.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {format(new Date(notification.createdAt), "PPP p", { locale: ca })}
                       ({formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ca })})
                    </CardDescription>
                  </div>
                  {!notification.read && (
                    <Badge variant="destructive" className="whitespace-nowrap">Nova</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{notification.description}</p>
                <div className="flex justify-end space-x-2">
                  {!notification.read && (
                    <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                      Marcar com a llegida
                    </Button>
                  )}
                  {notification.href && (
                    <Button variant="default" size="sm" asChild>
                      <Link href={notification.href}>Veure Detall</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

    