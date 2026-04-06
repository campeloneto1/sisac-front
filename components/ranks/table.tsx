"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteRankMutation } from "@/hooks/use-rank-mutations";
import type { RankItem } from "@/types/rank.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RanksTableProps {
  ranks: RankItem[];
}

export function RanksTable({ ranks }: RanksTableProps) {
  const permissions = usePermissions("ranks");
  const deleteMutation = useDeleteRankMutation();
  const [rankToDelete, setRankToDelete] = useState<RankItem | null>(null);

  async function handleDelete() {
    if (!rankToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(rankToDelete.id);
    setRankToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Posto/graduação</th>
                <th className="px-4 py-3 font-medium">Sigla</th>
                <th className="px-4 py-3 font-medium">Nivel</th>
                <th className="px-4 py-3 font-medium">Intersticio</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {ranks.map((rank) => (
                <tr key={rank.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{rank.name}</p>
                      <p className="mt-1 text-slate-500">
                        Cadastro administrativo da hierarquia funcional dos policiais.
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{rank.abbreviation}</td>
                  <td className="px-4 py-4 text-slate-700">{rank.hierarchy_level}</td>
                  <td className="px-4 py-4 text-slate-700">
                    {rank.interstice !== null ? `${rank.interstice} meses` : "Nao informado"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/ranks/${rank.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/ranks/${rank.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setRankToDelete(rank)}>
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

      <Dialog open={Boolean(rankToDelete)} onOpenChange={(open) => !open && setRankToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir posto/graduação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {rankToDelete?.name}? Se houver historico em `police_officer_ranks`,
              a policy da API bloqueara a exclusao.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRankToDelete(null)}>
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
