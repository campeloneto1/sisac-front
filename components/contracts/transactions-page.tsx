"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, Pencil, Plus, Receipt, Trash2 } from "lucide-react";

import { useCreateContractTransactionMutation, useDeleteContractTransactionMutation, useUpdateContractTransactionMutation } from "@/hooks/use-contract-transaction-mutations";
import { useContractTransactions } from "@/hooks/use-contract-transactions";
import { usePermissions } from "@/hooks/use-permissions";
import type { ContractTransactionItem, CreateContractTransactionDTO, UpdateContractTransactionDTO } from "@/types/contract-transaction.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ContractSubpageShell } from "@/components/contracts/subpage-shell";

const transactionSchema = z.object({
  type: z.string().max(100, "Tipo muito longo.").optional(),
  status: z.string().max(100, "Status muito longo.").optional(),
  amount: z.string().optional(),
  transaction_date: z.string().optional(),
  document_number: z.string().max(120, "Numero muito longo.").optional(),
  invoice_number: z.string().max(120, "Numero muito longo.").optional(),
  notes: z.string().max(5000, "As observacoes devem ter no maximo 5000 caracteres.").optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

function formatCurrency(value?: string | number | null) {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function formatDate(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR") : "Nao informado";
}

function TransactionDialog({
  open,
  onOpenChange,
  contractId,
  transaction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  transaction?: ContractTransactionItem | null;
}) {
  const createMutation = useCreateContractTransactionMutation(contractId);
  const updateMutation = useUpdateContractTransactionMutation(contractId);
  const { handleSubmit, register, reset, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type ?? "",
      status: transaction?.status ?? "",
      amount: transaction?.amount?.toString() ?? "",
      transaction_date: transaction?.transaction_date ?? "",
      document_number: transaction?.document_number ?? "",
      invoice_number: transaction?.invoice_number ?? "",
      notes: transaction?.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      type: transaction?.type ?? "",
      status: transaction?.status ?? "",
      amount: transaction?.amount?.toString() ?? "",
      transaction_date: transaction?.transaction_date ?? "",
      document_number: transaction?.document_number ?? "",
      invoice_number: transaction?.invoice_number ?? "",
      notes: transaction?.notes ?? "",
    });
  }, [open, reset, transaction]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: TransactionFormValues) {
    const payloadBase = {
      contract_id: Number(contractId),
      type: values.type?.trim() || null,
      status: values.status?.trim() || null,
      amount: values.amount?.trim() ? Number(values.amount) : null,
      transaction_date: values.transaction_date || null,
      document_number: values.document_number?.trim() || null,
      invoice_number: values.invoice_number?.trim() || null,
      notes: values.notes?.trim() || null,
    };

    if (transaction) {
      await updateMutation.mutateAsync({ id: transaction.id, payload: payloadBase satisfies UpdateContractTransactionDTO });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreateContractTransactionDTO);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar transacao" : "Nova transacao"}</DialogTitle>
          <DialogDescription>Registre execucoes financeiras, documentos de apoio e o estado atual de cada lancamento.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-transaction-type">Tipo</Label>
              <Input id="contract-transaction-type" placeholder="Ex.: Empenho" {...register("type")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-transaction-status">Status</Label>
              <Input id="contract-transaction-status" placeholder="Ex.: Pago" {...register("status")} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="contract-transaction-amount">Valor</Label>
              <Input id="contract-transaction-amount" type="number" step="0.01" placeholder="0,00" {...register("amount")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-transaction-date">Data</Label>
              <Input id="contract-transaction-date" type="date" {...register("transaction_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-transaction-document">Documento</Label>
              <Input id="contract-transaction-document" placeholder="Ex.: DOC-001" {...register("document_number")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-transaction-invoice">Fatura / nota</Label>
            <Input id="contract-transaction-invoice" placeholder="Ex.: NF-2026-001" {...register("invoice_number")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-transaction-notes">Observacoes</Label>
            <Textarea id="contract-transaction-notes" rows={4} placeholder="Detalhes da transacao" {...register("notes")} />
            {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : transaction ? "Salvar transacao" : "Criar transacao"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContractTransactionsPage() {
  const { id } = useParams<{ id: string }>();
  const permissions = usePermissions("contract-transactions");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState<ContractTransactionItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<ContractTransactionItem | null>(null);
  const deleteMutation = useDeleteContractTransactionMutation(id);

  const filters = useMemo(() => ({
    page,
    per_page: 10,
    search: search || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  }), [page, search, statusFilter, typeFilter]);

  const transactionsQuery = useContractTransactions(id, filters, permissions.canViewAny);

  async function handleDelete() {
    if (!transactionToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(transactionToDelete.id);
    setTransactionToDelete(null);
  }

  return (
    <ContractSubpageShell
      title="Transacoes do contrato"
      description="Mantenha o fluxo financeiro organizado por tipo, status, valor e documento de referencia."
      canView={permissions.canViewAny}
      permissionDeniedTitle="Acesso negado"
      permissionDeniedDescription="Voce precisa da permissao `viewAny` para visualizar as transacoes do contrato."
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Fluxo financeiro</CardTitle>
            <CardDescription>Pesquise transacoes por tipo, status e identificadores documentais.</CardDescription>
          </div>
          {permissions.canCreate ? (
            <Button onClick={() => { setEditingTransaction(null); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova transacao
            </Button>
          ) : null}
        </CardHeader>
      </Card>

      <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="contract-transaction-search">Busca</Label>
          <Input id="contract-transaction-search" placeholder="Documento, fatura ou observacoes" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contract-transaction-type-filter">Tipo</Label>
          <Input id="contract-transaction-type-filter" placeholder="Ex.: pagamento" value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contract-transaction-status-filter">Status</Label>
          <Input id="contract-transaction-status-filter" placeholder="Ex.: liquidado" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} />
        </div>
      </div>

      {transactionsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : transactionsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar transacoes</CardTitle>
            <CardDescription>Verifique se a API de transacoes do contrato ja esta disponivel.</CardDescription>
          </CardHeader>
        </Card>
      ) : !transactionsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma transacao encontrada</CardTitle>
            <CardDescription>Cadastre aqui os eventos financeiros e documentos relacionados ao contrato.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tipo / status</th>
                    <th className="px-4 py-3 font-medium">Valor / data</th>
                    <th className="px-4 py-3 font-medium">Documentos</th>
                    <th className="px-4 py-3 font-medium">Resumo</th>
                    <th className="px-4 py-3 font-medium text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsQuery.data.data.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <Badge variant="info">{transaction.type ?? "Tipo nao informado"}</Badge>
                          <Badge variant="outline">{transaction.status ?? "Status nao informado"}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ArrowLeftRight className="h-4 w-4 text-primary" />
                            <span>{formatCurrency(transaction.amount)}</span>
                          </div>
                          <p>{formatDate(transaction.transaction_date)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-primary" />
                            <span>{transaction.document_number ?? "Sem documento"}</span>
                          </div>
                          <p>NF: {transaction.invoice_number ?? "Nao informada"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{transaction.notes?.trim() || "Sem observacoes informadas."}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {permissions.canUpdate ? (
                            <Button size="icon" variant="outline" onClick={() => { setEditingTransaction(transaction); setIsDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {permissions.canDelete ? (
                            <Button size="icon" variant="outline" onClick={() => setTransactionToDelete(transaction)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={transactionsQuery.data.meta.current_page}
            lastPage={transactionsQuery.data.meta.last_page}
            total={transactionsQuery.data.meta.total}
            from={transactionsQuery.data.meta.from}
            to={transactionsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={transactionsQuery.isFetching}
          />
        </div>
      )}

      <TransactionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} contractId={id} transaction={editingTransaction} />

      <Dialog open={Boolean(transactionToDelete)} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir transacao</DialogTitle>
            <DialogDescription>Tem certeza que deseja remover esta transacao do contrato?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setTransactionToDelete(null)}>Cancelar</Button>
            <Button type="button" variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContractSubpageShell>
  );
}
