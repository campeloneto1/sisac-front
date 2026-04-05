"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeletePermissionMutation } from "@/hooks/use-permission-mutations";
import type { PermissionItem } from "@/types/permission.type";
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

interface PermissionsTableProps {
  permissionsList: PermissionItem[];
}

function isProtectedPermission(slug: string) {
  return slug.startsWith("permissions.");
}

export function PermissionsTable({ permissionsList }: PermissionsTableProps) {
  const permissions = usePermissions("permissions");
  const deleteMutation = useDeletePermissionMutation();
  const [permissionToDelete, setPermissionToDelete] = useState<PermissionItem | null>(null);

  async function handleDelete() {
    if (!permissionToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(permissionToDelete.id);
    setPermissionToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Permissao</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Roles</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {permissionsList.map((permission) => {
                const canDeletePermission = permissions.canDelete && !permission.roles_count;

                return (
                  <tr key={permission.id} className="border-t border-slate-200/70">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{permission.name}</p>
                        <p className="mt-1 text-slate-500">{permission.description || "Sem descricao"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={isProtectedPermission(permission.slug) ? "warning" : "outline"}>{permission.slug}</Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{permission.roles_count ?? 0}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {permissions.canView ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/permissions/${permission.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}

                        {permissions.canUpdate ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/permissions/${permission.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}

                        {canDeletePermission ? (
                          <Button size="icon" variant="outline" onClick={() => setPermissionToDelete(permission)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={Boolean(permissionToDelete)} onOpenChange={(open) => !open && setPermissionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir permissao</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {permissionToDelete?.name}? Permissoes vinculadas a roles nao podem ser
              removidas pela policy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPermissionToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

