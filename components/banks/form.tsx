"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateBankMutation, useUpdateBankMutation } from "@/hooks/use-bank-mutations";
import type { BankItem, CreateBankDTO, UpdateBankDTO } from "@/types/bank.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const bankFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no máximo 100 caracteres."),
  code: z.string().min(1, "O codigo e obrigatório.").max(20, "O codigo deve ter no máximo 20 caracteres."),
});

type BankFormValues = z.infer<typeof bankFormSchema>;

interface BankFormProps {
  mode: "create" | "edit";
  bank?: BankItem;
}

export function BankForm({ mode, bank }: BankFormProps) {
  const router = useRouter();
  const createMutation = useCreateBankMutation();
  const updateMutation = useUpdateBankMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankFormValues>({
    resolver: zodResolver(bankFormSchema),
    defaultValues: {
      name: bank?.name ?? "",
      code: bank?.code ?? "",
    },
  });

  useEffect(() => {
    if (!bank) {
      return;
    }

    reset({
      name: bank.name,
      code: bank.code,
    });
  }, [bank, reset]);

  async function onSubmit(values: BankFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateBankDTO);
      router.push(`/banks/${response.data.id}`);
      return;
    }

    if (!bank) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: bank.id,
      payload: payloadBase satisfies UpdateBankDTO,
    });
    router.push(`/banks/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo banco" : "Editar banco"}</CardTitle>
        <CardDescription>Bancos ficam dentro de Administrador e servem de apoio para cadastros financeiros e de policiais.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" placeholder="Ex.: Banco do Brasil" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Codigo *</Label>
            <Input id="code" maxLength={20} placeholder="Ex.: 001" {...register("code")} />
            <p className="text-xs text-slate-500">Obrigatório. O backend salva automaticamente em caixa alta.</p>
            {errors.code ? <p className="text-sm text-destructive">{errors.code.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/banks" : `/banks/${bank?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar banco" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
