"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Crosshair, Shield, ShieldCheck, UserCircle2 } from "lucide-react";

import { useArmamentLoan } from "@/hooks/use-armament-loans";
import { usePermissions } from "@/hooks/use-permissions";
import {
  getArmamentLoanItemModeLabel,
  getArmamentLoanKindVariant,
  getArmamentLoanStatusVariant,
} from "@/types/armament-loan.type";
import { ArmamentLoanPrintReport } from "@/components/armament-loans/print-report";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ArmamentLoanShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("armament-loans");
  const loanQuery = useArmamentLoan(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar empréstimos de
            armamentos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loanQuery.isLoading) {
    return <Skeleton className="h-[720px] w-full" />;
  }

  if (loanQuery.isError || !loanQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar empréstimo</CardTitle>
          <CardDescription>
            Os dados do empréstimo não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const loan = loanQuery.data.data;
  const canUpdateHeader = permissions.canUpdate && loan.status !== "returned";
  const canReturn = permissions.canUpdate && loan.status !== "returned";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {loan.police_officer?.war_name ||
                loan.police_officer?.name ||
                `Empréstimo #${loan.id}`}
            </h1>
            <Badge variant={getArmamentLoanKindVariant(loan.kind)}>
              {loan.kind_label ?? loan.kind}
            </Badge>
            <Badge variant={getArmamentLoanStatusVariant(loan.status)}>
              {loan.status_label ?? loan.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {loan.total_quantity} item(ns) • emprestado em{" "}
            {formatDateTime(loan.loaned_at)}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Acompanhe o policial responsável, os itens emprestados e o status
            parcial ou total da devolução.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <ArmamentLoanPrintReport loan={loan} />
          {canUpdateHeader ? (
            <Button asChild variant="outline">
              <Link href={`/armament-loans/${loan.id}/edit`}>Editar</Link>
            </Button>
          ) : null}
          {canReturn ? (
            <Button asChild>
              <Link href={`/armament-loans/${loan.id}/return`}>
                Registrar devolução
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Contexto do empréstimo</CardTitle>
            <CardDescription>
              Policial, aprovador e motivo principal da retirada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Policial
                </p>
                <p className="text-sm text-slate-700">
                  {loan.police_officer?.war_name ||
                    loan.police_officer?.name ||
                    `#${loan.police_officer_id}`}
                </p>
                <p className="text-sm text-slate-500">
                  {loan.police_officer?.registration_number ||
                    "Matrícula não informada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Aprovado por
                </p>
                <p className="text-sm text-slate-700">
                  {loan.approved_by_user?.name || "Não informado"}
                </p>
                <p className="text-sm text-slate-500">
                  {loan.approved_by_user?.email || "Sem e-mail vinculado"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Finalidade
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {loan.purpose || "Nenhuma finalidade registrada."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Observações de retorno
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {loan.return_notes || "Nenhuma observação registrada."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Controle quantitativo</CardTitle>
            <CardDescription>
              Totais do empréstimo, devolução, consumo e extravio.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Total emprestado
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {loan.total_quantity}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Pendente
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {loan.pending_quantity}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Devolvido
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">
                {loan.returned_quantity}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Consumo / extravio
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-700">
                {loan.consumed_quantity} / {loan.lost_quantity}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Cronologia
                  </p>
                  <p className="text-sm text-slate-700">
                    Emprestado em {formatDateTime(loan.loaned_at)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Previsao:{" "}
                    {loan.expected_return_at
                      ? formatDateTime(loan.expected_return_at)
                      : "Não informada"}{" "}
                    • Fechado em{" "}
                    {loan.returned_at ? formatDateTime(loan.returned_at) : "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Confirmações</CardTitle>
            <CardDescription>
              Histórico de aceite formal do policial para retirada e devoluções.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!loan.confirmations?.length ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Nenhuma confirmação registrada até o momento.
              </div>
            ) : (
              loan.confirmations.map((confirmation) => (
                <div
                  key={confirmation.id}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {confirmation.operation_type_label ||
                            confirmation.operation_type ||
                            "Operação confirmada"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Confirmante:{" "}
                          {confirmation.confirmed_by_user?.name ||
                            `#${confirmation.confirmed_by_user_id}`}
                        </p>
                        <p className="text-sm text-slate-500">
                          Operador:{" "}
                          {confirmation.operator_user?.name || "Não informado"} •{" "}
                          {formatDateTime(confirmation.confirmed_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {confirmation.confirmation_method_label ||
                        confirmation.confirmation_method ||
                        "Método"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Itens do empréstimo</CardTitle>
          <CardDescription>
            Cada item pode ser por unidade ou por lote e aceita devolução
            parcial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-slate-200/70">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Armamento</th>
                    <th className="px-4 py-3 font-medium">Referência</th>
                    <th className="px-4 py-3 font-medium">Controle</th>
                  </tr>
                </thead>
                <tbody>
                  {(loan.items ?? []).map((item) => (
                    <tr key={item.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <Crosshair className="mt-0.5 h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-slate-900">
                              {[item.armament?.type?.name, item.armament?.variant?.name]
                                .filter(Boolean)
                                .join(" ") || `Armamento #${item.armament_id}`}
                            </p>
                            <p className="mt-1 text-slate-500">
                              {item.armament?.subunit?.abbreviation ||
                                item.armament?.subunit?.name ||
                                "Subunidade não informada"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <p>{getArmamentLoanItemModeLabel(item)}</p>
                        <p className="mt-1">
                          {item.armament_unit_id
                            ? `Unidade #${item.armament_unit_id}${
                                item.unit?.serial_number
                                  ? ` • Serie ${item.unit.serial_number}`
                                  : ""
                              }`
                            : `Lote #${item.armament_batch_id}${
                                item.batch?.batch_number
                                  ? ` • ${item.batch.batch_number}`
                                  : ""
                              }`}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <p>Total: {item.quantity}</p>
                        <p className="mt-1">
                          Devolvido: {item.returned_quantity} • Consumido:{" "}
                          {item.consumed_quantity}
                        </p>
                        <p className="mt-1">
                          Extraviado: {item.lost_quantity} • Pendente:{" "}
                          {item.pending_quantity}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Auditoria</CardTitle>
          <CardDescription>
            Histórico básico de criação e última atualização.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Criado por
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {loan.creator?.name || "Não informado"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Ultima atualização
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {loan.updater?.name || "Não informado"}
            </p>
            <p className="text-sm text-slate-500">
              {formatDateTime(loan.updated_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
