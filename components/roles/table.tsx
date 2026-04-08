"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteRoleMutation } from "@/hooks/use-role-mutations";
import type { RoleItem } from "@/types/role.type";
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

interface RolesTableProps {
  roles: RoleItem[];
}

function isProtectedRole(role: RoleItem) {
  return ["super-admin", "admin"].includes(role.slug);
}

export function RolesTable({ roles }: RolesTableProps) {
  const permissions = usePermissions("roles");
  const deleteMutation = useDeleteRoleMutation();
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);

  async function handleDelete() {
    if (!roleToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(roleToDelete.id);
    setRoleToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Permissões</th>
                <th className="px-4 py-3 font-medium">Usuários</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const canDeleteRole = permissions.canDelete && !role.users_count;

                return (
                  <tr key={role.id} className="border-t border-slate-200/70">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{role.name}</p>
                        <p className="mt-1 text-slate-500">{role.description || "Sem descrição"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={isProtectedRole(role) ? "warning" : "outline"}>{role.slug}</Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{role.permissions_count ?? role.permissions?.length ?? 0}</td>
                    <td className="px-4 py-4 text-slate-600">{role.users_count ?? 0}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {permissions.canView ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/roles/${role.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}

                        {permissions.canUpdate ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/roles/${role.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}

                        {canDeleteRole ? (
                          <Button size="icon" variant="outline" onClick={() => setRoleToDelete(role)}>
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

      <Dialog open={Boolean(roleToDelete)} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir perfil</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o perfil {roleToDelete?.name}? Roles com usuários vinculados não podem ser
              removidas pela policy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRoleToDelete(null)}>
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

