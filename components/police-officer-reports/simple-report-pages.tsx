"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BarChart3, CalendarClock, FileHeart, ShieldCheck, Workflow } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import {
  usePoliceOfficerAllocationHistoryReport,
  usePoliceOfficerCoursesOverviewReport,
  usePoliceOfficerFunctionalPanelReport,
  usePoliceOfficerPendingCertificatesReport,
  usePoliceOfficerPendingCopemReport,
  usePoliceOfficerPromotionEligibilityReport,
  usePoliceOfficerPromotionHistoryReport,
  usePoliceOfficerRetirementRequestsReport,
} from "@/hooks/use-police-officer-reports";
import { useRanks } from "@/hooks/use-ranks";
import { formatBrazilianDate, formatBrazilianDateRange } from "@/lib/date-formatter";
import { hasPermission } from "@/lib/permissions";
import type { PoliceOfficerReportFilters } from "@/types/police-officer-report.type";
import { PoliceOfficerAggregateFilters } from "@/components/police-officer-reports/aggregate-filters";
import { PoliceOfficerCoursesFilters } from "@/components/police-officer-reports/courses-filters";
import { PoliceOfficerLeavesFilters } from "@/components/police-officer-reports/leaves-filters";
import { PoliceOfficerRetirementFilters } from "@/components/police-officer-reports/retirement-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

function ReportShell({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6">
        <Button asChild variant="ghost" className="px-2">
          <Link href="/police-officer-reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Relatórios
          </Link>
        </Button>
        <div className="mt-3 flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function useReportAccess() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("police-officers");

  return {
    hasReportsSlug: hasPermission(user, "reports"),
    canViewAny: permissions.canViewAny,
    hasActiveSubunit: Boolean(activeSubunit),
  };
}

function Guard({
  access,
  children,
}: {
  access: ReturnType<typeof useReportAccess>;
  children: React.ReactNode;
}) {
  const { hasReportsSlug, canViewAny, hasActiveSubunit } = access;

  if (!hasReportsSlug || !canViewAny) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Acesso negado</CardTitle><CardDescription>Você precisa do slug `reports` e da permissão `police-officers.viewAny` para acessar este relatório.</CardDescription></CardHeader></Card>;
  }

  if (!hasActiveSubunit) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Selecione uma subunidade</CardTitle><CardDescription>Escolha uma subunidade ativa antes de gerar este relatório.</CardDescription></CardHeader></Card>;
  }

  return <>{children}</>;
}

export function PoliceOfficerAllocationHistoryReportPage() {
  const access = useReportAccess();
  const [search, setSearch] = useState("");
  const [sectorId, setSectorId] = useState("all");
  const [assignmentId, setAssignmentId] = useState("all");
  const [rankId, setRankId] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<PoliceOfficerReportFilters>(() => ({
    page, per_page: 15, search: search || undefined, sector_id: sectorId !== "all" ? Number(sectorId) : undefined,
    assignment_id: assignmentId !== "all" ? Number(assignmentId) : undefined, rank_id: rankId !== "all" ? Number(rankId) : undefined,
    is_active: activeStatus === "all" ? undefined : activeStatus === "active", date_from: dateFrom || undefined, date_to: dateTo || undefined,
  }), [activeStatus, assignmentId, dateFrom, dateTo, page, rankId, search, sectorId]);
  const reportQuery = usePoliceOfficerAllocationHistoryReport(filters, access.hasReportsSlug && access.canViewAny && access.hasActiveSubunit);

  return <Guard access={access}><ReportShell title="Histórico de lotações" description="Consulta paginada das lotações por setor, função e período." icon={Workflow}>
    <PoliceOfficerAggregateFilters search={search} sectorId={sectorId} assignmentId={assignmentId} rankId={rankId} activeStatus={activeStatus}
      onSearchChange={(v)=>{setSearch(v);setPage(1);}} onSectorChange={(v)=>{setSectorId(v);setPage(1);}} onAssignmentChange={(v)=>{setAssignmentId(v);setPage(1);}}
      onRankChange={(v)=>{setRankId(v);setPage(1);}} onActiveStatusChange={(v)=>{setActiveStatus(v);setPage(1);}}
      onClear={()=>{setSearch("");setSectorId("all");setAssignmentId("all");setRankId("all");setActiveStatus("all");setPage(1);}}
    />
    <div className="grid gap-3 md:grid-cols-2">
      <InputDate label="Data inicial" value={dateFrom} onChange={(v)=>{setDateFrom(v);setPage(1);}} />
      <InputDate label="Data final" value={dateTo} onChange={(v)=>{setDateTo(v);setPage(1);}} />
    </div>
    {reportQuery.isLoading ? <LoadingCards /> : reportQuery.isError ? <ErrorCard text="Não foi possível carregar o histórico de lotações." /> : !reportQuery.data?.data.length ? <EmptyCard text="Nenhuma lotação encontrada." /> : (
      <div className="space-y-4">
        <TableWrap headers={["Policial","Setor","Função","Período","Situação"]}>
          {reportQuery.data.data.map((item) => (
            <tr key={item.id} className="border-t border-slate-200/70">
              <td className="px-4 py-4"><p className="font-medium text-slate-900">{item.police_officer?.name ?? item.police_officer?.war_name ?? "Sem nome"}</p><p className="text-xs text-slate-500">{item.police_officer?.registration_number ?? "-"}</p></td>
              <td className="px-4 py-4 text-slate-700">{item.sector?.name ?? "-"}</td>
              <td className="px-4 py-4 text-slate-700">{item.assignment?.name ?? "-"}</td>
              <td className="px-4 py-4 text-slate-700">{formatBrazilianDate(item.start_date)} até {item.end_date ? formatBrazilianDate(item.end_date) : "Atual"}</td>
              <td className="px-4 py-4"><Badge variant={item.is_current ? "success" : "outline"}>{item.is_current ? "Atual" : "Encerrada"}</Badge></td>
            </tr>
          ))}
        </TableWrap>
        <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
      </div>
    )}
  </ReportShell></Guard>;
}

export function PoliceOfficerPromotionEligibilityReportPage() {
  const access = useReportAccess();
  const [search, setSearch] = useState("");
  const [sectorId, setSectorId] = useState("all");
  const [assignmentId, setAssignmentId] = useState("all");
  const [rankId, setRankId] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<PoliceOfficerReportFilters>(() => ({
    page, per_page: 15, search: search || undefined, sector_id: sectorId !== "all" ? Number(sectorId) : undefined,
    assignment_id: assignmentId !== "all" ? Number(assignmentId) : undefined, rank_id: rankId !== "all" ? Number(rankId) : undefined,
    is_active: activeStatus === "all" ? undefined : activeStatus === "active", date_to: dateTo || undefined,
  }), [activeStatus, assignmentId, dateTo, page, rankId, search, sectorId]);
  const reportQuery = usePoliceOfficerPromotionEligibilityReport(filters, access.hasReportsSlug && access.canViewAny && access.hasActiveSubunit);

  return <Guard access={access}><ReportShell title="Aptidão para promoção" description="Painel paginado de elegibilidade à promoção com base no interstício." icon={ShieldCheck}>
    <PoliceOfficerAggregateFilters search={search} sectorId={sectorId} assignmentId={assignmentId} rankId={rankId} activeStatus={activeStatus}
      onSearchChange={(v)=>{setSearch(v);setPage(1);}} onSectorChange={(v)=>{setSectorId(v);setPage(1);}} onAssignmentChange={(v)=>{setAssignmentId(v);setPage(1);}}
      onRankChange={(v)=>{setRankId(v);setPage(1);}} onActiveStatusChange={(v)=>{setActiveStatus(v);setPage(1);}}
      onClear={()=>{setSearch("");setSectorId("all");setAssignmentId("all");setRankId("all");setActiveStatus("all");setPage(1);}}
    />
    <InputDate label="Data de referência" value={dateTo} onChange={(v)=>{setDateTo(v);setPage(1);}} />
    {reportQuery.isLoading ? <LoadingCards /> : reportQuery.isError ? <ErrorCard text="Não foi possível carregar a aptidão para promoção." /> : !reportQuery.data?.data.length ? <EmptyCard text="Nenhum policial encontrado." /> : (
      <div className="space-y-4">
        <TableWrap headers={["Policial","Graduação atual","Tempo no posto","Lotação","Elegibilidade"]}>
          {reportQuery.data.data.map((item) => (
            <tr key={item.id} className="border-t border-slate-200/70">
              <td className="px-4 py-4"><p className="font-medium text-slate-900">{item.name ?? item.war_name ?? "Sem nome"}</p><p className="text-xs text-slate-500">{item.registration_number ?? "-"}</p></td>
              <td className="px-4 py-4 text-slate-700">{item.current_rank ? `${item.current_rank.name} (${item.current_rank.abbreviation ?? "-"})` : "-"}</td>
              <td className="px-4 py-4 text-slate-700">{item.years_in_current_rank ?? 0} ano(s)</td>
              <td className="px-4 py-4 text-slate-700">{item.current_allocation?.sector?.name ?? "-"}<p className="text-xs text-slate-500">{item.current_allocation?.assignment?.name ?? "-"}</p></td>
              <td className="px-4 py-4"><Badge variant={item.eligible_for_promotion ? "success" : "outline"}>{item.eligible_for_promotion ? "Elegível" : "Pendente interstício"}</Badge></td>
            </tr>
          ))}
        </TableWrap>
        <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
      </div>
    )}
  </ReportShell></Guard>;
}

export function PoliceOfficerPromotionHistoryReportPage() {
  const access = useReportAccess();
  const [rankId, setRankId] = useState("all");
  const [promotionType, setPromotionType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<PoliceOfficerReportFilters>(() => ({
    page, per_page: 15, rank_id: rankId !== "all" ? Number(rankId) : undefined, promotion_type: promotionType !== "all" ? promotionType : undefined,
    date_from: dateFrom || undefined, date_to: dateTo || undefined,
  }), [dateFrom, dateTo, page, promotionType, rankId]);
  const reportQuery = usePoliceOfficerPromotionHistoryReport(filters, access.hasReportsSlug && access.canViewAny && access.hasActiveSubunit);

  return <Guard access={access}><ReportShell title="Histórico de promoções" description="Consulta de promoções por tipo, graduação e período." icon={ShieldCheck}>
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-5">
      <RankSelect value={rankId} onChange={(v)=>{setRankId(v);setPage(1);}} />
      <SimpleSelect value={promotionType} placeholder="Tipo de promoção" allLabel="Todos os tipos" options={[["merit","Merecimento"],["seniority","Antiguidade"],["bravery","Bravura"]]} onChange={(v)=>{setPromotionType(v);setPage(1);}} />
      <InputDate label="" value={dateFrom} onChange={(v)=>{setDateFrom(v);setPage(1);}} />
      <InputDate label="" value={dateTo} onChange={(v)=>{setDateTo(v);setPage(1);}} />
      <Button type="button" variant="outline" onClick={()=>{setRankId("all");setPromotionType("all");setDateFrom("");setDateTo("");setPage(1);}}>Limpar</Button>
    </div>
    {reportQuery.isLoading ? <LoadingCards /> : reportQuery.isError ? <ErrorCard text="Não foi possível carregar o histórico de promoções." /> : !reportQuery.data?.data.length ? <EmptyCard text="Nenhuma promoção encontrada." /> : (
      <div className="space-y-4">
        <TableWrap headers={["Policial","Graduação","Tipo","Data da promoção","Boletim"]}>
          {reportQuery.data.data.map((item) => (
            <tr key={item.id} className="border-t border-slate-200/70">
              <td className="px-4 py-4"><p className="font-medium text-slate-900">{item.police_officer?.name ?? item.police_officer?.war_name ?? "Sem nome"}</p><p className="text-xs text-slate-500">{item.police_officer?.registration_number ?? "-"}</p></td>
              <td className="px-4 py-4 text-slate-700">{item.rank?.name ?? "-"}</td>
              <td className="px-4 py-4 text-slate-700">{item.promotion_type ?? "-"}</td>
              <td className="px-4 py-4 text-slate-700">{formatBrazilianDate(item.promotion_date)}</td>
              <td className="px-4 py-4 text-slate-700">{item.promotion_bulletin ?? "-"}</td>
            </tr>
          ))}
        </TableWrap>
        <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
      </div>
    )}
  </ReportShell></Guard>;
}

export function PoliceOfficerPendingCopemReportPage() {
  const access = useReportAccess();
  const [search, setSearch] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("all");
  const [leaveStatus, setLeaveStatus] = useState("all");
  const [sectorId, setSectorId] = useState("all");
  const [rankId, setRankId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<PoliceOfficerReportFilters>(() => ({
    page, per_page: 15, search: search || undefined, leave_type_id: leaveTypeId !== "all" ? Number(leaveTypeId) : undefined,
    leave_status: leaveStatus !== "all" ? leaveStatus : undefined, sector_id: sectorId !== "all" ? Number(sectorId) : undefined,
    rank_id: rankId !== "all" ? Number(rankId) : undefined, requires_copem: true, date_from: dateFrom || undefined, date_to: dateTo || undefined,
  }), [dateFrom, dateTo, leaveStatus, leaveTypeId, page, rankId, search, sectorId]);
  const reportQuery = usePoliceOfficerPendingCopemReport(filters, access.hasReportsSlug && access.canViewAny && access.hasActiveSubunit);

  return <Guard access={access}><ReportShell title="Pendências COPEM" description="Afastamentos pendentes de agenda, avaliação ou conclusão pela COPEM." icon={FileHeart}>
    <PoliceOfficerLeavesFilters search={search} leaveTypeId={leaveTypeId} leaveStatus={leaveStatus} requiresCopem="true" copemResult="all" sectorId={sectorId} rankId={rankId} dateFrom={dateFrom} dateTo={dateTo}
      onSearchChange={(v)=>{setSearch(v);setPage(1);}} onLeaveTypeChange={(v)=>{setLeaveTypeId(v);setPage(1);}} onLeaveStatusChange={(v)=>{setLeaveStatus(v);setPage(1);}}
      onRequiresCopemChange={()=>{}} onCopemResultChange={()=>{}} onSectorChange={(v)=>{setSectorId(v);setPage(1);}} onRankChange={(v)=>{setRankId(v);setPage(1);}}
      onDateFromChange={(v)=>{setDateFrom(v);setPage(1);}} onDateToChange={(v)=>{setDateTo(v);setPage(1);}}
      onClear={()=>{setSearch("");setLeaveTypeId("all");setLeaveStatus("all");setSectorId("all");setRankId("all");setDateFrom("");setDateTo("");setPage(1);}}
    />
    {reportQuery.isLoading ? <LoadingCards /> : reportQuery.isError ? <ErrorCard text="Não foi possível carregar as pendências COPEM." /> : !reportQuery.data?.data.length ? <EmptyCard text="Nenhuma pendência COPEM encontrada." /> : (
      <div className="space-y-4">
        <TableWrap headers={["Policial","Tipo","Status","Agenda COPEM","Protocolo"]}>
          {reportQuery.data.data.map((item) => (
            <tr key={item.id} className="border-t border-slate-200/70">
              <td className="px-4 py-4"><p className="font-medium text-slate-900">{item.police_officer?.name ?? item.police_officer?.war_name ?? "Sem nome"}</p></td>
              <td className="px-4 py-4 text-slate-700">{item.leave_type?.name ?? "-"}</td>
              <td className="px-4 py-4"><Badge variant="outline">{item.status?.label ?? "-"}</Badge></td>
              <td className="px-4 py-4 text-slate-700">{formatBrazilianDate(item.copem_scheduled_date ?? item.copem_evaluation_date)}</td>
              <td className="px-4 py-4 text-slate-700">{item.copem_protocol ?? "-"}</td>
            </tr>
          ))}
        </TableWrap>
        <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
      </div>
    )}
  </ReportShell></Guard>;
}

export function PoliceOfficerCoursesOverviewReportPage() {
  const access = useReportAccess();
  const [search, setSearch] = useState("");
  const [courseClassId, setCourseClassId] = useState("all");
  const [courseStatus, setCourseStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<PoliceOfficerReportFilters>(() => ({
    page, per_page: 15, search: search || undefined, course_class_id: courseClassId !== "all" ? Number(courseClassId) : undefined,
    course_status: courseStatus !== "all" ? courseStatus : undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined,
  }), [courseClassId, courseStatus, dateFrom, dateTo, page, search]);
  const reportQuery = usePoliceOfficerCoursesOverviewReport(filters, access.hasReportsSlug && access.canViewAny && access.hasActiveSubunit);

  return <Guard access={access}><ReportShell title="Cursos" description="Visão paginada dos cursos com resumo por status." icon={BarChart3}>
    <PoliceOfficerCoursesFilters search={search} courseClassId={courseClassId} courseStatus={courseStatus} dateFrom={dateFrom} dateTo={dateTo}
      onSearchChange={(v)=>{setSearch(v);setPage(1);}} onCourseClassChange={(v)=>{setCourseClassId(v);setPage(1);}}
      onCourseStatusChange={(v)=>{setCourseStatus(v);setPage(1);}} onDateFromChange={(v)=>{setDateFrom(v);setPage(1);}}
      onDateToChange={(v)=>{setDateTo(v);setPage(1);}} onClear={()=>{setSearch("");setCourseClassId("all");setCourseStatus("all");setDateFrom("");setDateTo("");setPage(1);}}
    />
    {reportQuery.data?.summary?.length ? (
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {reportQuery.data.summary.map((item) => (
          <Card key={item.status.value} className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>{item.status.label}</CardDescription><CardTitle>{item.total_registrations}</CardTitle></CardHeader><CardContent className="text-sm text-slate-500">{item.total_workload_hours}h</CardContent></Card>
        ))}
      </div>
    ) : null}
    {reportQuery.isLoading ? <LoadingCards /> : reportQuery.isError ? <ErrorCard text="Não foi possível carregar o relatório de cursos." /> : !reportQuery.data?.data.length ? <EmptyCard text="Nenhum curso encontrado." /> : (
      <div className="space-y-4">
        <TableWrap headers={["Policial","Curso/Turma","Status","Período","Certificado"]}>
          {reportQuery.data.data.map((item) => (
            <tr key={item.id} className="border-t border-slate-200/70">
              <td className="px-4 py-4"><p className="font-medium text-slate-900">{item.user?.name ?? "Sem nome"}</p></td>
              <td className="px-4 py-4 text-slate-700">{item.course?.name ?? item.course_class?.name ?? "-"}</td>
              <td className="px-4 py-4"><Badge variant="outline">{item.status_label ?? "-"}</Badge></td>
              <td className="px-4 py-4 text-slate-700">{formatBrazilianDateRange(item.start_date, item.end_date)}</td>
              <td className="px-4 py-4 text-slate-700">{item.certificate_issued_at ? formatBrazilianDate(item.certificate_issued_at) : (item.has_certificate ? "Emitido" : "Não emitido")}</td>
            </tr>
          ))}
        </TableWrap>
        <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
      </div>
    )}
  </ReportShell></Guard>;
}

export function PoliceOfficerPendingCertificatesReportPage() {
  const access = useReportAccess();
  const [search, setSearch] = useState("");
  const [courseClassId, setCourseClassId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<PoliceOfficerReportFilters>(() => ({
    page, per_page: 15, search: search || undefined, course_class_id: courseClassId !== "all" ? Number(courseClassId) : undefined,
    date_from: dateFrom || undefined, date_to: dateTo || undefined,
  }), [courseClassId, dateFrom, dateTo, page, search]);
  const reportQuery = usePoliceOfficerPendingCertificatesReport(filters, access.hasReportsSlug && access.canViewAny && access.hasActiveSubunit);

  return <Guard access={access}><ReportShell title="Certificados pendentes" description="Policiais aptos a receber certificado e ainda pendentes de emissão." icon={BarChart3}>
    <PoliceOfficerCoursesFilters search={search} courseClassId={courseClassId} courseStatus="all" dateFrom={dateFrom} dateTo={dateTo}
      onSearchChange={(v)=>{setSearch(v);setPage(1);}} onCourseClassChange={(v)=>{setCourseClassId(v);setPage(1);}} onCourseStatusChange={()=>{}}
      onDateFromChange={(v)=>{setDateFrom(v);setPage(1);}} onDateToChange={(v)=>{setDateTo(v);setPage(1);}}
      onClear={()=>{setSearch("");setCourseClassId("all");setDateFrom("");setDateTo("");setPage(1);}}
    />
    {reportQuery.isLoading ? <LoadingCards /> : reportQuery.isError ? <ErrorCard text="Não foi possível carregar os certificados pendentes." /> : !reportQuery.data?.data.length ? <EmptyCard text="Nenhum certificado pendente encontrado." /> : (
      <div className="space-y-4">
        <TableWrap headers={["Policial","Curso/Turma","Encerramento","Carga horária","Situação"]}>
          {reportQuery.data.data.map((item) => (
            <tr key={item.id} className="border-t border-slate-200/70">
              <td className="px-4 py-4"><p className="font-medium text-slate-900">{item.user?.name ?? "Sem nome"}</p></td>
              <td className="px-4 py-4 text-slate-700">{item.course?.name ?? item.course_class?.name ?? "-"}</td>
              <td className="px-4 py-4 text-slate-700">{formatBrazilianDate(item.end_date)}</td>
              <td className="px-4 py-4 text-slate-700">{item.course?.workload ?? 0}h</td>
              <td className="px-4 py-4"><Badge variant="warning">Pendente</Badge></td>
            </tr>
          ))}
        </TableWrap>
        <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
      </div>
    )}
  </ReportShell></Guard>;
}

export function PoliceOfficerRetirementRequestsReportPage() {
  const access = useReportAccess();
  const [search, setSearch] = useState("");
  const [retirementStatus, setRetirementStatus] = useState("all");
  const [requestedFrom, setRequestedFrom] = useState("");
  const [requestedTo, setRequestedTo] = useState("");
  const [approvedFrom, setApprovedFrom] = useState("");
  const [approvedTo, setApprovedTo] = useState("");
  const [publishedFrom, setPublishedFrom] = useState("");
  const [publishedTo, setPublishedTo] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<PoliceOfficerReportFilters>(() => ({
    page, per_page: 15, search: search || undefined, retirement_status: retirementStatus !== "all" ? retirementStatus : undefined,
    requested_from: requestedFrom || undefined, requested_to: requestedTo || undefined, approved_from: approvedFrom || undefined, approved_to: approvedTo || undefined,
    published_from: publishedFrom || undefined, published_to: publishedTo || undefined,
  }), [approvedFrom, approvedTo, page, publishedFrom, publishedTo, requestedFrom, requestedTo, retirementStatus, search]);
  const reportQuery = usePoliceOfficerRetirementRequestsReport(filters, access.hasReportsSlug && access.canViewAny && access.hasActiveSubunit);

  return <Guard access={access}><ReportShell title="Pedidos de aposentadoria" description="Fluxo de pedidos com resumo por status e datas principais." icon={CalendarClock}>
    <PoliceOfficerRetirementFilters search={search} retirementStatus={retirementStatus} requestedFrom={requestedFrom} requestedTo={requestedTo} approvedFrom={approvedFrom} approvedTo={approvedTo} publishedFrom={publishedFrom} publishedTo={publishedTo}
      onSearchChange={(v)=>{setSearch(v);setPage(1);}} onRetirementStatusChange={(v)=>{setRetirementStatus(v);setPage(1);}} onRequestedFromChange={(v)=>{setRequestedFrom(v);setPage(1);}}
      onRequestedToChange={(v)=>{setRequestedTo(v);setPage(1);}} onApprovedFromChange={(v)=>{setApprovedFrom(v);setPage(1);}} onApprovedToChange={(v)=>{setApprovedTo(v);setPage(1);}}
      onPublishedFromChange={(v)=>{setPublishedFrom(v);setPage(1);}} onPublishedToChange={(v)=>{setPublishedTo(v);setPage(1);}}
      onClear={()=>{setSearch("");setRetirementStatus("all");setRequestedFrom("");setRequestedTo("");setApprovedFrom("");setApprovedTo("");setPublishedFrom("");setPublishedTo("");setPage(1);}}
    />
    {reportQuery.data?.summary?.length ? (
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {reportQuery.data.summary.map((item) => (
          <Card key={item.status} className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>{item.status}</CardDescription><CardTitle>{item.total_requests}</CardTitle></CardHeader></Card>
        ))}
      </div>
    ) : null}
    {reportQuery.isLoading ? <LoadingCards /> : reportQuery.isError ? <ErrorCard text="Não foi possível carregar os pedidos de aposentadoria." /> : !reportQuery.data?.data.length ? <EmptyCard text="Nenhum pedido de aposentadoria encontrado." /> : (
      <div className="space-y-4">
        <TableWrap headers={["Policial","NUP","Status","Solicitado","Publicação"]}>
          {reportQuery.data.data.map((item) => (
            <tr key={item.id} className="border-t border-slate-200/70">
              <td className="px-4 py-4"><p className="font-medium text-slate-900">{item.police_officer?.name ?? item.police_officer?.war_name ?? "Sem nome"}</p></td>
              <td className="px-4 py-4 text-slate-700">{item.nup ?? "-"}</td>
              <td className="px-4 py-4"><Badge variant="outline">{item.status}</Badge></td>
              <td className="px-4 py-4 text-slate-700">{formatBrazilianDate(item.requested_at)}</td>
              <td className="px-4 py-4 text-slate-700">{formatBrazilianDate(item.published_at)}</td>
            </tr>
          ))}
        </TableWrap>
        <Pager data={reportQuery.data} onPageChange={setPage} disabled={reportQuery.isFetching} />
      </div>
    )}
  </ReportShell></Guard>;
}

export function PoliceOfficerFunctionalPanelReportPage() {
  const access = useReportAccess();
  const { id } = useParams<{ id: string }>();
  const reportQuery = usePoliceOfficerFunctionalPanelReport(id, access.hasReportsSlug && access.canViewAny && access.hasActiveSubunit);

  return <Guard access={access}>{reportQuery.isLoading ? <Skeleton className="h-[520px] w-full" /> : reportQuery.isError || !reportQuery.data ? <ErrorCard text="Não foi possível carregar o painel funcional." /> : (
    <ReportShell title="Painel funcional" description="Visão consolidada do histórico funcional, férias, cursos, afastamentos e aposentadoria do policial." icon={ShieldCheck}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>Policial</CardDescription><CardTitle>{reportQuery.data.data.officer.name ?? reportQuery.data.data.officer.war_name ?? "-"}</CardTitle></CardHeader></Card>
        <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>Graduação atual</CardDescription><CardTitle>{reportQuery.data.data.summary.current_rank?.name ?? "-"}</CardTitle></CardHeader></Card>
        <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>Elegível para promoção</CardDescription><CardTitle>{reportQuery.data.data.summary.eligible_for_promotion ? "Sim" : "Não"}</CardTitle></CardHeader></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Lotações" value={reportQuery.data.data.summary.total_allocations} />
        <StatCard label="Promoções" value={reportQuery.data.data.summary.total_rank_history} />
        <StatCard label="Afastamentos" value={reportQuery.data.data.summary.total_leaves} />
        <StatCard label="Cursos" value={reportQuery.data.data.summary.total_courses} />
        <StatCard label="Férias" value={reportQuery.data.data.summary.total_vacations} />
        <StatCard label="Aposentadoria" value={reportQuery.data.data.summary.total_retirement_requests} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <MiniListCard title="Lotações" items={reportQuery.data.data.allocations.map((item) => `${formatBrazilianDate(item.start_date)} • ${item.sector?.name ?? "-"} • ${item.assignment?.name ?? "-"}`)} />
        <MiniListCard title="Promoções" items={reportQuery.data.data.rank_history.map((item) => `${formatBrazilianDate(item.promotion_date ?? item.start_date)} • ${item.rank?.name ?? "-"} • ${item.promotion_type ?? "-"}`)} />
        <MiniListCard title="Afastamentos" items={reportQuery.data.data.leaves.map((item) => `${formatBrazilianDateRange(item.start_date, item.end_date)} • ${item.leave_type?.name ?? "-"}`)} />
        <MiniListCard title="Cursos" items={reportQuery.data.data.courses.map((item) => `${item.course?.name ?? item.course_class?.name ?? "-"} • ${item.status_label ?? "-"}`)} />
        <MiniListCard title="Férias" items={reportQuery.data.data.vacations.map((item) => `${item.reference_year} • ${item.status?.label ?? "-"} • disponível ${item.available_days ?? 0}`)} />
        <MiniListCard title="Aposentadoria" items={reportQuery.data.data.retirement_requests.map((item) => `${formatBrazilianDate(item.requested_at)} • ${item.status}`)} />
      </div>
    </ReportShell>
  )}</Guard>;
}

function TableWrap({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div></div>;
}
function ErrorCard({ text }: { text: string }) { return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Erro ao gerar relatório</CardTitle><CardDescription>{text}</CardDescription></CardHeader></Card>; }
function EmptyCard({ text }: { text: string }) { return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Nenhum resultado encontrado</CardTitle><CardDescription>{text}</CardDescription></CardHeader></Card>; }
function LoadingCards() { return <div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>; }
function Pager({ data, onPageChange, disabled }: { data: { meta: { current_page: number; last_page: number; total: number; from: number | null; to: number | null } }; onPageChange: (page: number) => void; disabled: boolean; }) {
  return <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} from={data.meta.from} to={data.meta.to} onPageChange={onPageChange} isDisabled={disabled} />;
}
function InputDate({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void; }) {
  return <div className="space-y-1">{label ? <p className="text-xs text-slate-500">{label}</p> : null}<Input type="date" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}
function StatCard({ label, value }: { label: string; value: number }) { return <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>{label}</CardDescription><CardTitle>{value}</CardTitle></CardHeader></Card>; }
function MiniListCard({ title, items }: { title: string; items: string[] }) {
  return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{items.length ? <div className="space-y-2">{items.slice(0, 8).map((item, index) => <div key={`${title}-${index}`} className="rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-sm text-slate-700">{item}</div>)}</div> : <p className="text-sm text-slate-500">Sem registros.</p>}</CardContent></Card>;
}
function SimpleSelect({ value, placeholder, allLabel, options, onChange }: { value: string; placeholder: string; allLabel: string; options: [string, string][]; onChange: (value: string) => void; }) {
  return <select className="flex h-10 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)} aria-label={placeholder}><option value="all">{allLabel}</option>{options.map(([optionValue,label]) => <option key={optionValue} value={optionValue}>{label}</option>)}</select>;
}
function RankSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { data } = useRanks({ per_page: 100 });

  return <select className="flex h-10 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)}><option value="all">Todas as graduações</option>{(data?.data ?? []).map((rank) => <option key={rank.id} value={String(rank.id)}>{rank.name}</option>)}</select>;
}
