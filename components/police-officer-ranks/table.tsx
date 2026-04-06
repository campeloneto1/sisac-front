"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeletePoliceOfficerRankMutation } from "@/hooks/use-police-officer-rank-mutations";
import type { PoliceOfficerRankItem } from "@/types/police-officer-rank.type";
import { promotionTypeLabels } from "@/types/police-officer-rank.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PoliceOfficerRanksTableProps {
  policeOfficerRanks: PoliceOfficerRankItem[];
}

export function PoliceOfficerRanksTable({ policeOfficerRanks }: PoliceOfficerRanksTableProps) {
  const permissions = usePermissions("police-officer-ranks");
  const deleteMutation = useDeletePoliceOfficerRankMutation();
  const [rankToDelete, setRankToDelete] = useState<PoliceOfficerRankItem | null>(null);

  async function handleDelete() {
    if (!rankToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(rankToDelete.id);
    setRankToDelete(null);
  }

  function formatDate(dateString: string | null | undefined) {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Policial</th>
                <th className="px-4 py-3 font-medium">Graduação</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">Tipo de promoção</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {policeOfficerRanks.map((policeOfficerRank) => (
                <tr key={policeOfficerRank.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {policeOfficerRank.police_officer?.name ?? "—"}
                      </p>
                      {policeOfficerRank.police_officer?.registration_number ? (
                        <p className="text-slate-500">
                          Mat. {policeOfficerRank.police_officer.registration_number}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {policeOfficerRank.rank?.name ?? "—"}
                      </p>
                      {policeOfficerRank.rank?.abbreviation ? (
                        <p className="text-slate-500">{policeOfficerRank.rank.abbreviation}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-slate-900">
                        {formatDate(policeOfficerRank.start_date)}
                      </p>
                      {policeOfficerRank.end_date ? (
                        <p className="text-slate-500">até {formatDate(policeOfficerRank.end_date)}</p>
                      ) : (
                        <p className="text-slate-500">—</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {policeOfficerRank.promotion_type ? (
                      <Badge variant="secondary">
                        {promotionTypeLabels[policeOfficerRank.promotion_type]}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {policeOfficerRank.is_current ? (
                      <Badge variant="default">Atual</Badge>
                    ) : (
                      <Badge variant="outline">Encerrada</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/police-officer-ranks/${policeOfficerRank.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/police-officer-ranks/${policeOfficerRank.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        policeOfficerRank.is_current ? null : (
                          <Button size="icon" variant="outline" onClick={() => setRankToDelete(policeOfficerRank)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={Boolean(rankToDelete)} onOpenChange={(open) => !open && setRankToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir promoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este registro de promoção? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRankToDelete(null)}>
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
