"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { GraduationCap, Pencil, Plus, Trash2, Users2 } from "lucide-react";

import { useDeletePoliceOfficerCourseMutation } from "@/hooks/use-police-officer-course-mutations";
import { usePoliceOfficerCourses } from "@/hooks/use-police-officer-courses";
import { usePermissions } from "@/hooks/use-permissions";
import { useCourseClass } from "@/hooks/use-course-classes";
import type { PoliceOfficerCourseItem } from "@/types/police-officer-course.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CourseClassStudentsDialog } from "@/components/course-classes/students-dialog";

function getStatusVariant(status?: string | null) {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "danger";
    case "in_progress":
      return "warning";
    case "dropped":
    case "cancelled":
      return "secondary";
    default:
      return "info";
  }
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "enrolled":
      return "Inscrito";
    case "in_progress":
      return "Em andamento";
    case "completed":
      return "Concluido";
    case "failed":
      return "Reprovado";
    case "dropped":
      return "Desistente";
    case "cancelled":
      return "Cancelado";
    default:
      return "Sem status";
  }
}

export function CourseClassStudentsPage() {
  const params = useParams<{ id: string }>();
  const courseClassQuery = useCourseClass(params.id);
  const permissions = usePermissions("police-officer-courses");
  const deleteMutation = useDeletePoliceOfficerCourseMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<PoliceOfficerCourseItem | null>(null);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<PoliceOfficerCourseItem | null>(null);
  const filters = useMemo(
    () => ({
      course_class_id: Number(params.id),
      per_page: 100,
    }),
    [params.id],
  );
  const studentsQuery = usePoliceOfficerCourses(filters, permissions.canViewAny || permissions.canView);

  async function handleDelete() {
    if (!enrollmentToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(enrollmentToDelete.id);
    setEnrollmentToDelete(null);
  }

  if (!permissions.canViewAny && !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `viewAny` ou `view` para administrar os alunos da turma.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (courseClassQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (courseClassQuery.isError || !courseClassQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar turma</CardTitle>
          <CardDescription>Os dados da turma nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const courseClass = courseClassQuery.data.data;
  const students = studentsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            <h1 className="font-display text-3xl text-slate-900">Alunos da turma</h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {courseClass.name ?? `Turma #${courseClass.id}`} • {courseClass.course ? `${courseClass.course.name} (${courseClass.course.abbreviation})` : "Curso nao informado"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Gerencie matriculas, status e andamento dos policiais vinculados a esta turma.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/course-classes/${courseClass.id}`}>Voltar para a turma</Link>
          </Button>
          {permissions.canCreate ? (
            <Button
              onClick={() => {
                setEditingEnrollment(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Matricular policial
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Matriculas</CardTitle>
          <CardDescription>Lista de policiais inscritos ou que ja passaram por esta turma.</CardDescription>
        </CardHeader>
        <CardContent>
          {studentsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : studentsQuery.isError ? (
            <p className="text-sm text-slate-500">Nao foi possivel carregar os alunos desta turma.</p>
          ) : students.length ? (
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          {student.police_officer?.name ?? student.police_officer?.user?.name ?? student.police_officer?.war_name ?? `Policial #${student.police_officer_id}`}
                        </p>
                        <Badge variant={getStatusVariant(student.status)}>{getStatusLabel(student.status)}</Badge>
                        {student.can_receive_certificate ? <Badge variant="success">Pode emitir certificado</Badge> : null}
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span>Matricula: {student.police_officer?.registration_number ?? "Nao informada"}</span>
                        </div>
                        <div className="text-sm text-slate-600">
                          Inicio: {student.start_date ?? "-"} • Termino: {student.end_date ?? "-"}
                        </div>
                        <div className="text-sm text-slate-600">
                          Carga horaria: {student.workload_hours ?? 0}h
                        </div>
                        <div className="text-sm text-slate-600">
                          Boletim: {student.bulletin ?? "Nao informado"}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      {permissions.canUpdate ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setEditingEnrollment(student);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setEnrollmentToDelete(student)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhum policial matriculado nesta turma.</p>
          )}
        </CardContent>
      </Card>

      <CourseClassStudentsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        courseClassId={courseClass.id}
        courseClassName={courseClass.name ?? `Turma #${courseClass.id}`}
        studentCourse={editingEnrollment}
      />

      <Dialog open={Boolean(enrollmentToDelete)} onOpenChange={(open) => !open && setEnrollmentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover matricula</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover a matricula de{" "}
              {enrollmentToDelete?.police_officer?.name ?? enrollmentToDelete?.police_officer?.user?.name ?? enrollmentToDelete?.police_officer?.war_name}
              {" "}desta turma?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEnrollmentToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
