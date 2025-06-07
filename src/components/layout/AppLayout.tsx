
"use client";
import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import { Header } from './Header';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import { Briefcase, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { SheetTitle } from '@/components/ui/sheet';

// Internal component that uses the SidebarContext
function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { isMobile } = useSidebar(); // Now called within a child of SidebarProvider

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="items-center">
          <Briefcase className="h-7 w-7 text-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
          <Link href="/dashboard" passHref legacyBehavior>
            <a>
              {isMobile ? (
                <SheetTitle asChild>
                  <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">
                    {APP_NAME}
                  </h1>
                </SheetTitle>
              ) : (
                <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">
                  {APP_NAME}
                </h1>
              )}
            </a>
          </Link>
          <div className="grow" />
          <SidebarTrigger className="hidden md:flex group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav items={NAV_ITEMS} />
        </SidebarContent>
        {user && (
          <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
            <div className="group-data-[collapsible=icon]:hidden flex items-center gap-2 w-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.name || "User Avatar"} data-ai-hint="user avatar"/>
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm overflow-hidden">
                <span className="font-medium truncate">{user.name || user.samAccountName}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email || (Array.isArray(user.departments) ? user.departments.join(', ') : '')}</span>
              </div>
            </div>
             <Button variant="ghost" size="icon" onClick={logout} className="group-data-[collapsible=icon]:my-2">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Tancar Sessió</span>
             </Button>
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true} open={undefined} onOpenChange={undefined}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
