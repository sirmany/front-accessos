
"use client";

import { Bell, LogOut, UserCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { APP_NAME } from '@/lib/constants';
import Link from 'next/link'; 
import { sampleNotifications } from '@/lib/sample-data';
import type { NotificationItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ca } from 'date-fns/locale';
import { Badge } from '../ui/badge';

export function Header() {
  const { isMobile } = useSidebar();
  const { user, logout } = useAuth();

  // Per ara, les notificacions no es marquen com a llegides, així que sempre mostrem un recompte.
  // Més endavant, això seria dinàmic.
  const unreadNotificationsCount = sampleNotifications.filter(n => !n.read).length;


  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      {isMobile && <SidebarTrigger />}
      <div className="flex-1">
         <h1 className="text-lg font-semibold md:hidden">{APP_NAME}</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4"> {/* Reduït gap per a pantalles petites */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notificacions" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 min-w-0 p-0 flex items-center justify-center text-xs rounded-full"
                >
                  {unreadNotificationsCount}
                </Badge>
              )}
              <span className="sr-only">Notificacions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 md:w-96"> {/* Amplada del desplegable */}
            <DropdownMenuLabel className="flex justify-between items-center">
              Notificacions
              {unreadNotificationsCount > 0 && <Badge variant="secondary">{unreadNotificationsCount} Noves</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {sampleNotifications.length > 0 ? (
                sampleNotifications.slice(0, 5).map((notification: NotificationItem) => ( // Mostra màxim 5
                  <DropdownMenuItem key={notification.id} asChild className={!notification.read ? "font-semibold" : ""}>
                    <Link href={notification.href || "#"} className="block w-full">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                        <p className="text-xs text-muted-foreground/70">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ca })}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No tens notificacions.</DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              {/* Aquest enllaç portarà a una futura pàgina de notificacions */}
              <Link href="/notifications" className="flex items-center justify-center text-sm text-primary hover:underline">
                Veure totes les notificacions
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.name || "User Avatar"} data-ai-hint="user avatar" />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user.name || user.samAccountName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Tancar Sessió</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
