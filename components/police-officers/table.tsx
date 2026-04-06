"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeletePoliceOfficerMutation } from "@/hooks/use-police-officer-mutations";
import type { PoliceOfficerItem } from "@/types/police-officer.type";
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

interface PoliceOfficersTableProps {
  policeOfficers: PoliceOfficerItem[];
}

export function PoliceOfficersTable({ policeOfficers }: PoliceOfficersTableProps) {
  const permissions = usePermissions("police-officers");
  const deleteMutation = useDeletePoliceOfficerMutation();
  const [policeOfficerToDelete, setPoliceOfficerToDelete] = useState<PoliceOfficerItem | null>(null);

  async function handleDelete() {
    if (!policeOfficerToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(policeOfficerToDelete.id);
    setPoliceOfficerToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Policial</th>
                <th className="px-4 py-3 font-medium">Matricula</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Escolaridade</th>
                <th className="px-4 py-3 font-medium">Graduacao atual</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {policeOfficers.map((officer) => (
                <tr key={officer.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{officer.name ?? officer.user?.name ?? "Sem nome"}</p>
                      <p className="mt-1 text-slate-500">Nome de guerra: {officer.war_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>{officer.registration_number}</p>
                      <p className="mt-1 text-slate-500">Numeral: {officer.badge_number ?? "Nao informado"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>{officer.email ?? "Sem email"}</p>
                      <p className="mt-1 text-slate-500">{officer.phone ?? "Sem telefone"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{officer.education_level?.name ?? "Nao informada"}</td>
                  <td className="px-4 py-4 text-slate-700">
                    {officer.current_rank ? `${officer.current_rank.name} (${officer.current_rank.abbreviation ?? "-"})` : "Nao informada"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={officer.is_active ? "success" : "danger"}>{officer.is_active ? "Ativo" : "Inativo"}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/police-officers/${officer.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/police-officers/${officer.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setPoliceOfficerToDelete(officer)}>
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

      <Dialog open={Boolean(policeOfficerToDelete)} onOpenChange={(open) => !open && setPoliceOfficerToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir policial</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {policeOfficerToDelete?.name ?? policeOfficerToDelete?.war_name}? Essa acao remove
              o policial e faz soft delete do usuario vinculado na API.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPoliceOfficerToDelete(null)}>
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
