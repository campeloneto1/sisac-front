"use client";

import type { PoliceOfficerActiveInactiveItem } from "@/types/police-officer-report.type";
import { Badge } from "@/components/ui/badge";

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

interface PoliceOfficerActiveInactiveTableProps {
  officers: PoliceOfficerActiveInactiveItem[];
}

export function PoliceOfficerActiveInactiveTable({
  officers,
}: PoliceOfficerActiveInactiveTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Policial</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Graduação atual</th>
              <th className="px-4 py-3 font-medium">Lotação atual</th>
              <th className="px-4 py-3 font-medium">Escolaridade</th>
              <th className="px-4 py-3 font-medium">Datas</th>
            </tr>
          </thead>
          <tbody>
            {officers.map((officer) => (
              <tr key={officer.id} className="border-t border-slate-200/70">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{officer.name ?? officer.war_name ?? "Sem nome"}</p>
                    <p className="mt-1 text-slate-500">
                      {officer.war_name ? `${officer.war_name} • ` : ""}
                      Matrícula {officer.registration_number ?? "-"} • Numeral {officer.badge_number ?? "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {officer.email ?? "-"} • {officer.phone ?? officer.phone2 ?? "-"}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={officer.is_active ? "success" : "secondary"}>
                    {officer.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {officer.current_rank
                    ? `${officer.current_rank.name} (${officer.current_rank.abbreviation ?? "-"})`
                    : "-"}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <p>{officer.current_allocation?.sector?.name ?? "Sem setor"}</p>
                  <p className="text-xs text-slate-500">
                    {officer.current_allocation?.assignment?.name ?? "Sem função"}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {officer.education_level?.name ?? "-"}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <p>Inclusão: {formatDate(officer.inclusion_date)}</p>
                  <p className="text-xs text-slate-500">
                    Apresentação: {formatDate(officer.presentation_date)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
