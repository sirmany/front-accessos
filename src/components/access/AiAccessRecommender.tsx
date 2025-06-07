
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { getAccessRecommendations, AccessRecommendationsInput, AccessRecommendationsOutput } from '@/ai/flows/access-recommendations';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EMPLOYEE_ROLES } from '@/lib/constants';
import { sampleDepartments } from '@/lib/sample-data'; // Changed import

interface AiAccessRecommenderProps {
  onRecommendations: (recommendations: AccessRecommendationsOutput) => void;
  initialRole?: string;
  initialDepartment?: string;
}

export function AiAccessRecommender({ onRecommendations, initialRole, initialDepartment }: AiAccessRecommenderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AccessRecommendationsOutput | null>(null);
  
  const [role, setRole] = useState(initialRole || '');
  const [department, setDepartment] = useState(initialDepartment || '');

  const handleGetRecommendations = async () => {
    if (!role || !department) {
      setError("Si us plau, seleccioneu un rol i un departament.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      const input: AccessRecommendationsInput = { role, department };
      const result = await getAccessRecommendations(input);
      setRecommendations(result);
      onRecommendations(result); // Callback to parent component
    } catch (err) {
      console.error("Error getting AI recommendations:", err);
      setError("No s'han pogut obtenir les recomanacions. Intenta-ho de nou.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-accent" />
          Recomanacions d'Accés amb IA
        </CardTitle>
        <CardDescription>
          Obtén suggeriments d'accés basats en el rol i departament de l'empleat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="ai-role">Rol de l'Empleat</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="ai-role">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ai-department">Departament</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger id="ai-department">
                <SelectValue placeholder="Selecciona un departament" />
              </SelectTrigger>
              <SelectContent>
                {sampleDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleGetRecommendations} disabled={isLoading || !role || !department}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Obtenir Recomanacions
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recommendations && !error && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold">Recomanacions Obtingudes:</h4>
            <Alert>
              <AlertTitle>Nivells d'Accés Recomanats:</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5">
                  {recommendations.recommendedAccessLevels.map((level, index) => (
                    <li key={index}>{level}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertTitle>Justificació:</AlertTitle>
              <AlertDescription>
                {recommendations.justification}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">Pots utilitzar aquestes recomanacions per completar la sol·licitud d'accés.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
