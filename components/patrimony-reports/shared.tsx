"use client";

import Link from "next/link";
import { ArrowLeft, Landmark, Search } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePatrimonies } from "@/hooks/use-patrimonies";
import { usePatrimonyTypes } from "@/hooks/use-patrimony-types";
import { usePermissions } from "@/hooks/use-permissions";
import { useSectors } from "@/hooks/use-sectors";
import { hasPermission } from "@/lib/permissions";
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

export function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}

export function usePatrimonyReportsAccess(requireView = false) {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("patrimonies");
  return {
    enabled: hasPermission(user, "reports") && (requireView ? permissions.canView : permissions.canViewAny) && Boolean(activeSubunit),
  };
}

export function PatrimonyReportsGuard({ requireView = false, children }: { requireView?: boolean; children: React.ReactNode }) {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("patrimonies");

  if (!hasPermission(user, "reports") || !(requireView ? permissions.canView : permissions.canViewAny)) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Acesso negado</CardTitle><CardDescription>Você precisa do slug `reports` e da permissão `patrimonies.{requireView ? "view" : "viewAny"}` para acessar este relatório.</CardDescription></CardHeader></Card>;
  }

  if (!activeSubunit) {
    return <Card className="border-slate-200/70 bg-white/80"><CardHeader><CardTitle>Selecione uma subunidade</CardTitle><CardDescription>Os relatórios de patrimônios dependem da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.</CardDescription></CardHeader></Card>;
  }

  return <>{children}</>;
}

export function PatrimonyReportShell({ title, description, href = "/patrimony-reports", children }: { title: string; description: string; href?: string; children: React.ReactNode }) {
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
            <Landmark className="h-5 w-5" />
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
  return <div className="relative md:col-span-2 xl:col-span-6"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Buscar por código, descrição, série ou fornecedor" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p><Input type="date" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

export function CurrencyField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p><Input type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
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

export function PatrimonySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const query = usePatrimonies({ per_page: 100 });
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Patrimônio" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os patrimônios</SelectItem>{(query.data?.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.code}</SelectItem>)}</SelectContent></Select>;
}

export function PatrimonyTypeSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const query = usePatrimonyTypes({ per_page: 100 });
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{(query.data?.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select>;
}

export function SectorSelect({ value, onChange, placeholder = "Setor" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const query = useSectors({ per_page: 100 });
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent><SelectItem value="all">Todos os setores</SelectItem>{(query.data?.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.abbreviation || item.name}</SelectItem>)}</SelectContent></Select>;
}

export function StatusSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <GenericSelect value={value} onChange={onChange} placeholder="Status" allLabel="Todos os status" options={[{ value: "active", label: "Ativo" }, { value: "returned", label: "Devolvido" }, { value: "disposed", label: "Baixado" }]} />;
}
