"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { useContract } from "@/hooks/use-contracts";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { getContractStatusBadgeVariant, getContractStatusLabel } from "@/types/contract.type";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const subpages = [
  { href: "", label: "Resumo", resource: "contracts" },
  { href: "/roles", label: "Papeis", resource: "contract-roles" },
  { href: "/status-history", label: "Status", resource: "contract-status-histories" },
  { href: "/extensions", label: "Prorrogacoes", resource: "contract-extensions" },
  { href: "/amendments", label: "Aditivos", resource: "contract-amendments" },
  { href: "/transactions", label: "Transacoes", resource: "contract-transactions" },
  { href: "/alerts", label: "Alertas", resource: "contract-alerts" },
];

interface ContractSubpageShellProps {
  title: string;
  description: string;
  permissionDeniedTitle: string;
  permissionDeniedDescription: string;
  canView: boolean;
  children: React.ReactNode;
}

export function ContractSubpageShell({
  title,
  description,
  permissionDeniedTitle,
  permissionDeniedDescription,
  canView,
  children,
}: ContractSubpageShellProps) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const contractQuery = useContract(id, Boolean(activeSubunit));
  const visibleSubpages = subpages.filter((item) => can(user, "view", item.resource) || can(user, "viewAny", item.resource));

  if (!canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>{permissionDeniedTitle}</CardTitle>
          <CardDescription>{permissionDeniedDescription}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O módulo de contratos depende do contexto ativo para enviar `X-SUBUNIT-ACTIVE`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (contractQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (contractQuery.isError || !contractQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar contrato</CardTitle>
          <CardDescription>Não foi possível carregar o contrato base para navegar pelos submodulos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const contract = contractQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl text-slate-900">{title}</h1>
              <Badge variant={getContractStatusBadgeVariant(contract.status)}>
                {contract.status_label ?? getContractStatusLabel(contract.status)}
              </Badge>
              <Badge variant="outline">{contract.contract_number}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">Contexto ativo: {activeSubunit.name}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>Empresa: <span className="font-medium text-slate-900">{contract.company?.name ?? "Não informada"}</span></p>
            <p className="mt-1">SACC: <span className="font-medium text-slate-900">{contract.sacc_number}</span></p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {visibleSubpages.map((item) => {
            const href = `/contracts/${contract.id}${item.href}`;
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
