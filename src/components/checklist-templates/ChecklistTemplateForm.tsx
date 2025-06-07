
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import type { ChecklistTemplate, TaskTemplate } from "@/types";
import { sampleChecklistTemplates, sampleDepartments } from "@/lib/sample-data";
import { PlusCircle, Trash2, Edit, Save, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateMockId } from "@/lib/id-generator";

const taskTemplateSchema = z.object({
  id: z.string(),
  title: z.string().min(3, { message: "El títol de la tasca ha de tenir almenys 3 caràcters." }),
  description: z.string().optional(),
  assigneeDepartment: z.string().min(1, { message: "S'ha d'assignar un departament." }),
  order: z.number().min(1, { message: "L'ordre ha de ser almenys 1." }).optional(),
});

const checklistTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "El nom de la plantilla ha de tenir almenys 3 caràcters." }),
  requestTypeIdentifier: z.string().min(1, { message: "L'identificador és requerit." }),
  description: z.string().optional(),
  taskTemplates: z.array(taskTemplateSchema).min(0),
});

type ChecklistTemplateFormValues = z.infer<typeof checklistTemplateSchema>;
type TaskTemplateFormValues = z.infer<typeof taskTemplateSchema>;

interface ChecklistTemplateFormProps {
  template?: ChecklistTemplate;
}

export function ChecklistTemplateForm({ template }: ChecklistTemplateFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!template;

  const [taskToEditData, setTaskToEditData] = useState<TaskTemplateFormValues | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);

  const form = useForm<ChecklistTemplateFormValues>({
    resolver: zodResolver(checklistTemplateSchema),
    defaultValues: {
      id: template?.id || "",
      name: template?.name || "",
      requestTypeIdentifier: template?.requestTypeIdentifier || "",
      description: template?.description || "",
      taskTemplates: template?.taskTemplates?.map((t, index) => ({...t, order: t.order || index + 1 })).sort((a,b) => (a.order || 0) - (b.order || 0)) || [],
    },
  });

  const { fields, append, remove, update, move } = useFieldArray({
    control: form.control,
    name: "taskTemplates",
  });

  const reorderTasksAndUpdateForm = (newTasks: TaskTemplateFormValues[]) => {
    const reorderedTasks = newTasks.map((task, index) => ({
      ...task,
      order: index + 1,
    }));
    form.setValue("taskTemplates", reorderedTasks, { shouldValidate: true, shouldDirty: true });
  };

  const handleMoveTaskUp = (index: number) => {
    if (index > 0) {
      const currentTasks = form.getValues("taskTemplates");
      const newTasks = [...currentTasks];
      const taskToMove = newTasks[index];
      const taskAbove = newTasks[index - 1];
      newTasks[index - 1] = taskToMove;
      newTasks[index] = taskAbove;
      reorderTasksAndUpdateForm(newTasks);
    }
  };

  const handleMoveTaskDown = (index: number) => {
    const currentTasks = form.getValues("taskTemplates");
    if (index < currentTasks.length - 1) {
      const newTasks = [...currentTasks];
      const taskToMove = newTasks[index];
      const taskBelow = newTasks[index + 1];
      newTasks[index + 1] = taskToMove;
      newTasks[index] = taskBelow;
      reorderTasksAndUpdateForm(newTasks);
    }
  };

  const onSubmit = (data: ChecklistTemplateFormValues) => {
    setIsLoading(true);

    const templateId = isEditMode && template ? template.id : (data.id || generateMockId("clt"));

    const finalData: ChecklistTemplate = {
        ...data,
        id: templateId,
        taskTemplates: data.taskTemplates.map((task, index) => ({
            ...task,
            id: task.id.startsWith('task_new_') || task.id.startsWith('task_local_') ? generateMockId("task") : task.id,
            order: index + 1, 
        }))
    };

    if (isEditMode && template) {
      const templateIndex = sampleChecklistTemplates.findIndex(t => t.id === template.id);
      if (templateIndex !== -1) {
        sampleChecklistTemplates[templateIndex] = finalData;
      }
      toast({
        title: "Plantilla Actualitzada",
        description: `S'han guardat els canvis per a la plantilla "${finalData.name}".`,
      });
    } else {
      if (sampleChecklistTemplates.some(t => t.id === templateId) && data.id) {
         form.setError("id", { type: "manual", message: "Aquest ID de plantilla ja existeix. Deixa'l buit per auto-generar." });
         setIsLoading(false);
         return;
      }
      sampleChecklistTemplates.push(finalData);
      toast({
        title: "Plantilla Creada",
        description: `S'ha creat la plantilla "${finalData.name}" amb ID: ${templateId}.`,
      });
    }
    setIsLoading(false);
    router.push("/admin/checklist-templates");
    router.refresh();
  };

  const handleOpenNewTaskDialog = () => {
    const newOrder = (fields.length > 0 ? Math.max(...fields.map(t => t.order || 0)) : 0) + 1;
    const newTaskTemplate: TaskTemplateFormValues = {
      id: generateMockId("task_local"), 
      title: "Nova Tasca",
      assigneeDepartment: sampleDepartments[0]?.name || "IT",
      order: newOrder,
      description: ""
    };
    setTaskToEditData(newTaskTemplate);
    setCurrentTaskIndex(null); 
    append(newTaskTemplate, { shouldFocus: false }); 
    setIsEditingTask(true); 
  };

  const handleOpenEditTaskDialog = (taskIndex: number) => {
    const taskData = form.getValues(`taskTemplates.${taskIndex}`);
    setTaskToEditData({...taskData, id: taskData.id || generateMockId("task_local")});
    setCurrentTaskIndex(taskIndex);
    setIsEditingTask(true);
  };

 const handleTaskDialogSave = () => {
    if (!taskToEditData) return;

    if (!taskToEditData.title || taskToEditData.title.length < 3) {
        toast({ title: "Error de Validació", description: "El títol de la tasca ha de tenir almenys 3 caràcters.", variant: "destructive"});
        return;
    }
    if (!taskToEditData.assigneeDepartment) {
        toast({ title: "Error de Validació", description: "S'ha d'assignar un departament.", variant: "destructive"});
        return;
    }

    let updatedTasksArray;
    if (currentTaskIndex !== null) { 
      update(currentTaskIndex, taskToEditData);
      updatedTasksArray = form.getValues("taskTemplates");
       toast({
        title: "Tasca Actualitzada (Localment)",
        description: `S'han guardat els detalls per a la tasca "${taskToEditData.title}". Guarda la plantilla per persistir.`,
      });
    } else { 
      const lastTaskIndex = fields.length -1;
      if(lastTaskIndex >=0){
        const taskBeingAdded = form.getValues(`taskTemplates.${lastTaskIndex}`);
        if (taskBeingAdded && taskToEditData.id === taskBeingAdded.id) {
           update(lastTaskIndex, taskToEditData);
        } else {
          console.error("Discrepància d'ID en afegir tasca nova");
          append(taskToEditData); 
        }
        updatedTasksArray = form.getValues("taskTemplates");
      } else {
         updatedTasksArray = [taskToEditData]; 
      }
      toast({
        title: "Nova Tasca Afegida (Localment)",
        description: `S'han guardat els detalls per a la tasca "${taskToEditData.title}". Guarda la plantilla per persistir.`,
      });
    }
    reorderTasksAndUpdateForm(updatedTasksArray);

    setIsEditingTask(false);
    setTaskToEditData(null);
    setCurrentTaskIndex(null);
  };


  const handleTaskDialogCancel = () => {
    if (currentTaskIndex === null && fields.length > 0 && taskToEditData?.id.startsWith('task_local_')) {
      const lastTaskIndex = fields.length - 1;
      if(form.getValues(`taskTemplates.${lastTaskIndex}.id`) === taskToEditData.id){
        remove(lastTaskIndex);
      }
    }
    setIsEditingTask(false);
    setTaskToEditData(null);
    setCurrentTaskIndex(null);
  };

  const handleDeleteTaskTemplate = (taskIndex: number) => {
    const taskTitle = form.getValues(`taskTemplates.${taskIndex}.title`);
    remove(taskIndex);
    const currentTasks = form.getValues("taskTemplates");
    reorderTasksAndUpdateForm(currentTasks);
    
    toast({
      title: "Tasca Eliminada (Localment)",
      description: `S'ha eliminat la tasca "${taskTitle}" de la plantilla. Guarda la plantilla per persistir.`,
      variant: "destructive"
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
         <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de la Plantilla (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Deixa buit per auto-generar o introdueix un ID específic" {...field} disabled={isEditMode} />
                </FormControl>
                <FormDescription>
                  {isEditMode ? "L'ID de la plantilla no es pot modificar." : "Si es deixa buit, es generarà un ID automàticament."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        <Card className="shadow-md">
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la Plantilla</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Checklist d'Alta General" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requestTypeIdentifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificador de Tipus de Sol·licitud (deprecated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: ONBOARDING_GENERAL" {...field} />
                  </FormControl>
                  <FormDescription>
                    Aquest camp és informatiu. La vinculació es gestiona a "Tipus de Sol·licitud".
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripció (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descriu breument l'objectiu d'aquesta plantilla." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Tasques de la Plantilla</CardTitle>
                <CardDescription>Defineix les tasques que es generaran. Pots reordenar-les amb les fletxes.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleOpenNewTaskDialog}>
                <PlusCircle className="mr-2 h-3 w-3" /> Nova Tasca
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {fields.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-center py-2 px-4">Ordre</TableHead>
                    <TableHead className="py-2 px-4">Títol</TableHead>
                    <TableHead className="py-2 px-4">Dep. Assignat</TableHead>
                    <TableHead className="py-2 px-4">Descripció</TableHead>
                    <TableHead className="text-right w-[180px] py-2 px-4">Accions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((task, index) => (
                    <TableRow key={task.id}>
                      <TableCell className="text-center font-medium py-2 px-4">{task.order}</TableCell>
                      <TableCell className="font-medium py-2 px-4">{task.title}</TableCell>
                      <TableCell className="py-2 px-4">
                        <Badge variant="secondary">{task.assigneeDepartment}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-xs py-2 px-4" title={task.description}>
                        {task.description || "-"}
                      </TableCell>
                      <TableCell className="text-right space-x-1 py-2 px-4">
                        <Button type="button" variant="ghost" size="icon" title="Moure Amunt" onClick={() => handleMoveTaskUp(index)} disabled={index === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                         <Button type="button" variant="ghost" size="icon" title="Moure Avall" onClick={() => handleMoveTaskDown(index)} disabled={index === fields.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" title="Editar tasca" onClick={() => handleOpenEditTaskDialog(index)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Eliminar tasca">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Eliminació</AlertDialogTitle>
                              <AlertDialogDescription>
                                Estàs segur que vols eliminar la tasca "{task.title}"? Guarda la plantilla per persistir.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTaskTemplate(index)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Confirmar Eliminació
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">Aquesta plantilla no té tasques definides.</p>
              </CardContent>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? "Processant..." : (isEditMode ? "Guardar Canvis Plantilla" : "Crear Plantilla")}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      </form>

      {isEditingTask && taskToEditData && (
        <AlertDialog open={isEditingTask} onOpenChange={(open) => !open && handleTaskDialogCancel()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{currentTaskIndex !== null ? "Editar Tasca" : "Nova Tasca"}</AlertDialogTitle>
              <AlertDialogDescription>Modifica els detalls de la tasca.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="taskTitleDialog">Títol de la Tasca</Label>
                <Input
                  id="taskTitleDialog"
                  value={taskToEditData.title}
                  onChange={(e) => setTaskToEditData(prev => prev ? {...prev, title: e.target.value} : null)}
                  className={!taskToEditData.title || taskToEditData.title.length < 3 ? "border-red-500" : ""}
                />
                 {(!taskToEditData.title || taskToEditData.title.length < 3) && <p className="text-red-500 text-xs mt-1">El títol ha de tenir almenys 3 caràcters.</p>}
              </div>
              <div>
                <Label htmlFor="taskOrderDialog">Ordre (s'actualitzarà automàticament)</Label>
                <Input
                  id="taskOrderDialog"
                  type="number"
                  value={taskToEditData.order || ''}
                  disabled 
                />
              </div>
              <div>
                <Label htmlFor="taskAssigneeDeptDialog">Departament Assignat</Label>
                 <Select
                    value={taskToEditData.assigneeDepartment}
                    onValueChange={(value) => setTaskToEditData(prev => prev ? {...prev, assigneeDepartment: value} : null)}
                >
                    <SelectTrigger id="taskAssigneeDeptDialog" className={!taskToEditData.assigneeDepartment ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecciona un departament" />
                    </SelectTrigger>
                    <SelectContent>
                        {sampleDepartments.map(dept => (
                            <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                        ))}
                         <SelectItem value="Altres">Altres</SelectItem>
                    </SelectContent>
                </Select>
                {!taskToEditData.assigneeDepartment && <p className="text-red-500 text-xs mt-1">S'ha d'assignar un departament.</p>}
              </div>
              <div>
                <Label htmlFor="taskDescriptionDialog">Descripció</Label>
                <Textarea
                  id="taskDescriptionDialog"
                  value={taskToEditData.description || ""}
                  onChange={(e) => setTaskToEditData(prev => prev ? {...prev, description: e.target.value} : null)}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleTaskDialogCancel}>Cancel·lar</AlertDialogCancel>
              <AlertDialogAction onClick={handleTaskDialogSave}>Guardar Tasca</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Form>
  );
}
