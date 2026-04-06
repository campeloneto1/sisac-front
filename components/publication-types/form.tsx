"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreatePublicationTypeMutation, useUpdatePublicationTypeMutation } from "@/hooks/use-publication-type-mutations";
import type { CreatePublicationTypeDTO, PublicationTypeItem, UpdatePublicationTypeDTO } from "@/types/publication-type.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const publicationTypeFormSchema = z.object({
  name: z.string().min(1, "Informe o nome.").max(100, "O nome deve ter no maximo 100 caracteres."),
  slug: z.string().min(1, "Informe o slug.").max(120, "O slug deve ter no maximo 120 caracteres."),
  description: z.string().optional(),
  nature: z.enum(["positive", "neutral", "negative"]).default("neutral"),
  generates_points: z.boolean().default(false),
});

type PublicationTypeFormValues = z.infer<typeof publicationTypeFormSchema>;

interface PublicationTypeFormProps {
  mode: "create" | "edit";
  publicationType?: PublicationTypeItem;
}

export function PublicationTypeForm({ mode, publicationType }: PublicationTypeFormProps) {
  const router = useRouter();
  const createMutation = useCreatePublicationTypeMutation();
  const updateMutation = useUpdatePublicationTypeMutation();
  const {
    register,
    reset,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PublicationTypeFormValues>({
    resolver: zodResolver(publicationTypeFormSchema),
    defaultValues: {
      name: publicationType?.name ?? "",
      slug: publicationType?.slug ?? "",
      description: publicationType?.description ?? "",
      nature: publicationType?.nature?.value ?? "neutral",
      generates_points: publicationType?.generates_points ?? false,
    },
  });

  const nature = useWatch({ control, name: "nature" });
  const generatesPoints = useWatch({ control, name: "generates_points" });

  useEffect(() => {
    if (!publicationType) {
      return;
    }

    reset({
      name: publicationType.name,
      slug: publicationType.slug,
      description: publicationType.description ?? "",
      nature: publicationType.nature?.value ?? "neutral",
      generates_points: publicationType.generates_points ?? false,
    });
  }, [publicationType, reset]);

  async function onSubmit(values: PublicationTypeFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      description: values.description?.trim() || null,
      nature: values.nature,
      generates_points: values.generates_points,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreatePublicationTypeDTO);
      router.push(`/publication-types/${response.data.id}`);
      return;
    }

    if (!publicationType) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: publicationType.id,
      payload: payloadBase satisfies UpdatePublicationTypeDTO,
    });
    router.push(`/publication-types/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo tipo de publicacao" : "Editar tipo de publicacao"}</CardTitle>
        <CardDescription>
          Cadastre o tipo administrativo que classifica publicacoes funcionais, inclusive se ele e positivo e se gera pontos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publication-type-name">Nome</Label>
              <Input id="publication-type-name" placeholder="Ex.: Elogio individual" {...register("name")} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publication-type-slug">Slug</Label>
              <Input id="publication-type-slug" placeholder="Ex.: elogio-individual" {...register("slug")} />
              {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="publication-type-description">Descricao</Label>
              <Textarea id="publication-type-description" placeholder="Descreva como esse tipo de publicacao deve ser usado." {...register("description")} />
              {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Natureza</Label>
              <Select
                value={nature}
                onValueChange={(value) => setValue("nature", value as "positive" | "neutral" | "negative", { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positiva</SelectItem>
                  <SelectItem value="neutral">Neutra</SelectItem>
                  <SelectItem value="negative">Negativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <Checkbox checked={generatesPoints} onCheckedChange={(checked) => setValue("generates_points", Boolean(checked), { shouldValidate: true })} />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-slate-900">Gera pontos</span>
                <span className="block text-sm text-slate-500">Use esta opcao para publicacoes que pontuam em regras internas.</span>
              </span>
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button asChild type="button" variant="outline">
              <Link href={mode === "create" ? "/publication-types" : `/publication-types/${publicationType?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar tipo" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
