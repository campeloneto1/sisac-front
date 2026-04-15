"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeletePoliceOfficerMutation } from "@/hooks/use-police-officer-mutations";
import type { PoliceOfficerItem } from "@/types/police-officer.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { PhotoModal } from "@/components/ui/photo-modal";

interface PoliceOfficersTableProps {
  policeOfficers: PoliceOfficerItem[];
}

export function PoliceOfficersTable({ policeOfficers }: PoliceOfficersTableProps) {
  const permissions = usePermissions("police-officers");
  const deleteMutation = useDeletePoliceOfficerMutation();
  const [policeOfficerToDelete, setPoliceOfficerToDelete] = useState<PoliceOfficerItem | null>(null);
  const [photoModalData, setPhotoModalData] = useState<{ photoUrl?: string | null; name: string } | null>(null);

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
                <th className="px-4 py-3 font-medium">Matrícula</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Escolaridade</th>
                <th className="px-4 py-3 font-medium">Graduação atual</th>
                <th className="px-4 py-3 font-medium">Setor atual</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {policeOfficers.map((officer) => (
                <tr key={officer.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPhotoModalData({ photoUrl: officer.profile_photo?.url, name: officer.name ?? officer.war_name })}
                      >
                        {officer.profile_photo?.url ? (
                          <AvatarImage src={officer.profile_photo.url} alt={officer.name ?? officer.war_name} />
                        ) : null}
                        <AvatarFallback>{(officer.name ?? officer.war_name).slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{officer.name ?? officer.user?.name ?? "Sem nome"}</p>
                        <p className="mt-1 text-slate-500">Nome de guerra: {officer.war_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>{officer.registration_number}</p>
                      <p className="mt-1 text-slate-500">Numeral: {officer.badge_number ?? "Não informado"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>{officer.email ?? "Sem email"}</p>
                      <p className="mt-1 text-slate-500">{officer.phone ?? "Sem telefone"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{officer.education_level?.name ?? "Não informada"}</td>
                  <td className="px-4 py-4 text-slate-700">
                    {officer.current_rank ? `${officer.current_rank.name} (${officer.current_rank.abbreviation ?? "-"})` : "Não informada"}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>{officer.current_allocation?.sector?.name ?? "Sem lotação"}</p>
                      {officer.current_allocation?.assignment?.name ? (
                        <p className="mt-1 text-slate-500">{officer.current_allocation.assignment.name}</p>
                      ) : null}
                    </div>
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
              Tem certeza que deseja excluir {policeOfficerToDelete?.name ?? policeOfficerToDelete?.war_name}? Essa ação remove
              o policial e faz soft delete do usuário vinculado na API.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPoliceOfficerToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {photoModalData ? (
        <PhotoModal
          isOpen={Boolean(photoModalData)}
          onClose={() => setPhotoModalData(null)}
          photoUrl={photoModalData.photoUrl}
          fallbackText={photoModalData.name.slice(0, 2).toUpperCase()}
          alt={photoModalData.name}
        />
      ) : null}
    </>
  );
}
