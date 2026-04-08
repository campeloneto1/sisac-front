"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { useMaterialLoan } from "@/hooks/use-material-loans";
import { useMarkMaterialLoanReturnedMutation } from "@/hooks/use-material-loan-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { usersService } from "@/services/users/service";
import type {
  MaterialLoanItem,
  ReturnMaterialLoanItemDTO,
} from "@/types/material-loan.type";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const returnSchema = z
  .object({
    approved_by: z.string(),
    return_notes: z
      .string()
      .max(1000, "As observacoes devem ter no maximo 1000 caracteres."),
    items: z.array(
      z.object({
        id: z.coerce.number(),
        current_returned_quantity: z.coerce.number().int().min(0),
        current_consumed_quantity: z.coerce.number().int().min(0),
        current_lost_quantity: z.coerce.number().int().min(0),
        quantity: z.coerce.number().int().min(1),
        is_unit_item: z.boolean(),
        returned_now: z.coerce.number().int().min(0),
        consumed_now: z.coerce.number().int().min(0),
        lost_now: z.coerce.number().int().min(0),
        consumed_justification: z
          .string()
          .max(1000, "A justificativa deve ter no maximo 1000 caracteres."),
        lost_justification: z
          .string()
          .max(1000, "A justificativa deve ter no maximo 1000 caracteres."),
        lost_report_number: z
          .string()
          .max(100, "O numero do relatorio deve ter no maximo 100 caracteres."),
      }),
    ),
  })
  .superRefine((values, context) => {
    let hasAnyChange = false;

    values.items.forEach((item, index) => {
      const pending =
        item.quantity -
        item.current_returned_quantity -
        item.current_consumed_quantity -
        item.current_lost_quantity;
      const totalNow = item.returned_now + item.consumed_now + item.lost_now;

      if (totalNow > 0) {
        hasAnyChange = true;
      }

      if (totalNow > pending) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "returned_now"],
          message:
            "A soma devolvida, consumida e extraviada nesta devolucao nao pode exceder o saldo pendente.",
        });
      }

      if (item.is_unit_item && item.consumed_now > 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "consumed_now"],
          message: "Itens por unidade nao aceitam quantidade consumida.",
        });
      }

      if (item.is_unit_item && totalNow > 1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "returned_now"],
          message:
            "Itens por unidade so podem ser devolvidos ou extraviados uma vez.",
        });
      }

      if (item.consumed_now > 0 && item.consumed_justification.trim().length < 3) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "consumed_justification"],
          message:
            "Informe a justificativa de consumo com pelo menos 3 caracteres.",
        });
      }

      if (item.lost_now > 0 && item.lost_justification.trim().length < 3) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "lost_justification"],
          message:
            "Informe a justificativa de extravio com pelo menos 3 caracteres.",
        });
      }
    });

    if (!hasAnyChange) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message:
          "Informe devolucao, consumo ou extravio em pelo menos um item.",
      });
    }
  });

type ReturnFormValues = z.output<typeof returnSchema>;

function getItemLabel(item: MaterialLoanItem) {
  return [item.material?.type?.name, item.material?.variant?.name]
    .filter(Boolean)
    .join(" ");
}

function getFallbackItemLabel(itemId: number, item?: MaterialLoanItem) {
  return getItemLabel(
    item ?? {
      id: itemId,
      material_loan_id: 0,
      material_id: 0,
      quantity: 0,
      returned_quantity: 0,
      consumed_quantity: 0,
      lost_quantity: 0,
      pending_quantity: 0,
    },
  );
}

export function MaterialLoanReturnPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("material-loans");
  const loanQuery = useMaterialLoan(
    params.id,
    Boolean(activeSubunit) && permissions.canUpdate,
  );
  const returnMutation = useMarkMaterialLoanReturnedMutation();
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof returnSchema>,
    unknown,
    ReturnFormValues
  >({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      approved_by: "none",
      return_notes: "",
      items: [],
    },
  });
  const { fields } = useFieldArray({
    control,
    name: "items",
  });
  const watchedItems = useWatch({ control, name: "items" }) as ReturnFormValues["items"];
  const selectedApprovedBy = useWatch({ control, name: "approved_by" });

  useEffect(() => {
    const loan = loanQuery.data?.data;

    if (!loan) {
      return;
    }

    reset({
      approved_by: loan.approved_by?.id ? String(loan.approved_by.id) : "none",
      return_notes: loan.return_notes ?? "",
      items: (loan.items ?? []).map((item) => ({
        id: item.id,
        current_returned_quantity: item.returned_quantity,
        current_consumed_quantity: item.consumed_quantity,
        current_lost_quantity: item.lost_quantity,
        quantity: item.quantity,
        is_unit_item: Boolean(item.material_unit_id),
        returned_now: 0,
        consumed_now: 0,
        lost_now: 0,
        consumed_justification: "",
        lost_justification: "",
        lost_report_number: "",
      })),
    });
  }, [loanQuery.data?.data, reset]);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `update` para registrar devolucao de
            materiais.
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
          <CardDescription>
            O modulo depende da subunidade ativa para registrar a devolucao.
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
          <CardTitle>Erro ao carregar emprestimo</CardTitle>
          <CardDescription>
            O emprestimo nao esta disponivel para devolucao no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const loan = loanQuery.data.data;

  if (loan.status === "returned") {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Emprestimo ja finalizado</CardTitle>
          <CardDescription>
            Este emprestimo ja foi totalmente devolvido e nao aceita novas
            baixas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={`/material-loans/${loan.id}`}>Voltar ao detalhe</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(values: ReturnFormValues) {
    const changedItems = values.items.reduce<ReturnMaterialLoanItemDTO[]>(
      (accumulator, item) => {
        const returned_quantity =
          item.current_returned_quantity + item.returned_now;
        const consumed_quantity =
          item.current_consumed_quantity + item.consumed_now;
        const lost_quantity = item.current_lost_quantity + item.lost_now;
        const hasChange =
          item.returned_now > 0 || item.consumed_now > 0 || item.lost_now > 0;

        if (!hasChange) {
          return accumulator;
        }

        accumulator.push({
          id: item.id,
          returned_quantity,
          consumed_quantity,
          lost_quantity,
          consumed_justification: item.consumed_now
            ? item.consumed_justification.trim() || null
            : null,
          lost_justification: item.lost_now
            ? item.lost_justification.trim() || null
            : null,
          lost_report_number: item.lost_now
            ? item.lost_report_number.trim() || null
            : null,
        });

        return accumulator;
      },
      [],
    );

    const response = await returnMutation.mutateAsync({
      id: loan.id,
      payload: {
        approved_by:
          values.approved_by !== "none" ? Number(values.approved_by) : null,
        return_notes: values.return_notes.trim() || null,
        items: changedItems,
      },
    });

    router.push(`/material-loans/${response.data.id}`);
  }

  const selectedApprovedByOption = loan.approved_by
    ? {
        value: String(loan.approved_by.id),
        label: [loan.approved_by.name, loan.approved_by.email]
          .filter(Boolean)
          .join(" • "),
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <RotateCcw className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Registrar devolucao
          </h1>
          <p className="text-sm text-slate-500">
            Informe apenas o que retorna agora. O sistema soma com o historico e
            permite devolucao parcial por item.
          </p>
        </div>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>
            Emprestimo de {loan.police_officer?.war_name || loan.police_officer?.name}
          </CardTitle>
          <CardDescription>
            A data e hora da devolucao agora sao registradas automaticamente
            pela API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <section className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Aprovado por</Label>
                <AsyncSearchableSelect
                  value={selectedApprovedBy === "none" ? undefined : selectedApprovedBy}
                  onValueChange={(value) =>
                    setValue("approved_by", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  queryKey={["material-loan-return", "approvers"]}
                  loadPage={({ page, search }) =>
                    usersService.index({
                      page,
                      per_page: 20,
                      search: search || undefined,
                    })
                  }
                  mapOption={(user) => ({
                    value: String(user.id),
                    label: [user.name, user.email].filter(Boolean).join(" • "),
                  })}
                  selectedOption={selectedApprovedByOption}
                  placeholder="Selecione o aprovador"
                  searchPlaceholder="Buscar aprovador por nome ou email"
                  emptyMessage="Nenhum aprovador encontrado."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Observacoes de retorno</Label>
                <Textarea
                  rows={3}
                  placeholder="Descreva o contexto da devolucao, se necessario."
                  {...register("return_notes")}
                />
                {errors.return_notes ? (
                  <p className="text-sm text-destructive">
                    {errors.return_notes.message}
                  </p>
                ) : null}
              </div>
            </section>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const item = watchedItems[index];
                const pending =
                  item.quantity -
                  item.current_returned_quantity -
                  item.current_consumed_quantity -
                  item.current_lost_quantity;

                return (
                  <Card
                    key={field.id}
                    className="border-slate-200/70 bg-slate-50/80"
                  >
                    <CardHeader>
                      <CardTitle className="text-base">
                        {getFallbackItemLabel(Number(field.id), loan.items?.[index]) ||
                          `Item #${field.id}`}
                      </CardTitle>
                      <CardDescription>
                        Saldo pendente: {pending} •{" "}
                        {loan.items?.[index]?.material_unit_id
                          ? `Unidade #${loan.items[index]?.material_unit_id}`
                          : `Lote #${loan.items?.[index]?.material_batch_id}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Devolver agora</Label>
                        <Input
                          type="number"
                          min={0}
                          max={pending}
                          {...register(`items.${index}.returned_now`)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Consumir agora</Label>
                        <Input
                          type="number"
                          min={0}
                          max={pending}
                          disabled={item.is_unit_item}
                          {...register(`items.${index}.consumed_now`)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Extraviar agora</Label>
                        <Input
                          type="number"
                          min={0}
                          max={pending}
                          {...register(`items.${index}.lost_now`)}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-3">
                        <Label>Justificativa de consumo</Label>
                        <Textarea
                          rows={2}
                          placeholder="Obrigatoria quando houver consumo."
                          {...register(`items.${index}.consumed_justification`)}
                        />
                        {errors.items?.[index]?.consumed_justification ? (
                          <p className="text-sm text-destructive">
                            {errors.items[index]?.consumed_justification?.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Justificativa de extravio</Label>
                        <Textarea
                          rows={2}
                          placeholder="Obrigatoria quando houver extravio."
                          {...register(`items.${index}.lost_justification`)}
                        />
                        {errors.items?.[index]?.lost_justification ? (
                          <p className="text-sm text-destructive">
                            {errors.items[index]?.lost_justification?.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <Label>Numero do relatorio</Label>
                        <Input
                          placeholder="Opcional"
                          {...register(`items.${index}.lost_report_number`)}
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-600 md:col-span-3">
                        Historico: devolvido {item.current_returned_quantity} •
                        consumido {item.current_consumed_quantity} • extraviado{" "}
                        {item.current_lost_quantity}.
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {errors.items ? (
              <p className="text-sm text-destructive">
                {Array.isArray(errors.items)
                  ? errors.items.find(Boolean)?.root?.message
                  : errors.items.message}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href={`/material-loans/${loan.id}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={returnMutation.isPending}>
                {returnMutation.isPending
                  ? "Registrando..."
                  : "Registrar devolucao"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
