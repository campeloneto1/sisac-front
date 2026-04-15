"use client";

import Link from "next/link";
import { ArrowLeft, Camera, Printer } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerPhotoBoardReport } from "@/hooks/use-police-officer-reports";
import { useSectors } from "@/hooks/use-sectors";
import { hasPermission } from "@/lib/permissions";
import type { PoliceOfficerReportFilters } from "@/types/police-officer-report.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PhotoModal } from "@/components/ui/photo-modal";

export function PoliceOfficerPhotoBoardReportPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("police-officers");
  const printRef = useRef<HTMLDivElement>(null);
  const [sectorId, setSectorId] = useState("all");
  const [photoModalData, setPhotoModalData] = useState<{
    photoUrl: string | null;
    name: string;
  } | null>(null);

  const sectorsQuery = useSectors({ per_page: 100 });

  const filters = useMemo<PoliceOfficerReportFilters>(
    () => ({
      sector_id: sectorId !== "all" ? Number(sectorId) : undefined,
      is_active: true,
    }),
    [sectorId],
  );

  const reportQuery = usePoliceOfficerPhotoBoardReport(
    filters,
    Boolean(activeSubunit) && hasPermission(user, "reports") && permissions.canViewAny,
  );

  const items = useMemo(() => {
    const data = reportQuery.data?.data ?? [];
    return [...data].sort((a, b) => {
      const levelA = a.current_rank?.hierarchy_level ?? 0;
      const levelB = b.current_rank?.hierarchy_level ?? 0;
      return levelB - levelA;
    });
  }, [reportQuery.data?.data]);

  const selectedSector = sectorsQuery.data?.data.find((s) => s.id === Number(sectorId));

  if (!hasPermission(user, "reports") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa do slug `reports` e da permissão `police-officers.viewAny` para acessar este relatório.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>Escolha uma subunidade ativa antes de gerar o quadro de fotos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between print:hidden">
        <div>
          <Button asChild variant="ghost" className="px-2">
            <Link href="/police-officer-reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Relatórios
            </Link>
          </Button>
          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">Quadro de fotos</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Relatório visual com foto, graduação, numeral, nome de guerra e matrícula dos policiais por setor.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 print:hidden">
        <div className="flex items-center gap-3">
          <Select value={sectorId} onValueChange={setSectorId}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Selecione um setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os setores</SelectItem>
              {(sectorsQuery.data?.data ?? []).map((sector) => (
                <SelectItem key={sector.id} value={String(sector.id)}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {items.length > 0 ? (
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          ) : null}
        </div>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader className="pb-2">
            <CardDescription>Total de policiais</CardDescription>
            <CardTitle>{items.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {reportQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 print:hidden">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : reportQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80 print:hidden">
          <CardHeader>
            <CardTitle>Erro ao gerar relatório</CardTitle>
            <CardDescription>Não foi possível carregar o quadro de fotos no momento.</CardDescription>
          </CardHeader>
        </Card>
      ) : !items.length ? (
        <Card className="border-slate-200/70 bg-white/80 print:hidden">
          <CardHeader>
            <CardTitle>Nenhum resultado encontrado</CardTitle>
            <CardDescription>Selecione um setor para visualizar o quadro de fotos.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {/* Versão para tela */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 print:hidden">
            {items.map((officer) => {
              const displayName = officer.war_name ?? officer.name ?? "Sem nome";
              const rankName = officer.current_rank?.abbreviation ?? officer.current_rank?.name ?? "-";
              const badgeNumber = officer.badge_number ?? "-";
              const registrationNumber = officer.registration_number ?? "-";

              return (
                <Card key={officer.id} className="border-slate-200/70 bg-white/80 overflow-hidden">
                  <div className="flex flex-col items-center p-6 space-y-4">
                    <Avatar
                      className="h-32 w-32 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        setPhotoModalData({
                          photoUrl: officer.profile_photo?.url ?? null,
                          name: displayName,
                        })
                      }
                    >
                      {officer.profile_photo?.url ? (
                        <AvatarImage src={officer.profile_photo.url} alt={displayName} />
                      ) : null}
                      <AvatarFallback className="text-2xl">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="text-center space-y-2 w-full">
                      <div className="flex justify-center">
                        <Badge variant="secondary">{rankName}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                        <p className="text-xs text-slate-500">Numeral: {badgeNumber}</p>
                        <p className="text-xs text-slate-500">Matrícula: {registrationNumber}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Versão para impressão */}
          <div ref={printRef} className="hidden print:block">
            <div className="mx-auto bg-white p-8 text-black">
              <div className="border-b-2 border-black pb-4 text-center mb-8">
                <h1 className="text-2xl font-bold">Quadro de Fotos</h1>
                {selectedSector ? (
                  <p className="text-lg mt-2">{selectedSector.name}</p>
                ) : (
                  <p className="text-lg mt-2">Todos os setores</p>
                )}
                <p className="text-sm mt-1">
                  Total: {items.length} {items.length === 1 ? "policial" : "policiais"}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-6">
                {items.map((officer) => {
                  const displayName = officer.war_name ?? officer.name ?? "Sem nome";
                  const rankName = officer.current_rank?.abbreviation ?? officer.current_rank?.name ?? "-";
                  const badgeNumber = officer.badge_number ?? "-";
                  const registrationNumber = officer.registration_number ?? "-";

                  return (
                    <div key={officer.id} className="border border-gray-300 p-4 flex flex-col items-center space-y-3">
                      <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {officer.profile_photo?.url ? (
                          <img
                            src={officer.profile_photo.url}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-gray-500">
                            {displayName.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="text-center space-y-1 w-full">
                        <p className="text-xs font-bold">{rankName}</p>
                        <p className="text-xs font-semibold">{displayName}</p>
                        <p className="text-xs">Num: {badgeNumber}</p>
                        <p className="text-xs">Mat: {registrationNumber}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-gray-300 pt-4 text-center text-xs">
                <p>Gerado automaticamente pelo SISAC • {new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {photoModalData ? (
        <PhotoModal
          isOpen={Boolean(photoModalData)}
          onClose={() => setPhotoModalData(null)}
          photoUrl={photoModalData.photoUrl}
          fallbackText={photoModalData.name.slice(0, 2).toUpperCase()}
          alt={photoModalData.name}
        />
      ) : null}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
