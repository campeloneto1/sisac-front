"use client";

import { Building2, User, Users, Globe } from "lucide-react";

import type { NoticeTargetWithData } from "@/types/notice.type";
import { getNoticeTargetTypeLabel } from "@/types/notice.type";
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

function getTargetIcon(targetType: string) {
  switch (targetType) {
    case "user":
      return <User className="h-4 w-4 text-blue-600" />;
    case "sector":
      return <Building2 className="h-4 w-4 text-purple-600" />;
    case "role":
      return <Users className="h-4 w-4 text-orange-600" />;
    case "all":
      return <Globe className="h-4 w-4 text-green-600" />;
    default:
      return null;
  }
}

function getTargetBadgeVariant(targetType: string) {
  switch (targetType) {
    case "user":
      return "info" as const;
    case "sector":
      return "secondary" as const;
    case "role":
      return "warning" as const;
    case "all":
      return "success" as const;
    default:
      return "outline" as const;
  }
}

function formatTargetData(target: NoticeTargetWithData) {
  if (!target.target_data) {
    return "—";
  }

  const data = target.target_data;

  if (target.target_type === "user") {
    return `${data.name}${data.email ? ` (${data.email})` : ""}`;
  }

  if (target.target_type === "sector") {
    return `${data.name}${data.abbreviation ? ` (${data.abbreviation})` : ""}`;
  }

  if (target.target_type === "role") {
    return `${data.name}${data.slug ? ` (${data.slug})` : ""}`;
  }

  if (target.target_type === "all") {
    return "Todos os usuários da subunidade";
  }

  return data.name;
}

interface NoticeTargetTableProps {
  targets: NoticeTargetWithData[];
}

export function NoticeTargetTable({ targets }: NoticeTargetTableProps) {
  if (targets.length === 0) {
    return (
      <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-8 text-center">
        <p className="text-sm text-slate-500">Nenhum destinatário configurado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Destinatário</th>
              <th className="px-4 py-3 font-medium">Adicionado em</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => (
              <tr key={target.id} className="border-t border-slate-200/70">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {getTargetIcon(target.target_type)}
                    <Badge variant={getTargetBadgeVariant(target.target_type)}>
                      {getNoticeTargetTypeLabel(target.target_type)}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-900">{formatTargetData(target)}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-slate-700">{formatDateTime(target.created_at)}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
