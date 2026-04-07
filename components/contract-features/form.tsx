"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateContractFeatureMutation, useUpdateContractFeatureMutation } from "@/hooks/use-contract-feature-mutations";
import type { ContractFeatureItem, CreateContractFeatureDTO, UpdateContractFeatureDTO } from "@/types/contract-feature.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const contractFeatureFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(50, "O nome deve ter no maximo 50 caracteres."),
});

type ContractFeatureFormValues = z.infer<typeof contractFeatureFormSchema>;

interface ContractFeatureFormProps {
  mode: "create" | "edit";
  contractFeature?: ContractFeatureItem;
}

export function ContractFeatureForm({ mode, contractFeature }: ContractFeatureFormProps) {
  const router = useRouter();
  const createMutation = useCreateContractFeatureMutation();
  const updateMutation = useUpdateContractFeatureMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContractFeatureFormValues>({
    resolver: zodResolver(contractFeatureFormSchema),
    defaultValues: {
      name: contractFeature?.name ?? "",
    },
  });

  useEffect(() => {
    if (!contractFeature) {
      return;
    }

    reset({
      name: contractFeature.name,
    });
  }, [contractFeature, reset]);

  async function onSubmit(values: ContractFeatureFormValues) {
    const payloadBase = {
      name: values.name.trim(),
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateContractFeatureDTO);
      router.push(`/contract-features/${response.data.id}`);
      return;
    }

    if (!contractFeature) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: contractFeature.id,
      payload: payloadBase satisfies UpdateContractFeatureDTO,
    });
    router.push(`/contract-features/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova caracteristica" : "Editar caracteristica"}</CardTitle>
        <CardDescription>Caracteristicas ficam em Administrador e podem ser vinculadas aos tipos de contrato para sinalizar capacidades extras.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Controle de kilometragem, Reembolso, Franquia, Motorista incluso" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            O uso dessa caracteristica em `contract-types` ainda nao aparece com contagem na API, mas ela pode impactar a configuracao funcional dos contratos.
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/contract-features" : `/contract-features/${contractFeature?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar caracteristica" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
