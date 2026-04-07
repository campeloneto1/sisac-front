"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreatePoliceOfficerRankMutation, useUpdatePoliceOfficerRankMutation } from "@/hooks/use-police-officer-rank-mutations";
import { formatPoliceOfficerOptionLabel } from "@/lib/option-labels";
import { policeOfficersService } from "@/services/police-officers/service";
import type { CreatePoliceOfficerRankDTO, PoliceOfficerRankItem, UpdatePoliceOfficerRankDTO, PromotionType } from "@/types/police-officer-rank.type";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { promotionTypeLabels } from "@/types/police-officer-rank.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const policeOfficerRankFormSchema = z.object({
  police_officer_id: z.coerce.number().min(1, "Selecione um policial"),
  rank_id: z.coerce.number().min(1, "Selecione uma graduação"),
  start_date: z.string().min(1, "A data de início é obrigatória"),
  end_date: z.string().optional(),
  promotion_type: z.enum(["merit", "seniority", "bravery"]).optional().nullable(),
  promotion_bulletin: z.string().max(100, "O boletim deve ter no máximo 100 caracteres").optional(),
  promotion_date: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.end_date && data.start_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: "A data de término deve ser posterior ou igual à data de início",
  path: ["end_date"],
});

type PoliceOfficerRankFormInput = z.input<typeof policeOfficerRankFormSchema>;
type PoliceOfficerRankFormValues = z.output<typeof policeOfficerRankFormSchema>;

interface PoliceOfficerRankFormProps {
  mode: "create" | "edit";
  policeOfficerRank?: PoliceOfficerRankItem;
  policeOfficers?: Array<{ id: number; name?: string | null; registration_number?: string | null }>;
  ranks?: Array<{ id: number; name: string; abbreviation?: string | null }>;
}

export function PoliceOfficerRankForm({ mode, policeOfficerRank, policeOfficers: _policeOfficers = [], ranks = [] }: PoliceOfficerRankFormProps) {
  const router = useRouter();
  const createMutation = useCreatePoliceOfficerRankMutation();
  const updateMutation = useUpdatePoliceOfficerRankMutation();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<PoliceOfficerRankFormInput, unknown, PoliceOfficerRankFormValues>({
    resolver: zodResolver(policeOfficerRankFormSchema),
    defaultValues: {
      police_officer_id: policeOfficerRank?.police_officer_id ?? 0,
      rank_id: policeOfficerRank?.rank_id ?? 0,
      start_date: policeOfficerRank?.start_date ?? "",
      end_date: policeOfficerRank?.end_date ?? "",
      promotion_type: policeOfficerRank?.promotion_type ?? null,
      promotion_bulletin: policeOfficerRank?.promotion_bulletin ?? "",
      promotion_date: policeOfficerRank?.promotion_date ?? "",
      notes: policeOfficerRank?.notes ?? "",
    },
  });

  const selectedPromotionType = useWatch({
    control,
    name: "promotion_type",
  });
  const selectedPoliceOfficerId = useWatch({
    control,
    name: "police_officer_id",
  });
  const selectedRankId = useWatch({
    control,
    name: "rank_id",
  });
  const promotionTypeValue = selectedPromotionType ?? "none";

  useEffect(() => {
    if (!policeOfficerRank) {
      return;
    }

    reset({
      police_officer_id: policeOfficerRank.police_officer_id,
      rank_id: policeOfficerRank.rank_id,
      start_date: policeOfficerRank.start_date,
      end_date: policeOfficerRank.end_date ?? "",
      promotion_type: policeOfficerRank.promotion_type ?? null,
      promotion_bulletin: policeOfficerRank.promotion_bulletin ?? "",
      promotion_date: policeOfficerRank.promotion_date ?? "",
      notes: policeOfficerRank.notes ?? "",
    });
  }, [policeOfficerRank, reset]);

  async function onSubmit(values: PoliceOfficerRankFormValues) {
    const payloadBase = {
      police_officer_id: values.police_officer_id,
      rank_id: values.rank_id,
      start_date: values.start_date,
      end_date: values.end_date || null,
      promotion_type: values.promotion_type || null,
      promotion_bulletin: values.promotion_bulletin?.trim() || null,
      promotion_date: values.promotion_date || null,
      notes: values.notes?.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreatePoliceOfficerRankDTO);
      router.push(`/police-officer-ranks/${response.data.id}`);
      return;
    }

    if (!policeOfficerRank) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: policeOfficerRank.id,
      payload: payloadBase satisfies UpdatePoliceOfficerRankDTO,
    });
    router.push(`/police-officer-ranks/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedPoliceOfficerOption = policeOfficerRank?.police_officer
    ? {
        value: String(policeOfficerRank.police_officer_id),
        label: formatPoliceOfficerOptionLabel({
          ...policeOfficerRank.police_officer,
          id: policeOfficerRank.police_officer_id,
        }),
      }
    : null;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo histórico de graduação" : "Editar histórico de graduação"}</CardTitle>
        <CardDescription>Registre a evolução funcional do policial, incluindo os metadados da promoção quando existirem.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="police_officer_id">Policial *</Label>
            <AsyncSearchableSelect
              value={selectedPoliceOfficerId ? selectedPoliceOfficerId.toString() : undefined}
              onValueChange={(value) => setValue("police_officer_id", Number(value))}
              queryKey={["police-officer-ranks", "police-officers"]}
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
              placeholder="Selecione o policial"
              searchPlaceholder="Buscar policial por nome ou matricula"
              emptyMessage="Nenhum policial encontrado."
            />
            {errors.police_officer_id ? <p className="text-sm text-destructive">{errors.police_officer_id.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rank_id">Graduação *</Label>
            <Select
              value={selectedRankId?.toString() ?? ""}
              onValueChange={(value) => setValue("rank_id", Number(value))}
            >
              <SelectTrigger id="rank_id">
                <SelectValue placeholder="Selecione a graduação" />
              </SelectTrigger>
              <SelectContent>
                {ranks.map((rank) => (
                  <SelectItem key={rank.id} value={rank.id.toString()}>
                    {rank.name} {rank.abbreviation ? `(${rank.abbreviation})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rank_id ? <p className="text-sm text-destructive">{errors.rank_id.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Data de início *</Label>
            <Input id="start_date" type="date" {...register("start_date")} />
            {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Data de término</Label>
            <Input id="end_date" type="date" {...register("end_date")} />
            {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="promotion_type">Tipo de promoção</Label>
            <Select
              value={promotionTypeValue}
              onValueChange={(value) => setValue("promotion_type", value === "none" ? null : (value as PromotionType))}
            >
              <SelectTrigger id="promotion_type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {Object.entries(promotionTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.promotion_type ? <p className="text-sm text-destructive">{errors.promotion_type.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="promotion_bulletin">Boletim/Portaria</Label>
            <Input id="promotion_bulletin" placeholder="Ex.: BG 123/2024" maxLength={100} {...register("promotion_bulletin")} />
            {errors.promotion_bulletin ? <p className="text-sm text-destructive">{errors.promotion_bulletin.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="promotion_date">Data da promoção</Label>
            <Input id="promotion_date" type="date" {...register("promotion_date")} />
            {errors.promotion_date ? <p className="text-sm text-destructive">{errors.promotion_date.message}</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre a promoção"
              rows={4}
              {...register("notes")}
            />
            {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/police-officer-ranks" : `/police-officer-ranks/${policeOfficerRank?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar histórico" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
