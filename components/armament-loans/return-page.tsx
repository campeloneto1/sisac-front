"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";

import { useArmamentLoan } from "@/hooks/use-armament-loans";
import { useMarkArmamentLoanReturnedMutation } from "@/hooks/use-armament-loan-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { useUsers } from "@/hooks/use-users";
import type {
  ArmamentLoanConfirmationDTO,
  ArmamentLoanItem,
  ReturnArmamentLoanItemDTO,
} from "@/types/armament-loan.type";
import { ArmamentLoanConfirmationDialog } from "@/components/armament-loans/confirmation-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const returnSchema = z
  .object({
    approved_by: z.string(),
    return_notes: z
      .string()
      .max(1000, "As observações devem ter no máximo 1000 caracteres."),
    items: z.array(
      z.object({
        id: z.number(),
        current_returned_quantity: z.number().int().min(0),
        current_consumed_quantity: z.number().int().min(0),
        current_lost_quantity: z.number().int().min(0),
        quantity: z.number().int().min(1),
        is_unit_item: z.boolean(),
        returned_now: z.number().int().min(0),
        consumed_now: z.number().int().min(0),
        lost_now: z.number().int().min(0),
        consumed_justification: z
          .string()
          .max(1000, "A justificativa deve ter no máximo 1000 caracteres."),
        lost_justification: z
          .string()
          .max(1000, "A justificativa deve ter no máximo 1000 caracteres."),
        lost_report_number: z
          .string()
          .max(100, "O número do relatório deve ter no máximo 100 caracteres."),
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
            "A soma devolvida, consumida e extraviada nesta devolução não pode exceder o saldo pendente.",
        });
      }

      if (item.is_unit_item && item.consumed_now > 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "consumed_now"],
          message: "Itens por unidade não aceitam quantidade consumida.",
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
          "Informe devolução, consumo ou extravio em pelo menos um item.",
      });
    }
  });

type ReturnFormValues = z.output<typeof returnSchema>;

function formatDateTimeLocal(value?: string | null) {
  if (!value) {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 16);
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function getItemLabel(item: ArmamentLoanItem) {
  return [item.armament?.type?.name, item.armament?.variant?.name]
    .filter(Boolean)
    .join(" ");
}

export function ArmamentLoanReturnPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const permissions = usePermissions("armament-loans");
  const loanQuery = useArmamentLoan(params.id);
  const usersQuery = useUsers({ per_page: 100 });
  const returnMutation = useMarkArmamentLoanReturnedMutation();
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [pendingReturnValues, setPendingReturnValues] =
    useState<ReturnFormValues | null>(null);
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
      approved_by: loan.approved_by ? String(loan.approved_by) : "none",
      return_notes: loan.return_notes ?? "",
      items: (loan.items ?? []).map((item) => ({
        id: item.id,
        current_returned_quantity: item.returned_quantity,
        current_consumed_quantity: item.consumed_quantity,
        current_lost_quantity: item.lost_quantity,
        quantity: item.quantity,
        is_unit_item: Boolean(item.armament_unit_id),
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
            Você precisa da permissão `update` para registrar devolução de
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
            O empréstimo não esta disponível para devolução no momento.
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
          <CardTitle>Empréstimo já finalizado</CardTitle>
          <CardDescription>
            Este empréstimo já foi totalmente devolvido e não aceita novas
            baixas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={`/armament-loans/${loan.id}`}>Voltar ao detalhe</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(values: ReturnFormValues) {
    setPendingReturnValues(values);
    setIsConfirmationDialogOpen(true);
  }

  async function handleReturnConfirmation(
    confirmation: ArmamentLoanConfirmationDTO,
  ) {
    if (!pendingReturnValues) {
      return;
    }

    const values = pendingReturnValues;
    const changedItems = values.items.reduce<ReturnArmamentLoanItemDTO[]>(
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
        confirmation,
      },
    });

    setIsConfirmationDialogOpen(false);
    setPendingReturnValues(null);
    router.push(`/armament-loans/${response.data.id}`);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <RotateCcw className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Registrar devolução
          </h1>
          <p className="text-sm text-slate-500">
            Informe apenas o que retorna agora. O sistema soma com o histórico e
            permite devolução parcial por item.
          </p>
        </div>
      </div>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Empréstimo de {loan.police_officer?.war_name || loan.police_officer?.name}</CardTitle>
            <CardDescription>
              Exemplo comum: o policial devolve a municao, mas permanece com a arma
              cautelada. Nesse caso, baixe apenas os itens correspondentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <section className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Aprovado por</Label>
                <Select
                  value={selectedApprovedBy}
                  onValueChange={(value) =>
                    setValue("approved_by", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aprovador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não informado</SelectItem>
                    {(usersQuery.data?.data ?? []).map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Observações gerais</Label>
                <Textarea
                  rows={3}
                  placeholder="Observações administrativas desta devolução."
                  {...register("return_notes")}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Itens desta devolução
                </h2>
                <p className="text-sm text-slate-500">
                  Informe somente o movimento desta etapa. O frontend transforma
                  isso em totais acumulados antes de chamar a API.
                </p>
              </div>

              {errors.items?.message ? (
                <p className="text-sm text-destructive">{errors.items.message}</p>
              ) : null}

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const itemData = loan.items?.[index];
                  const formItem = watchedItems?.[index];
                  const pending =
                    Number(formItem?.quantity ?? 0) -
                    Number(formItem?.current_returned_quantity ?? 0) -
                    Number(formItem?.current_consumed_quantity ?? 0) -
                    Number(formItem?.current_lost_quantity ?? 0);

                  return (
                    <Card
                      key={field.id}
                      className="border-slate-200/70 bg-slate-50/80"
                    >
                      <CardHeader>
                        <CardTitle className="text-base">
                          {itemData
                            ? getItemLabel(itemData) || `Item #${itemData.id}`
                            : `Item #${field.id}`}
                        </CardTitle>
                        <CardDescription>
                          {itemData?.armament_unit_id
                            ? `Unidade #${itemData.armament_unit_id}${
                                itemData.unit?.serial_number
                                  ? ` • Serie ${itemData.unit.serial_number}`
                                  : ""
                              }`
                            : `Lote #${itemData?.armament_batch_id}${
                                itemData?.batch?.batch_number
                                  ? ` • ${itemData.batch.batch_number}`
                                  : ""
                              }`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-4">
                          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              Total
                            </p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">
                              {Number(formItem?.quantity ?? 0)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              Já devolvido
                            </p>
                            <p className="mt-1 text-xl font-semibold text-emerald-700">
                              {Number(formItem?.current_returned_quantity ?? 0)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              Já baixado
                            </p>
                            <p className="mt-1 text-xl font-semibold text-amber-700">
                              {Number(formItem?.current_consumed_quantity ?? 0) +
                                Number(formItem?.current_lost_quantity ?? 0)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              Saldo pendente
                            </p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">
                              {pending}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Devolver agora</Label>
                            <Input
                              type="number"
                              min={0}
                              max={pending}
                              disabled={pending === 0}
                              {...register(`items.${index}.returned_now`)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Consumir agora</Label>
                            <Input
                              type="number"
                              min={0}
                              max={pending}
                              disabled={pending === 0 || Boolean(itemData?.armament_unit_id)}
                              {...register(`items.${index}.consumed_now`)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Extraviar agora</Label>
                            <Input
                              type="number"
                              min={0}
                              max={pending}
                              disabled={pending === 0}
                              {...register(`items.${index}.lost_now`)}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Justificativa de consumo</Label>
                            <Textarea
                              rows={3}
                              placeholder="Obrigatória se houver consumo."
                              disabled={pending === 0}
                              {...register(`items.${index}.consumed_justification`)}
                            />
                            {errors.items?.[index]?.consumed_justification ? (
                              <p className="text-sm text-destructive">
                                {errors.items[index]?.consumed_justification?.message}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <Label>Justificativa de extravio</Label>
                            <Textarea
                              rows={3}
                              placeholder="Obrigatória se houver extravio."
                              disabled={pending === 0}
                              {...register(`items.${index}.lost_justification`)}
                            />
                            {errors.items?.[index]?.lost_justification ? (
                              <p className="text-sm text-destructive">
                                {errors.items[index]?.lost_justification?.message}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Número do relatório de extravio</Label>
                          <Input
                            placeholder="Opcional quando houver extravio."
                            disabled={pending === 0}
                            {...register(`items.${index}.lost_report_number`)}
                          />
                        </div>

                        {errors.items?.[index]?.returned_now ? (
                          <p className="text-sm text-destructive">
                            {errors.items[index]?.returned_now?.message}
                          </p>
                        ) : null}
                        {errors.items?.[index]?.consumed_now ? (
                          <p className="text-sm text-destructive">
                            {errors.items[index]?.consumed_now?.message}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href={`/armament-loans/${loan.id}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={returnMutation.isPending}>
                {returnMutation.isPending
                  ? "Registrando..."
                  : "Registrar devolução"}
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {loan.police_officer?.user_id ? (
        <ArmamentLoanConfirmationDialog
          open={isConfirmationDialogOpen}
          onOpenChange={(open) => {
            setIsConfirmationDialogOpen(open);
            if (!open) {
              setPendingReturnValues(null);
            }
          }}
          title="Confirmar devolução de armamento"
          description="O próprio policial vinculado ao empréstimo deve confirmar a devolução com a senha dele."
          officerLabel={
            loan.police_officer?.war_name ||
            loan.police_officer?.name ||
            `Policial #${loan.police_officer_id}`
          }
          confirmerName={loan.police_officer?.name || loan.police_officer?.war_name}
          confirmerEmail={loan.police_officer?.user?.email || loan.police_officer?.email}
          confirmedByUserId={loan.police_officer.user_id}
          isPending={returnMutation.isPending}
          onConfirm={handleReturnConfirmation}
        />
      ) : null}
    </>
  );
}
