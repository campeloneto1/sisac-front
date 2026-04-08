"use client";

import Link from "next/link";
import { ArrowLeft, Search, Wrench } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { useCompanies } from "@/hooks/use-companies";
import { useContracts } from "@/hooks/use-contracts";
import { usePermissions } from "@/hooks/use-permissions";
import { useSectors } from "@/hooks/use-sectors";
import { useServiceTypes } from "@/hooks/use-service-types";
import { useServices } from "@/hooks/use-services";
import { useUsers } from "@/hooks/use-users";
import { hasPermission } from "@/lib/permissions";
import { servicePriorityOptions, serviceStatusOptions } from "@/types/service.type";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return value.slice(0, 10);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function formatCurrency(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "R$ 0,00";
  const parsed = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number.isNaN(parsed) ? 0 : parsed);
}

export function useServiceReportsAccess(requireView = false) {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("services");
  return {
    enabled: hasPermission(user, "reports") && (requireView ? permissions.canView : permissions.canViewAny) && Boolean(activeSubunit),
  };
}

export function ServiceReportsGuard({ requireView = false, children }: { requireView?: boolean; children: React.ReactNode }) {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("services");

  if (!hasPermission(user, "reports") || !(requireView ? permissions.canView : permissions.canViewAny)) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Acesso negado</CardTitle><CardDescription>Você precisa do slug `reports` e da permissão `services.{requireView ? "view" : "viewAny"}` para acessar este relatório.</CardDescription></CardHeader></Card>;
  }

  if (!activeSubunit) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Selecione uma subunidade</CardTitle><CardDescription>Os relatórios de serviços dependem da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.</CardDescription></CardHeader></Card>;
  }

  return <>{children}</>;
}

export function ServiceReportShell({ title, description, href = "/service-reports", children }: { title: string; description: string; href?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6">
        <Button asChild variant="ghost" className="w-fit px-2">
          <Link href={href}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Relatórios
          </Link>
        </Button>
        <div className="mt-3 flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary">
            <Wrench className="h-5 w-5" />
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

export function FiltersGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-6">{children}</div>;
}

export function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative md:col-span-2 xl:col-span-6">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input className="pl-9" placeholder="Buscar por descrição, local, empresa ou tipo" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p><Input type="date" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

export function CurrencyField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p><Input type="number" step="0.01" min="0" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

export function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  return <Button type="button" variant="outline" onClick={onClick}>Limpar</Button>;
}

export function TableWrap({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div></div>;
}

export function LoadingCardList({ count = 3 }: { count?: number }) {
  return <div className="grid gap-4 xl:grid-cols-3">{Array.from({ length: count }).map((_, index) => <Skeleton key={index} className="h-32 rounded-[24px]" />)}</div>;
}

export function EmptyCard({ text }: { text: string }) {
  return <Card className="border-dashed border-slate-200/70 bg-white/70"><CardHeader><CardTitle>Nenhum registro</CardTitle><CardDescription>{text}</CardDescription></CardHeader></Card>;
}

export function ErrorCard({ text }: { text: string }) {
  return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Erro ao carregar</CardTitle><CardDescription>{text}</CardDescription></CardHeader></Card>;
}

export function SummaryMetric({ label, value }: { label: string; value: string }) {
  return <Card className="border-slate-200/70 bg-white/80"><CardHeader className="pb-2"><CardDescription>{label}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>;
}

export function Pager({ data, onPageChange, disabled }: { data: { meta: { current_page: number; last_page: number; total: number; from: number | null; to: number | null } }; onPageChange: (page: number) => void; disabled?: boolean }) {
  return <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} from={data.meta.from} to={data.meta.to} onPageChange={onPageChange} isDisabled={disabled} />;
}

function GenericSelect({ value, placeholder, allLabel, options, onChange }: { value: string; placeholder: string; allLabel: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent><SelectItem value="all">{allLabel}</SelectItem>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>;
}

export function ServiceSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const query = useServices({ per_page: 100 });
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Serviço" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os serviços</SelectItem>{(query.data?.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.request_description || `Serviço #${item.id}`}</SelectItem>)}</SelectContent></Select>;
}

export function CompanySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const query = useCompanies({ per_page: 100 });
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Empresa" /></SelectTrigger><SelectContent><SelectItem value="all">Todas as empresas</SelectItem>{(query.data?.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.trade_name || item.name}</SelectItem>)}</SelectContent></Select>;
}

export function ServiceTypeSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const query = useServiceTypes({ per_page: 100 });
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{(query.data?.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select>;
}

export function ContractSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const query = useContracts({ per_page: 100 });
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Contrato" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os contratos</SelectItem>{(query.data?.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.contract_number || `Contrato #${item.id}`}</SelectItem>)}</SelectContent></Select>;
}

export function UserSelect({ value, onChange, placeholder = "Usuário" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const query = useUsers({ per_page: 100 });
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent><SelectItem value="all">Todos os usuários</SelectItem>{(query.data?.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select>;
}

export function SectorSelect({ value, onChange, placeholder = "Setor" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const query = useSectors({ per_page: 100 });
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent><SelectItem value="all">Todos os setores</SelectItem>{(query.data?.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.abbreviation || item.name}</SelectItem>)}</SelectContent></Select>;
}

export function StatusSelect({ value, onChange, placeholder = "Status" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <GenericSelect value={value} onChange={onChange} placeholder={placeholder} allLabel="Todos os status" options={serviceStatusOptions} />;
}

export function PrioritySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <GenericSelect value={value} onChange={onChange} placeholder="Prioridade" allLabel="Todas as prioridades" options={servicePriorityOptions} />;
}

export function RatingSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <GenericSelect value={value} onChange={onChange} placeholder="Avaliação" allLabel="Todas as avaliações" options={[1, 2, 3, 4, 5].map((item) => ({ value: String(item), label: `${item} estrela${item > 1 ? "s" : ""}` }))} />;
}

export function YesNoSelect({ value, onChange, placeholder, allLabel, yesLabel = "Sim", noLabel = "Não" }: { value: string; onChange: (value: string) => void; placeholder: string; allLabel: string; yesLabel?: string; noLabel?: string }) {
  return <GenericSelect value={value} onChange={onChange} placeholder={placeholder} allLabel={allLabel} options={[{ value: "yes", label: yesLabel }, { value: "no", label: noLabel }]} />;
}
