
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

interface SidebarNavProps {
  items: NavItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const { user: currentUser } = useAuth(); // Get current user

  const userRoles = useMemo(() => currentUser?.roles || [], [currentUser]);

  const canUserAccess = React.useCallback(
    (itemAllowedRoles?: string[]): boolean => {
      if (!itemAllowedRoles || itemAllowedRoles.length === 0) {
        return true; // Accessible if no specific roles are defined (i.e., for all authenticated users)
      }
      if (!currentUser) return false; // Should not happen if routing is correct
      return userRoles.some(userRole => itemAllowedRoles.includes(userRole));
    },
    [userRoles, currentUser]
  );

  const processedNavItems = useMemo(() => {
    if (!currentUser) return []; // No items if no user (though AppLayout should handle this)

    return items
      .map(item => {
        // Check direct access to the item itself
        if (!canUserAccess(item.allowedRoles)) {
          return null;
        }

        // If it has a submenu, filter its children
        if (item.submenu) {
          const visibleSubmenu = item.submenu.filter(subItem =>
            // Subitem inherits parent's roles if it doesn't have its own defined.
            // If subItem.allowedRoles is defined, it overrides parent's.
            canUserAccess(subItem.allowedRoles || item.allowedRoles)
          );

          // If the parent is just a container (href="#") and has no visible children, hide the parent.
          if (item.href === "#" && visibleSubmenu.length === 0) {
            return null;
          }
          return { ...item, submenu: visibleSubmenu };
        }
        return item;
      })
      .filter(Boolean) as NavItem[]; // Filter out nulls (items user cannot access)
  }, [items, canUserAccess, currentUser]);


  if (!processedNavItems?.length) {
    return null;
  }

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <SidebarMenu>
      {processedNavItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = item.href !== "#" && (pathname === item.href || (item.href !== "/dashboard" && item.href !== "/" && pathname.startsWith(item.href)));
        
        const isSubmenuEffectivelyOpen = openSubmenus[item.label] || 
          (item.submenu && item.submenu.some(subItem => pathname.startsWith(subItem.href)));

        if (item.submenu && item.submenu.length > 0) { // Only render submenu if it has visible items
          return (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                onClick={() => toggleSubmenu(item.label)}
                className={cn(
                  "w-full justify-between",
                   item.submenu.some(subItem => pathname.startsWith(subItem.href)) && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                isActive={item.submenu.some(subItem => pathname.startsWith(subItem.href))}
                tooltip={item.label}
              >
                <div className="flex items-center">
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {isSubmenuEffectivelyOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </SidebarMenuButton>
              {isSubmenuEffectivelyOpen && (
                <SidebarMenuSub>
                  {item.submenu.map((subItem, subIndex) => {
                    const SubIcon = subItem.icon;
                    const isSubmenuItemActive = pathname.startsWith(subItem.href);
                    return (
                      <SidebarMenuSubItem key={subIndex}>
                        <Link href={subItem.href} legacyBehavior passHref>
                          <SidebarMenuSubButton
                            asChild={false}
                            isActive={isSubmenuItemActive}
                            className={cn(isSubmenuItemActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
                          >
                            <SubIcon className="mr-2 h-4 w-4" />
                            <span>{subItem.label}</span>
                          </SidebarMenuSubButton>
                        </Link>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          );
        }

        // Render top-level items that are not just containers for submenus (i.e., have a real href)
        if (item.href !== "#") {
          return (
            <SidebarMenuItem key={index}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild={false}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        }
        return null; // Should not happen if parent with href="#" and no visible submenu was filtered out
      })}
    </SidebarMenu>
  );
}
