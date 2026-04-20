"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateRankMutation, useUpdateRankMutation } from "@/hooks/use-rank-mutations";
import type { CreateRankDTO, RankItem, UpdateRankDTO } from "@/types/rank.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const rankFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no máximo 100 caracteres."),
  abbreviation: z.string().min(1, "A sigla e obrigatória.").max(5, "A sigla deve ter no máximo 5 caracteres."),
  hierarchy_level: z
    .string()
    .min(1, "Informe o nivel hierarquico.")
    .refine((value) => /^\d+$/.test(value), "O nivel hierarquico deve ser um número inteiro.")
    .refine((value) => Number(value) > 0, "O nivel hierarquico deve ser maior que zero."),
  interstice: z
    .string()
    .optional()
    .refine((value) => value === undefined || value === "" || /^\d+$/.test(value), "O intersticio deve ser um número inteiro.")
    .refine((value) => value === undefined || value === "" || Number(value) >= 0, "O intersticio não pode ser negativo."),
});

type RankFormValues = z.infer<typeof rankFormSchema>;

interface RankFormProps {
  mode: "create" | "edit";
  rank?: RankItem;
}

export function RankForm({ mode, rank }: RankFormProps) {
  const router = useRouter();
  const createMutation = useCreateRankMutation();
  const updateMutation = useUpdateRankMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RankFormValues>({
    resolver: zodResolver(rankFormSchema),
    defaultValues: {
      name: rank?.name ?? "",
      abbreviation: rank?.abbreviation ?? "",
      hierarchy_level: rank ? String(rank.hierarchy_level) : "",
      interstice: rank?.interstice !== null && rank?.interstice !== undefined ? String(rank.interstice) : "",
    },
  });

  useEffect(() => {
    if (!rank) {
      return;
    }

    reset({
      name: rank.name,
      abbreviation: rank.abbreviation,
      hierarchy_level: String(rank.hierarchy_level),
      interstice: rank.interstice !== null && rank.interstice !== undefined ? String(rank.interstice) : "",
    });
  }, [rank, reset]);

  async function onSubmit(values: RankFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      abbreviation: values.abbreviation.trim().toUpperCase(),
      hierarchy_level: Number(values.hierarchy_level),
      interstice: values.interstice ? Number(values.interstice) : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateRankDTO);
      router.push(`/ranks/${response.data.id}`);
      return;
    }

    if (!rank) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: rank.id,
      payload: payloadBase satisfies UpdateRankDTO,
    });
    router.push(`/ranks/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo posto/graduação" : "Editar posto/graduação"}</CardTitle>
        <CardDescription>
          Postos e graduações ficam dentro de Administrador e sustentam a hierarquia usada no histórico funcional dos policiais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" placeholder="Ex.: Soldado, Cabo, Tenente" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Sigla *</Label>
            <Input id="abbreviation" maxLength={5} placeholder="Ex.: SD, CB, TEN" {...register("abbreviation")} />
            <p className="text-xs text-slate-500">A sigla será enviada em caixa alta para manter padrao com a API.</p>
            {errors.abbreviation ? <p className="text-sm text-destructive">{errors.abbreviation.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hierarchy_level">Nivel hierarquico *</Label>
            <Input id="hierarchy_level" type="number" min={1} placeholder="Ex.: 1" {...register("hierarchy_level")} />
            <p className="text-xs text-slate-500">Use um número unico para ordenar a progressao hierárquica.</p>
            {errors.hierarchy_level ? <p className="text-sm text-destructive">{errors.hierarchy_level.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interstice">Intersticio em meses</Label>
            <Input id="interstice" type="number" min={0} placeholder="Ex.: 12" {...register("interstice")} />
            <p className="text-xs text-slate-500">Opcional. Informe o tempo mínimo para promoção, quando aplicavel.</p>
            {errors.interstice ? <p className="text-sm text-destructive">{errors.interstice.message}</p> : null}
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            Alteracoes neste cadastro impactam seletores e regras relacionadas ao histórico de postos/graduações dos policiais.
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/ranks" : `/ranks/${rank?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar posto/graduação" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
