"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeInfo, CreditCard, GraduationCap, Mail, MapPin, Phone, ShieldCheck, UserCircle2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { useSubunit } from "@/contexts/subunit-context";
import { useArmamentLoans } from "@/hooks/use-armament-loans";
import { useMaterialLoans } from "@/hooks/use-material-loans";
import { usePoliceOfficerLeaves } from "@/hooks/use-police-officer-leaves";
import { usePoliceOfficerPublications } from "@/hooks/use-police-officer-publications";
import { usePoliceOfficerRanks } from "@/hooks/use-police-officer-ranks";
import { usePoliceOfficerRetirementRequests } from "@/hooks/use-police-officer-retirement-requests";
import { usePoliceOfficerVacations } from "@/hooks/use-police-officer-vacations";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficer } from "@/hooks/use-police-officers";
import { useVehicleCustodies } from "@/hooks/use-vehicle-custodies";
import { useVehicleLoans } from "@/hooks/use-vehicle-loans";
import { ArmamentLoansTable } from "@/components/armament-loans/table";
import { MaterialLoansTable } from "@/components/material-loans/table";
import { PoliceOfficerLeavesTable } from "@/components/police-officer-leaves/table";
import { PoliceOfficerPublicationsTable } from "@/components/police-officer-publications/table";
import { PoliceOfficerRanksTable } from "@/components/police-officer-ranks/table";
import { PoliceOfficerRetirementRequestsTable } from "@/components/police-officer-retirement-requests/table";
import { PoliceOfficerVacationsTable } from "@/components/police-officer-vacations/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleCustodiesTable } from "@/components/vehicle-custodies/table";
import { VehicleLoansTable } from "@/components/vehicle-loans/table";
import { PoliceOfficerAllocationsSection } from "@/components/police-officers/allocations-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhotoModal } from "@/components/ui/photo-modal";

type RelatedTabSectionProps = {
  title: string;
  description: string;
  href: string;
  requiresSubunit?: boolean;
  hasActiveSubunit: boolean;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
};

function RelatedTabSection({
  title,
  description,
  href,
  requiresSubunit = false,
  hasActiveSubunit,
  isLoading,
  isError,
  isEmpty,
  emptyMessage,
  children,
}: RelatedTabSectionProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requiresSubunit && !hasActiveSubunit ? (
          <p className="text-sm text-slate-500">
            Selecione uma subunidade ativa para carregar este módulo.
          </p>
        ) : isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isError ? (
          <p className="text-sm text-slate-500">
            Não foi possível carregar os dados desta aba.
          </p>
        ) : isEmpty ? (
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          children
        )}

        <div className="flex justify-end">
          <Button asChild variant="outline">
            <Link href={href}>Abrir módulo completo</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PoliceOfficerShowPage() {
  const params = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("police-officers");
  const policeOfficerQuery = usePoliceOfficer(params.id);
  const [activeTab, setActiveTab] = useState("summary");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const leavesQuery = usePoliceOfficerLeaves(
    { per_page: 100, police_officer_id: Number(params.id) },
    Boolean(activeSubunit) && activeTab === "leaves",
  );
  const publicationsQuery = usePoliceOfficerPublications(
    { per_page: 100, police_officer_id: Number(params.id) },
    activeTab === "publications",
  );
  const ranksQuery = usePoliceOfficerRanks(
    { per_page: 100, police_officer_id: Number(params.id) },
    Boolean(activeSubunit) && activeTab === "ranks",
  );
  const retirementQuery = usePoliceOfficerRetirementRequests(
    { per_page: 100, police_officer_id: Number(params.id) },
    activeTab === "retirement",
  );
  const vacationsQuery = usePoliceOfficerVacations(
    { per_page: 100, police_officer_id: Number(params.id) },
    Boolean(activeSubunit) && activeTab === "vacations",
  );
  const vehicleLoansQuery = useVehicleLoans(
    {
      per_page: 100,
      borrower_type: "App\\Models\\PoliceOfficer",
      borrower_id: Number(params.id),
    },
    Boolean(activeSubunit) && activeTab === "vehicle-loans",
  );
  const vehicleCustodiesQuery = useVehicleCustodies(
    {
      per_page: 100,
      custodian_type: "App\\Models\\PoliceOfficer",
      custodian_id: Number(params.id),
    },
    Boolean(activeSubunit) && activeTab === "vehicle-custodies",
  );
  const armamentLoansQuery = useArmamentLoans(
    { per_page: 100, police_officer_id: Number(params.id) },
    Boolean(activeSubunit) && activeTab === "armament-loans",
  );
  const materialLoansQuery = useMaterialLoans(
    { per_page: 100, police_officer_id: Number(params.id) },
    Boolean(activeSubunit) && activeTab === "material-loans",
  );

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `view` para visualizar policiais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (policeOfficerQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (policeOfficerQuery.isError || !policeOfficerQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar policial</CardTitle>
          <CardDescription>Os dados do policial não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const policeOfficer = policeOfficerQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsPhotoModalOpen(true)}>
            {policeOfficer.profile_photo?.url ? (
              <AvatarImage src={policeOfficer.profile_photo.url} alt={policeOfficer.name ?? policeOfficer.war_name} />
            ) : null}
            <AvatarFallback className="text-lg">{(policeOfficer.name ?? policeOfficer.war_name).slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-3xl text-slate-900">{policeOfficer.name ?? policeOfficer.user?.name ?? "Sem nome"}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Nome de guerra: {policeOfficer.war_name} • Matrícula: {policeOfficer.registration_number}
            </p>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              Registro funcional completo do policial, incluindo dados civis, identificação militar, escolaridade e histórico de graduações.
            </p>
          </div>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/police-officers/${policeOfficer.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="leaves">Licenças</TabsTrigger>
          <TabsTrigger value="publications">Publicações</TabsTrigger>
          <TabsTrigger value="ranks">Graduações</TabsTrigger>
          <TabsTrigger value="retirement">Aposentadoria</TabsTrigger>
          <TabsTrigger value="vacations">Férias</TabsTrigger>
          <TabsTrigger value="vehicle-loans">Empréstimos de viaturas</TabsTrigger>
          <TabsTrigger value="vehicle-custodies">Cautelas de viaturas</TabsTrigger>
          <TabsTrigger value="armament-loans">Empréstimos de armamentos</TabsTrigger>
          <TabsTrigger value="material-loans">Empréstimos de materiais</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Visao geral</CardTitle>
                <CardDescription>Resumo rápido do policial.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Graduação atual</p>
                    <p className="text-sm text-slate-700">
                      {policeOfficer.current_rank ? `${policeOfficer.current_rank.name} (${policeOfficer.current_rank.abbreviation ?? "-"})` : "Não informada"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Escolaridade</p>
                    <p className="text-sm text-slate-700">{policeOfficer.education_level?.name ?? "Não informada"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <BadgeInfo className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                    <p className="text-sm text-slate-700">{policeOfficer.is_active ? "Ativo" : "Inativo"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <UserCircle2 className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                    <p className="text-sm text-slate-700">
                      {policeOfficer.creator ? `${policeOfficer.creator.name} (${policeOfficer.creator.email})` : "Não informado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Dados pessoais e funcionais</CardTitle>
                <CardDescription>Informações retornadas pelo `PoliceOfficerResource`.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">CPF</p>
                  <p className="mt-1 text-sm text-slate-700">{policeOfficer.cpf ?? "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Numeral</p>
                  <p className="mt-1 text-sm text-slate-700">{policeOfficer.badge_number ?? "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <Mail className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-sm text-slate-700">{policeOfficer.email ?? "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <Phone className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-sm text-slate-700">{policeOfficer.phone ?? policeOfficer.phone2 ?? "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <MapPin className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-sm text-slate-700">
                    {[policeOfficer.street, policeOfficer.number, policeOfficer.neighborhood].filter(Boolean).join(", ") || "Não informado"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <CreditCard className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-sm text-slate-700">
                    {policeOfficer.bank ? `${policeOfficer.bank.name} • Ag ${policeOfficer.agency ?? "-"} • Cc ${policeOfficer.account ?? "-"}` : "Não informado"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle>Histórico de graduações</CardTitle>
              <CardDescription>Dados carregados em `rank_history` no endpoint de detalhe.</CardDescription>
            </CardHeader>
            <CardContent>
              {policeOfficer.rank_history?.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {policeOfficer.rank_history.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {item.rank ? `${item.rank.name} (${item.rank.abbreviation ?? "-"})` : "Graduação não informada"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Início: {item.start_date ?? "-"} • Fim: {item.end_date ?? "Atual"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{item.is_current ? "Atual" : "Histórico"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Nenhum registro de graduação encontrado para este policial.</p>
              )}
            </CardContent>
          </Card>

          <PoliceOfficerAllocationsSection
            policeOfficerId={policeOfficer.id}
            policeOfficerName={policeOfficer.name ?? policeOfficer.user?.name ?? policeOfficer.war_name}
          />
        </TabsContent>

        <TabsContent value="leaves">
          <RelatedTabSection
            title="Leaves"
            description="Afastamentos vinculados a este policial."
            href={`/police-officer-leaves?police_officer_id=${policeOfficer.id}`}
            requiresSubunit
            hasActiveSubunit={Boolean(activeSubunit)}
            isLoading={leavesQuery.isLoading}
            isError={leavesQuery.isError}
            isEmpty={!leavesQuery.data?.data.length}
            emptyMessage="Nenhum afastamento encontrado para este policial."
          >
            <PoliceOfficerLeavesTable policeOfficerLeaves={leavesQuery.data?.data ?? []} />
          </RelatedTabSection>
        </TabsContent>

        <TabsContent value="publications">
          <RelatedTabSection
            title="Publications"
            description="Publicações funcionais vinculadas a este policial."
            href={`/police-officer-publications?police_officer_id=${policeOfficer.id}`}
            hasActiveSubunit={Boolean(activeSubunit)}
            isLoading={publicationsQuery.isLoading}
            isError={publicationsQuery.isError}
            isEmpty={!publicationsQuery.data?.data.length}
            emptyMessage="Nenhuma publicação encontrada para este policial."
          >
            <PoliceOfficerPublicationsTable policeOfficerPublications={publicationsQuery.data?.data ?? []} />
          </RelatedTabSection>
        </TabsContent>

        <TabsContent value="ranks">
          <RelatedTabSection
            title="Ranks"
            description="Promoções e histórico formal de graduações deste policial."
            href={`/police-officer-ranks?police_officer_id=${policeOfficer.id}`}
            requiresSubunit
            hasActiveSubunit={Boolean(activeSubunit)}
            isLoading={ranksQuery.isLoading}
            isError={ranksQuery.isError}
            isEmpty={!ranksQuery.data?.data.length}
            emptyMessage="Nenhum registro formal de rank encontrado para este policial."
          >
            <PoliceOfficerRanksTable policeOfficerRanks={ranksQuery.data?.data ?? []} />
          </RelatedTabSection>
        </TabsContent>

        <TabsContent value="retirement">
          <RelatedTabSection
            title="Retirement Request"
            description="Pedidos de aposentadoria vinculados a este policial."
            href={`/police-officer-retirement-requests?police_officer_id=${policeOfficer.id}`}
            hasActiveSubunit={Boolean(activeSubunit)}
            isLoading={retirementQuery.isLoading}
            isError={retirementQuery.isError}
            isEmpty={!retirementQuery.data?.data.length}
            emptyMessage="Nenhum pedido de aposentadoria encontrado para este policial."
          >
            <PoliceOfficerRetirementRequestsTable policeOfficerRetirementRequests={retirementQuery.data?.data ?? []} />
          </RelatedTabSection>
        </TabsContent>

        <TabsContent value="vacations">
          <RelatedTabSection
            title="Vacations"
            description="Férias e saldos de períodos vinculados a este policial."
            href={`/police-officer-vacations?police_officer_id=${policeOfficer.id}`}
            requiresSubunit
            hasActiveSubunit={Boolean(activeSubunit)}
            isLoading={vacationsQuery.isLoading}
            isError={vacationsQuery.isError}
            isEmpty={!vacationsQuery.data?.data.length}
            emptyMessage="Nenhum registro de férias encontrado para este policial."
          >
            <PoliceOfficerVacationsTable vacations={vacationsQuery.data?.data ?? []} />
          </RelatedTabSection>
        </TabsContent>

        <TabsContent value="vehicle-loans">
          <RelatedTabSection
            title="Vehicle Loans"
            description="Empréstimos de veículos em que este policial aparece como tomador."
            href={`/vehicle-loans?borrower_id=${policeOfficer.id}`}
            requiresSubunit
            hasActiveSubunit={Boolean(activeSubunit)}
            isLoading={vehicleLoansQuery.isLoading}
            isError={vehicleLoansQuery.isError}
            isEmpty={!vehicleLoansQuery.data?.data.length}
            emptyMessage="Nenhum empréstimo de veículo encontrado para este policial."
          >
            <VehicleLoansTable loans={vehicleLoansQuery.data?.data ?? []} />
          </RelatedTabSection>
        </TabsContent>

        <TabsContent value="vehicle-custodies">
          <RelatedTabSection
            title="Vehicle Custodies"
            description="Cautelas de veículos vinculadas a este policial."
            href={`/vehicle-custodies?custodian_id=${policeOfficer.id}`}
            requiresSubunit
            hasActiveSubunit={Boolean(activeSubunit)}
            isLoading={vehicleCustodiesQuery.isLoading}
            isError={vehicleCustodiesQuery.isError}
            isEmpty={!vehicleCustodiesQuery.data?.data.length}
            emptyMessage="Nenhuma cautela de veículo encontrada para este policial."
          >
            <VehicleCustodiesTable custodies={vehicleCustodiesQuery.data?.data ?? []} />
          </RelatedTabSection>
        </TabsContent>

        <TabsContent value="armament-loans">
          <RelatedTabSection
            title="Armament Loans"
            description="Empréstimos e cautelas de armamento vinculados a este policial."
            href={`/armament-loans?police_officer_id=${policeOfficer.id}`}
            requiresSubunit
            hasActiveSubunit={Boolean(activeSubunit)}
            isLoading={armamentLoansQuery.isLoading}
            isError={armamentLoansQuery.isError}
            isEmpty={!armamentLoansQuery.data?.data.length}
            emptyMessage="Nenhum empréstimo de armamento encontrado para este policial."
          >
            <ArmamentLoansTable loans={armamentLoansQuery.data?.data ?? []} />
          </RelatedTabSection>
        </TabsContent>

        <TabsContent value="material-loans">
          <RelatedTabSection
            title="Material Loans"
            description="Empréstimos e cautelas de materiais vinculados a este policial."
            href={`/material-loans?police_officer_id=${policeOfficer.id}`}
            requiresSubunit
            hasActiveSubunit={Boolean(activeSubunit)}
            isLoading={materialLoansQuery.isLoading}
            isError={materialLoansQuery.isError}
            isEmpty={!materialLoansQuery.data?.data.length}
            emptyMessage="Nenhum empréstimo de material encontrado para este policial."
          >
            <MaterialLoansTable loans={materialLoansQuery.data?.data ?? []} />
          </RelatedTabSection>
        </TabsContent>
      </Tabs>

      <PhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        photoUrl={policeOfficer.profile_photo?.url}
        fallbackText={(policeOfficer.name ?? policeOfficer.war_name).slice(0, 2).toUpperCase()}
        alt={policeOfficer.name ?? policeOfficer.war_name}
      />
    </div>
  );
}
