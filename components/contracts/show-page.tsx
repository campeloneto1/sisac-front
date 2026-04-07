"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, BriefcaseBusiness, CalendarClock, Landmark, ShieldCheck, UserCircle2 } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { useContract } from "@/hooks/use-contracts";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { getContractStatusBadgeVariant, getContractStatusLabel } from "@/types/contract.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(value?: string | number | null) {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Nao informado";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function getRoleLabel(role: NonNullable<ReturnType<typeof useContract>["data"]>["data"]["current_manager_role"]) {
  if (!role?.police_officer) {
    return "Nao definido";
  }

  const warName = role.police_officer.war_name ?? role.police_officer.user?.name ?? "Policial";
  const registration = role.police_officer.registration_number;

  return registration ? `${warName} (${registration})` : warName;
}

export function ContractShowPage() {
  const { activeSubunit } = useSubunit();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("contracts");
  const contractQuery = useContract(params.id, Boolean(activeSubunit));

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `view` para visualizar contratos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O detalhe do contrato depende do contexto ativo para enviar `X-Active-Subunit`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (contractQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (contractQuery.isError || !contractQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar contrato</CardTitle>
          <CardDescription>Os dados do contrato nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const contract = contractQuery.data.data;
  const contractSubpages = [
    { href: `/contracts/${contract.id}`, label: "Resumo" },
    { href: `/contracts/${contract.id}/roles`, label: "Papeis" },
    { href: `/contracts/${contract.id}/extensions`, label: "Prorrogacoes" },
    { href: `/contracts/${contract.id}/amendments`, label: "Aditivos" },
    { href: `/contracts/${contract.id}/transactions`, label: "Transacoes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{contract.contract_number}</h1>
            <Badge variant={getContractStatusBadgeVariant(contract.status)}>{contract.status_label ?? getContractStatusLabel(contract.status)}</Badge>
            {!contract.is_active ? <Badge variant="outline">Inativo</Badge> : null}
            {contract.is_extendable ? <Badge variant="warning">Prorrogavel</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-slate-500">SACC: {contract.sacc_number}</p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Contrato operacional da subunidade ativa, com acompanhamento de execucao financeira, papeis atuais e artefatos historicos do modulo.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/contracts/${contract.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {contractSubpages.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              item.href === `/contracts/${contract.id}`
                ? "border-primary bg-primary text-primary-foreground"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Resumo executivo</CardTitle>
            <CardDescription>Indicadores principais do contrato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Landmark className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Valor total</p>
                <p className="text-sm text-slate-700">{formatCurrency(contract.total_value)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <BriefcaseBusiness className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Executado / restante</p>
                <p className="text-sm text-slate-700">
                  {formatCurrency(contract.executed_amount)} / {formatCurrency(contract.remaining_amount)}
                </p>
                <p className="text-xs text-slate-500">{contract.executed_percentage ?? 0}% executado</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarClock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Vigencia</p>
                <p className="text-sm text-slate-700">
                  {formatDate(contract.start_date)} ate {formatDate(contract.end_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{contract.creator ? `${contract.creator.name} (${contract.creator.email})` : "Nao informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Estrutura do contrato</CardTitle>
            <CardDescription>Dados basicos, vinculos e responsaveis atuais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-900">Empresa</p>
              <p className="mt-2 text-sm text-slate-600">{contract.company?.name ?? "Nao informada"}</p>
              <p className="mt-1 text-xs text-slate-500">CNPJ: {contract.company?.cnpj ?? "Nao informado"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-900">Tipo e objeto</p>
              <p className="mt-2 text-sm text-slate-600">Tipo: {contract.contract_type?.name ?? "Nao informado"}</p>
              <p className="mt-1 text-sm text-slate-600">Objeto: {contract.contract_object?.name ?? "Nao informado"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Papeis atuais</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">Gestor: {getRoleLabel(contract.current_manager_role)}</p>
              <p className="mt-1 text-sm text-slate-600">Fiscal: {getRoleLabel(contract.current_inspector_role)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-900">Renovacoes</p>
              <p className="mt-2 text-sm text-slate-600">Origem: {contract.renewed_from_contract?.contract_number ?? "Nao se aplica"}</p>
              <p className="mt-1 text-sm text-slate-600">Renovacoes derivadas: {contract.renewed_contracts?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Transacoes</CardTitle>
            <CardDescription>{contract.contract_transactions?.length ?? 0} registro(s) carregados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contract.contract_transactions?.length ? (
              contract.contract_transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">{transaction.type ?? "Tipo nao informado"}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatCurrency(transaction.amount)} • {formatDate(transaction.transaction_date)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Nenhuma transacao vinculada no retorno atual.</p>
            )}
            <Button asChild className="w-full" variant="outline">
              <Link href={`/contracts/${contract.id}/transactions`}>Abrir modulo de transacoes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Aditivos e prorrogacoes</CardTitle>
            <CardDescription>
              {(contract.contract_amendments?.length ?? 0) + (contract.contract_extensions?.length ?? 0)} item(ns) relacionado(s).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">Aditivos</p>
              <p className="mt-1 text-xs text-slate-500">{contract.contract_amendments?.length ?? 0} registro(s)</p>
              <Button asChild className="mt-3 w-full" size="sm" variant="outline">
                <Link href={`/contracts/${contract.id}/amendments`}>Gerenciar aditivos</Link>
              </Button>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">Prorrogacoes</p>
              <p className="mt-1 text-xs text-slate-500">{contract.contract_extensions?.length ?? 0} registro(s)</p>
              <Button asChild className="mt-3 w-full" size="sm" variant="outline">
                <Link href={`/contracts/${contract.id}/extensions`}>Gerenciar prorrogacoes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
            <CardDescription>{contract.contract_alerts?.length ?? 0} alerta(s) retornado(s).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contract.contract_alerts?.length ? (
              contract.contract_alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-slate-900">{alert.type ?? "Alerta"}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{alert.message ?? "Sem mensagem detalhada"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Nenhum alerta retornado para este contrato.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Observacoes</CardTitle>
          <CardDescription>Campo livre de contexto operacional e administrativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
            <p className="whitespace-pre-wrap text-sm text-slate-600">{contract.notes?.trim() || "Sem observacoes cadastradas."}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Gestao detalhada</CardTitle>
          <CardDescription>Submodulos dedicados para operacao do contrato, com filtros e acoes especializadas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Button asChild variant="outline">
            <Link href={`/contracts/${contract.id}/roles`}>Abrir papeis</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/contracts/${contract.id}/extensions`}>Abrir prorrogacoes</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/contracts/${contract.id}/transactions`}>Abrir transacoes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
