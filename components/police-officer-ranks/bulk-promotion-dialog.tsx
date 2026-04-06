"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useBulkPromotePoliceOfficerRankMutation } from "@/hooks/use-police-officer-rank-mutations";
import type {
  BulkPromotePoliceOfficerRankDTO,
  BulkPromotePoliceOfficerRankFailure,
  PromotionType,
} from "@/types/police-officer-rank.type";
import { promotionTypeLabels } from "@/types/police-officer-rank.type";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const bulkPromotionSchema = z.object({
  rank_id: z.coerce.number().min(1, "Selecione a graduação de destino."),
  start_date: z.string().min(1, "A data de promoção é obrigatória."),
  promotion_type: z.enum(["merit", "seniority", "bravery"]).nullable().optional(),
  promotion_bulletin: z.string().max(100, "O boletim deve ter no máximo 100 caracteres.").optional(),
  promotion_date: z.string().optional(),
  notes: z.string().max(500, "As observações devem ter no máximo 500 caracteres.").optional(),
});

type BulkPromotionFormValues = z.infer<typeof bulkPromotionSchema>;

interface OfficerOption {
  id: number;
  name?: string | null;
  registration_number?: string | null;
}

interface RankOption {
  id: number;
  name: string;
  abbreviation?: string | null;
}

interface BulkPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policeOfficers: OfficerOption[];
  ranks: RankOption[];
}

export function BulkPromotionDialog({
  open,
  onOpenChange,
  policeOfficers,
  ranks,
}: BulkPromotionDialogProps) {
  const mutation = useBulkPromotePoliceOfficerRankMutation();
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<number[]>([]);
  const [officerSearch, setOfficerSearch] = useState("");
  const [failedDetails, setFailedDetails] = useState<BulkPromotePoliceOfficerRankFailure[]>([]);
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<BulkPromotionFormValues>({
    resolver: zodResolver(bulkPromotionSchema),
    defaultValues: {
      rank_id: 0,
      start_date: "",
      promotion_type: null,
      promotion_bulletin: "",
      promotion_date: "",
      notes: "",
    },
  });

  const filteredOfficers = useMemo(() => {
    const search = officerSearch.trim().toLowerCase();

    if (!search) {
      return policeOfficers;
    }

    return policeOfficers.filter((officer) => {
      const label = `${officer.name ?? ""} ${officer.registration_number ?? ""}`.toLowerCase();

      return label.includes(search);
    });
  }, [officerSearch, policeOfficers]);

  const selectedPromotionType = useWatch({
    control,
    name: "promotion_type",
  });
  const selectedRankId = useWatch({
    control,
    name: "rank_id",
  });

  function toggleOfficer(officerId: number, checked: boolean) {
    setSelectedOfficerIds((current) =>
      checked ? Array.from(new Set([...current, officerId])) : current.filter((id) => id !== officerId),
    );
  }

  function resetState() {
    reset();
    setSelectedOfficerIds([]);
    setOfficerSearch("");
    setFailedDetails([]);
  }

  async function onSubmit(values: BulkPromotionFormValues) {
    if (!selectedOfficerIds.length) {
      setFailedDetails([
        {
          id: 0,
          error: "Selecione ao menos um policial para a promoção em massa.",
        },
      ]);
      return;
    }

    const payload = {
      police_officer_ids: selectedOfficerIds,
      rank_id: values.rank_id,
      start_date: values.start_date,
      promotion_type: values.promotion_type || null,
      promotion_bulletin: values.promotion_bulletin?.trim() || null,
      promotion_date: values.promotion_date || null,
      notes: values.notes?.trim() || null,
    } satisfies BulkPromotePoliceOfficerRankDTO;

    const response = await mutation.mutateAsync(payload);
    setFailedDetails(response.data.failed_details);

    if (response.data.failed_count === 0) {
      resetState();
      onOpenChange(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !mutation.isPending) {
          resetState();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Promoção em massa</DialogTitle>
          <DialogDescription>
            Selecione os policiais e informe a nova graduação. As regras de negócio continuam sendo validadas pela API.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bulk-rank-id">Graduação de destino *</Label>
              <Select
                value={selectedRankId ? selectedRankId.toString() : ""}
                onValueChange={(value) => setValue("rank_id", Number(value), { shouldValidate: true })}
              >
                <SelectTrigger id="bulk-rank-id">
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
              <Label htmlFor="bulk-start-date">Data de início *</Label>
              <Input id="bulk-start-date" type="date" {...register("start_date")} />
              {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-promotion-type">Tipo de promoção</Label>
              <Select
                value={selectedPromotionType ?? "none"}
                onValueChange={(value) =>
                  setValue("promotion_type", value === "none" ? null : (value as PromotionType), { shouldValidate: true })
                }
              >
                <SelectTrigger id="bulk-promotion-type">
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
              <Label htmlFor="bulk-promotion-date">Data oficial da promoção</Label>
              <Input id="bulk-promotion-date" type="date" {...register("promotion_date")} />
              {errors.promotion_date ? <p className="text-sm text-destructive">{errors.promotion_date.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bulk-promotion-bulletin">Boletim/Portaria</Label>
              <Input id="bulk-promotion-bulletin" maxLength={100} placeholder="Ex.: BG 123/2026" {...register("promotion_bulletin")} />
              {errors.promotion_bulletin ? <p className="text-sm text-destructive">{errors.promotion_bulletin.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bulk-notes">Observações</Label>
              <Textarea id="bulk-notes" rows={3} placeholder="Observações gerais da promoção em massa" {...register("notes")} />
              {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
            </div>
          </div>

          <div className="space-y-3 rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Policiais selecionados</p>
                <p className="text-sm text-slate-500">{selectedOfficerIds.length} marcado(s) para promoção.</p>
              </div>
              <Input
                value={officerSearch}
                onChange={(event) => setOfficerSearch(event.target.value)}
                placeholder="Buscar policial por nome ou matrícula"
                className="md:max-w-sm"
              />
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
              {filteredOfficers.length ? (
                filteredOfficers.map((officer) => {
                  const checked = selectedOfficerIds.includes(officer.id);

                  return (
                    <label
                      key={officer.id}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 px-3 py-3 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <Checkbox checked={checked} onCheckedChange={(value) => toggleOfficer(officer.id, Boolean(value))} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{officer.name ?? "Policial sem nome"}</p>
                        <p className="text-xs text-slate-500">
                          {officer.registration_number ? `Matrícula ${officer.registration_number}` : "Matrícula não informada"}
                        </p>
                      </div>
                    </label>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">Nenhum policial encontrado para o filtro informado.</p>
              )}
            </div>
          </div>

          {failedDetails.length ? (
            <div className="space-y-2 rounded-[24px] border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">Ocorreram falhas em parte da promoção</p>
              <div className="space-y-2">
                {failedDetails.map((failure, index) => (
                  <div key={`${failure.id}-${index}`} className="rounded-2xl border border-amber-200/80 bg-white px-3 py-2 text-sm text-amber-900">
                    <p className="font-medium">{failure.name ?? `Policial #${failure.id}`}</p>
                    <p>{failure.error}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={mutation.isPending}
              onClick={() => {
                resetState();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Promovendo..." : "Promover selecionados"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
