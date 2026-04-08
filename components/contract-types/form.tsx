"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateContractTypeMutation, useUpdateContractTypeMutation } from "@/hooks/use-contract-type-mutations";
import type { ContractTypeItem, CreateContractTypeDTO, UpdateContractTypeDTO } from "@/types/contract-type.type";
import {
  contractBillingModels,
  getContractBillingModelDescription,
  getContractBillingModelLabel,
} from "@/types/contract-type.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const contractTypeFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no máximo 100 caracteres."),
  billing_model: z.enum(contractBillingModels, {
    message: "Selecione um modelo de faturamento válido.",
  }),
});

type ContractTypeFormValues = z.infer<typeof contractTypeFormSchema>;

interface ContractTypeFormProps {
  mode: "create" | "edit";
  contractType?: ContractTypeItem;
}

export function ContractTypeForm({ mode, contractType }: ContractTypeFormProps) {
  const router = useRouter();
  const createMutation = useCreateContractTypeMutation();
  const updateMutation = useUpdateContractTypeMutation();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ContractTypeFormValues>({
    resolver: zodResolver(contractTypeFormSchema),
    defaultValues: {
      name: contractType?.name ?? "",
      billing_model: contractType?.billing_model ?? "daily_usage",
    },
  });

  useEffect(() => {
    if (!contractType) {
      return;
    }

    reset({
      name: contractType.name,
      billing_model: contractType.billing_model,
    });
  }, [contractType, reset]);

  async function onSubmit(values: ContractTypeFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      billing_model: values.billing_model,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateContractTypeDTO);
      router.push(`/contract-types/${response.data.id}`);
      return;
    }

    if (!contractType) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: contractType.id,
      payload: payloadBase satisfies UpdateContractTypeDTO,
    });
    router.push(`/contract-types/${response.data.id}`);
  }

  const selectedBillingModel = useWatch({ control, name: "billing_model" });
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo tipo de contrato" : "Editar tipo de contrato"}</CardTitle>
        <CardDescription>Tipos de contrato ficam em Administrador e definem a classificação base e o modelo de faturamento dos contratos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Locação de viaturas, Manutenção predial" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Modelo de faturamento</Label>
            <Select
              value={selectedBillingModel}
              onValueChange={(value) =>
                setValue("billing_model", value as ContractTypeFormValues["billing_model"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                {contractBillingModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {getContractBillingModelLabel(model)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {selectedBillingModel
                ? getContractBillingModelDescription(selectedBillingModel)
                : "Escolha como esse tipo de contrato e faturado na operação."}
            </p>
            {errors.billing_model ? <p className="text-sm text-destructive">{errors.billing_model.message}</p> : null}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            As features associadas a este tipo já sao exibidas no detalhe. Se você quiser, depois podemos adicionar o gerenciamento de
            `attach`, `detach` e `sync` diretamente na tela de edição.
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/contract-types" : `/contract-types/${contractType?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar tipo" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
