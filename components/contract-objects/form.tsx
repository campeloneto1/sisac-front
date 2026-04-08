"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateContractObjectMutation, useUpdateContractObjectMutation } from "@/hooks/use-contract-object-mutations";
import type { ContractObjectItem, CreateContractObjectDTO, UpdateContractObjectDTO } from "@/types/contract-object.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contractObjectFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(150, "O nome deve ter no máximo 150 caracteres."),
  description: z.string().max(5000, "A descrição deve ter no máximo 5000 caracteres."),
});

type ContractObjectFormValues = z.infer<typeof contractObjectFormSchema>;

interface ContractObjectFormProps {
  mode: "create" | "edit";
  contractObject?: ContractObjectItem;
}

export function ContractObjectForm({ mode, contractObject }: ContractObjectFormProps) {
  const router = useRouter();
  const createMutation = useCreateContractObjectMutation();
  const updateMutation = useUpdateContractObjectMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContractObjectFormValues>({
    resolver: zodResolver(contractObjectFormSchema),
    defaultValues: {
      name: contractObject?.name ?? "",
      description: contractObject?.description ?? "",
    },
  });

  useEffect(() => {
    if (!contractObject) {
      return;
    }

    reset({
      name: contractObject.name,
      description: contractObject.description ?? "",
    });
  }, [contractObject, reset]);

  async function onSubmit(values: ContractObjectFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      description: values.description.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateContractObjectDTO);
      router.push(`/contract-objects/${response.data.id}`);
      return;
    }

    if (!contractObject) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: contractObject.id,
      payload: payloadBase satisfies UpdateContractObjectDTO,
    });
    router.push(`/contract-objects/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo objeto de contrato" : "Editar objeto de contrato"}</CardTitle>
        <CardDescription>Objetos de contrato ficam em Administrador e ajudam a padronizar o assunto principal dos contratos cadastrados.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Locação de imoveis, Aquisicao de materiais, Prestacao de serviços" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              rows={6}
              placeholder="Descreva o escopo ou a finalidade desse objeto contratual."
              {...register("description")}
            />
            <p className="text-xs text-slate-500">Opcional. Use esse campo para contextualizar quando esse objeto deve ser utilizado.</p>
            {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            A tela de detalhe mostra quantos contratos já utilizam este objeto. Isso ajuda a evitar exclusoes em cadastros amplamente referenciados.
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/contract-objects" : `/contract-objects/${contractObject?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar objeto" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
