
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, UserCircle, Mail, Building, Shield, Hash, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeColorPicker } from '@/components/debug/ThemeColorPicker'; // Nova importació

export default function UserProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <PageHeader
          title="Perfil d'Usuari"
          description="Carregant informació de l'usuari..."
        />
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <p>Si us plau, espera mentre es carrega la informació del teu perfil.</p>
            <p>Si no estàs autenticat, seràs redirigit a l'inici de sessió.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const userDisplayName = user.name || user.samAccountName;

  return (
    <>
      <PageHeader
        title={`Perfil de: ${userDisplayName}`}
        description="Consulta i gestiona la informació del teu compte."
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar al Panell
          </Link>
        </Button>
      </PageHeader>

      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
            <AvatarImage src={user.avatarUrl} alt={userDisplayName} data-ai-hint="user large avatar"/>
            <AvatarFallback className="text-3xl">{getInitials(userDisplayName)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{userDisplayName}</CardTitle>
          {user.role && <CardDescription>{Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <UserCircle className="mr-2 h-4 w-4" />
                Nom d'Usuari (Login)
              </h3>
              <p className="text-lg">{user.samAccountName}</p>
            </div>
            {user.name && user.name !== user.samAccountName && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Nom Complet
                </h3>
                <p className="text-lg">{user.name}</p>
              </div>
            )}
            {user.email && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Correu Electrònic
                </h3>
                <p className="text-lg">{user.email}</p>
              </div>
            )}
            {user.nif && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Hash className="mr-2 h-4 w-4" />
                  NIF
                </h3>
                <p className="text-lg">{user.nif}</p>
              </div>
            )}
          </div>

          {user.roles && user.roles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Rols de l'Aplicació
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role, index) => (
                  <Badge key={index} variant="secondary" className="text-base px-3 py-1">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {user.departments && user.departments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Departaments
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(user.departments) ? user.departments.map((dept, index) => (
                  <Badge key={index} variant="outline" className="text-base px-3 py-1">
                    {dept}
                  </Badge>
                )) : (
                     <Badge variant="outline" className="text-base px-3 py-1">
                        {user.departments}
                    </Badge>
                )
                }
              </div>
            </div>
          )}

           {user.department && (!user.departments || user.departments.length === 0) && (
             <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                Departament Principal (Info Login)
              </h3>
               <Badge variant="outline" className="text-base px-3 py-1">
                {user.department}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selector de tema temporal només per a desenvolupament */}
      {typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && (
        <div className="mt-12">
          <ThemeColorPicker />
        </div>
      )}
    </>
  );
}
