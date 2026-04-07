"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreatePoliceOfficerPublicationMutation,
  useUpdatePoliceOfficerPublicationMutation,
} from "@/hooks/use-police-officer-publication-mutations";
import { usePublicationTypes } from "@/hooks/use-publication-types";
import { formatPoliceOfficerOptionLabel } from "@/lib/option-labels";
import { policeOfficersService } from "@/services/police-officers/service";
import type {
  CreatePoliceOfficerPublicationDTO,
  PoliceOfficerPublicationItem,
  UpdatePoliceOfficerPublicationDTO,
} from "@/types/police-officer-publication.type";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
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
import { Textarea } from "@/components/ui/textarea";

const policeOfficerPublicationFormSchema = z.object({
  police_officer_id: z
    .string()
    .refine((value) => value !== "none", "Selecione o policial."),
  publication_type_id: z.string(),
  content: z.string().min(1, "Informe o conteudo da publicacao."),
  bulletin: z
    .string()
    .min(1, "Informe o boletim.")
    .max(100, "O boletim deve ter no maximo 100 caracteres."),
  publication_date: z.string().min(1, "Informe a data da publicacao."),
  external_link: z
    .string()
    .max(2048, "O link deve ter no maximo 2048 caracteres.")
    .refine(
      (value) => !value || value.startsWith("http://") || value.startsWith("https://"),
      "O link deve ser uma URL valida (http:// ou https://).",
    )
    .optional(),
});

type PoliceOfficerPublicationFormValues = z.infer<
  typeof policeOfficerPublicationFormSchema
>;

interface PoliceOfficerPublicationFormProps {
  mode: "create" | "edit";
  policeOfficerPublication?: PoliceOfficerPublicationItem;
}

export function PoliceOfficerPublicationForm({
  mode,
  policeOfficerPublication,
}: PoliceOfficerPublicationFormProps) {
  const router = useRouter();
  const createMutation = useCreatePoliceOfficerPublicationMutation();
  const updateMutation = useUpdatePoliceOfficerPublicationMutation();
  const publicationTypesQuery = usePublicationTypes({ per_page: 100 });

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PoliceOfficerPublicationFormValues>({
    resolver: zodResolver(policeOfficerPublicationFormSchema),
    defaultValues: {
      police_officer_id: policeOfficerPublication?.police_officer_id
        ? String(policeOfficerPublication.police_officer_id)
        : "none",
      publication_type_id: policeOfficerPublication?.publication_type_id
        ? String(policeOfficerPublication.publication_type_id)
        : "none",
      content: policeOfficerPublication?.content ?? "",
      bulletin: policeOfficerPublication?.bulletin ?? "",
      publication_date: policeOfficerPublication?.publication_date ?? "",
      external_link: policeOfficerPublication?.external_link ?? "",
    },
  });

  const selectedPoliceOfficerId = useWatch({
    control,
    name: "police_officer_id",
  });
  const selectedPublicationTypeId = useWatch({
    control,
    name: "publication_type_id",
  });

  useEffect(() => {
    if (!policeOfficerPublication) {
      return;
    }

    reset({
      police_officer_id: String(policeOfficerPublication.police_officer_id),
      publication_type_id: policeOfficerPublication.publication_type_id
        ? String(policeOfficerPublication.publication_type_id)
        : "none",
      content: policeOfficerPublication.content ?? "",
      bulletin: policeOfficerPublication.bulletin ?? "",
      publication_date: policeOfficerPublication.publication_date ?? "",
      external_link: policeOfficerPublication.external_link ?? "",
    });
  }, [policeOfficerPublication, reset]);

  async function onSubmit(values: PoliceOfficerPublicationFormValues) {
    const payloadBase = {
      police_officer_id: Number(values.police_officer_id),
      publication_type_id:
        values.publication_type_id !== "none"
          ? Number(values.publication_type_id)
          : null,
      content: values.content.trim(),
      bulletin: values.bulletin.trim(),
      publication_date: values.publication_date,
      external_link: values.external_link?.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreatePoliceOfficerPublicationDTO,
      );
      router.push(`/police-officer-publications/${response.data.id}`);
      return;
    }

    if (!policeOfficerPublication) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: policeOfficerPublication.id,
      payload: payloadBase satisfies UpdatePoliceOfficerPublicationDTO,
    });
    router.push(`/police-officer-publications/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedPoliceOfficerOption = policeOfficerPublication?.police_officer
    ? {
        value: String(policeOfficerPublication.police_officer_id),
        label: formatPoliceOfficerOptionLabel({
          ...policeOfficerPublication.police_officer,
          id: policeOfficerPublication.police_officer_id,
        }),
      }
    : null;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nova publicacao" : "Editar publicacao"}
        </CardTitle>
        <CardDescription>
          Registro de publicacao em boletim para o policial, com tipo, conteudo
          e link externo opcional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Dados principais
              </h3>
              <p className="text-sm text-slate-500">
                Selecione o policial, o tipo de publicacao e informe os dados do
                boletim.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Policial</Label>
                <AsyncSearchableSelect
                  value={selectedPoliceOfficerId === "none" ? undefined : selectedPoliceOfficerId}
                  onValueChange={(value) =>
                    setValue("police_officer_id", value, {
                      shouldValidate: true,
                    })
                  }
                  queryKey={["police-officer-publications", "police-officers"]}
                  loadPage={({ page, search }) =>
                    policeOfficersService.index({
                      page,
                      per_page: 20,
                      search: search || undefined,
                    })
                  }
                  mapOption={(officer) => ({
                    value: String(officer.id),
                    label: formatPoliceOfficerOptionLabel(officer),
                  })}
                  selectedOption={selectedPoliceOfficerOption}
                  placeholder="Selecione"
                  searchPlaceholder="Buscar policial por nome ou matricula"
                  emptyMessage="Nenhum policial encontrado."
                />
                {errors.police_officer_id ? (
                  <p className="text-sm text-destructive">
                    {errors.police_officer_id.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Tipo de publicacao</Label>
                <Select
                  value={selectedPublicationTypeId}
                  onValueChange={(value) =>
                    setValue("publication_type_id", value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {(publicationTypesQuery.data?.data ?? []).map(
                      (publicationType) => (
                        <SelectItem
                          key={publicationType.id}
                          value={String(publicationType.id)}
                        >
                          {publicationType.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {errors.publication_type_id ? (
                  <p className="text-sm text-destructive">
                    {errors.publication_type_id.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulletin">Boletim</Label>
                <Input
                  id="bulletin"
                  placeholder="Ex.: BG 123/2024"
                  {...register("bulletin")}
                />
                {errors.bulletin ? (
                  <p className="text-sm text-destructive">
                    {errors.bulletin.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="publication_date">Data da publicacao</Label>
                <Input
                  id="publication_date"
                  type="date"
                  {...register("publication_date")}
                />
                {errors.publication_date ? (
                  <p className="text-sm text-destructive">
                    {errors.publication_date.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="content">Conteudo</Label>
                <Textarea
                  id="content"
                  placeholder="Descreva o conteudo da publicacao..."
                  rows={4}
                  {...register("content")}
                />
                {errors.content ? (
                  <p className="text-sm text-destructive">
                    {errors.content.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="external_link">Link externo (opcional)</Label>
                <Input
                  id="external_link"
                  type="url"
                  placeholder="https://exemplo.com/documento"
                  {...register("external_link")}
                />
                {errors.external_link ? (
                  <p className="text-sm text-destructive">
                    {errors.external_link.message}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link
                href={
                  mode === "create"
                    ? "/police-officer-publications"
                    : `/police-officer-publications/${policeOfficerPublication?.id}`
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar publicacao"
                  : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
