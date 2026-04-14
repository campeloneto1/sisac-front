"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteCourseEnrollmentMutation } from "@/hooks/use-course-enrollment-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { CourseEnrollmentItem } from "@/types/course-enrollment.type";

function getStatusVariant(color: string) {
  switch (color) {
    case "green":
      return "success";
    case "red":
      return "danger";
    case "yellow":
      return "warning";
    case "gray":
      return "secondary";
    case "blue":
    default:
      return "info";
  }
}

interface ExternalCourseEnrollmentsTableProps {
  items: CourseEnrollmentItem[];
}

export function ExternalCourseEnrollmentsTable({ items }: ExternalCourseEnrollmentsTableProps) {
  const permissions = usePermissions("course-enrollments");
  const deleteMutation = useDeleteCourseEnrollmentMutation();
  const [itemToDelete, setItemToDelete] = useState<CourseEnrollmentItem | null>(null);

  async function handleDelete() {
    if (!itemToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(itemToDelete.id);
    setItemToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Policial</th>
                <th className="px-4 py-3 font-medium">Curso</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">Boletim</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.user?.name ?? `Usuário #${item.user_id}`}</p>
                      <p className="mt-1 text-slate-500">
                        {item.user?.document ? `Documento ${item.user.document}` : "Documento não informado"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.course?.name ?? `Curso #${item.course_id}`}</p>
                      <p className="mt-1 text-slate-500">
                        {item.course?.abbreviation ?? "Sem sigla"} • Registro externo
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {item.start_date ?? "-"} ate {item.end_date ?? "-"}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {item.bulletin ?? "Nao informado"}
                    {item.bulletin_date ? ` (${item.bulletin_date})` : ""}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getStatusVariant(item.status_color)}>{item.status_label}</Badge>
                      {item.has_certificate ? <Badge variant="success">Certificado</Badge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/external-course-enrollments/${item.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/external-course-enrollments/${item.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setItemToDelete(item)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={Boolean(itemToDelete)} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir registro externo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o registro de{" "}
              {itemToDelete?.user?.name ?? `Usuário #${itemToDelete?.user_id}`} em{" "}
              {itemToDelete?.course?.name ?? `Curso #${itemToDelete?.course_id}`}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setItemToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
