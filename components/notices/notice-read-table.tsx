"use client";

import { Check, Clock } from "lucide-react";

import type { NoticeReadItem } from "@/types/notice.type";
import { Badge } from "@/components/ui/badge";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

interface NoticeReadTableProps {
  reads: NoticeReadItem[];
}

export function NoticeReadTable({ reads }: NoticeReadTableProps) {
  if (reads.length === 0) {
    return (
      <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-8 text-center">
        <p className="text-sm text-slate-500">Nenhuma leitura registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Leitura</th>
              <th className="px-4 py-3 font-medium">Ciência</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {reads.map((read) => (
              <tr key={read.id} className="border-t border-slate-200/70">
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-900">{read.user.name}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-slate-700">{read.user.email}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <p className="text-slate-700">{formatDateTime(read.read_at)}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {read.has_acknowledged ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <p className="text-slate-700">{formatDateTime(read.acknowledged_at)}</p>
                      </>
                    ) : (
                      <p className="text-slate-500">Sem confirmação</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  {read.has_acknowledged ? (
                    <Badge variant="success">Ciente</Badge>
                  ) : (
                    <Badge variant="secondary">Lido</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
