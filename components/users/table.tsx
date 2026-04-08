"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteUserMutation } from "@/hooks/use-user-mutations";
import type { UserListItem } from "@/types/user.type";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ResetPasswordDialog } from "@/components/users/reset-password-dialog";

interface UsersTableProps {
  users: UserListItem[];
}

function statusVariant(status: string | null) {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "danger";
    case "pending_authorization":
      return "warning";
    case "temporarily_authorized":
      return "info";
    default:
      return "outline";
  }
}

export function UsersTable({ users }: UsersTableProps) {
  const permissions = usePermissions("users");
  const { user: authenticatedUser } = useAuth();
  const deleteMutation = useDeleteUserMutation();
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);

  async function handleDelete() {
    if (!userToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(userToDelete.id);
    setUserToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => {
                const isSelf = authenticatedUser?.id === item.id;

                return (
                  <tr key={item.id} className="border-t border-slate-200/70">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-slate-500">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{item.document ?? "-"}</td>
                    <td className="px-4 py-4">
                      <Badge variant="outline">{item.type_label ?? "-"}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant(item.status)}>{item.status_label ?? "-"}</Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{item.role?.name ?? "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {permissions.canView || isSelf ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/users/${item.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}

                        {(permissions.canUpdate || isSelf) ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/users/${item.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}

                        {permissions.canResetPassword ? (
                          <ResetPasswordDialog userId={item.id} userName={item.name} />
                        ) : null}

                        {permissions.canDelete && !isSelf ? (
                          <Button size="icon" variant="outline" onClick={() => setUserToDelete(item)}>
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

      <Dialog open={Boolean(userToDelete)} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {userToDelete?.name}? Essa ação depende da permissão `delete` e não deve
              ser usada no próprio usuário autenticado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUserToDelete(null)}>
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
