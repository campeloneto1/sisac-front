"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteNoticeMutation } from "@/hooks/use-notice-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import {
  getNoticePriorityBadgeVariant,
  getNoticePriorityLabel,
  getNoticeStatusBadgeVariant,
  getNoticeStatusLabel,
  getNoticeTypeBadgeVariant,
  getNoticeTypeLabel,
  getNoticeVisibilityLabel,
  type NoticeItem,
} from "@/types/notice.type";
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

function formatDateRange(startsAt?: string | null, endsAt?: string | null) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const start = startsAt ? formatter.format(new Date(startsAt)) : "Imediato";
  const end = endsAt ? formatter.format(new Date(endsAt)) : "Sem término";

  return `${start} - ${end}`;
}

interface NoticesTableProps {
  notices: NoticeItem[];
}

export function NoticesTable({ notices }: NoticesTableProps) {
  const permissions = usePermissions("notices");
  const deleteMutation = useDeleteNoticeMutation();
  const [noticeToDelete, setNoticeToDelete] = useState<NoticeItem | null>(null);

  async function handleDelete() {
    if (!noticeToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(noticeToDelete.id);
    setNoticeToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Aviso</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Prioridade</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Visibilidade</th>
                <th className="px-4 py-3 font-medium">Segmentação</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div className="max-w-[280px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{notice.title}</p>
                        {notice.is_pinned ? <Badge variant="warning">Fixado</Badge> : null}
                        {notice.requires_acknowledgement ? <Badge variant="outline">Exige ciência</Badge> : null}
                      </div>
                      <p className="mt-1 line-clamp-2 text-slate-500">{notice.content}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getNoticeTypeBadgeVariant(notice.type)}>{getNoticeTypeLabel(notice.type)}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getNoticePriorityBadgeVariant(notice.priority)}>{getNoticePriorityLabel(notice.priority)}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getNoticeStatusBadgeVariant(notice.status)}>{getNoticeStatusLabel(notice.status)}</Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{getNoticeVisibilityLabel(notice.visibility)}</td>
                  <td className="px-4 py-4 text-slate-700">
                    <p>{notice.targets_count ?? 0} alvo(s)</p>
                    <p className="text-xs text-slate-500">{notice.reads_count ?? 0} leitura(s)</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{formatDateRange(notice.starts_at, notice.ends_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/notices/${notice.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/notices/${notice.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setNoticeToDelete(notice)}>
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

      <Dialog open={Boolean(noticeToDelete)} onOpenChange={(open) => !open && setNoticeToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir aviso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {noticeToDelete?.title}? O histórico de leitura associado a ele também deixará de ser acessível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoticeToDelete(null)}>
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
