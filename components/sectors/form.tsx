"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSubunit } from "@/contexts/subunit-context";
import { useCreateSectorMutation, useUpdateSectorMutation } from "@/hooks/use-sector-mutations";
import { useSectorPoliceOfficers } from "@/hooks/use-sectors";
import type { CreateSectorDTO, SectorItem, UpdateSectorDTO } from "@/types/sector.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const sectorFormSchema = z
  .object({
    name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no máximo 100 caracteres."),
    abbreviation: z.string().max(20, "A sigla deve ter no máximo 20 caracteres."),
    phone: z.string().refine((value) => value.trim() === "" || [10, 11].includes(value.replace(/\D/g, "").length), "Informe um telefone com 10 ou 11 dígitos."),
    email: z.string().refine((value) => value.trim() === "" || z.email().safeParse(value.trim()).success, "Informe um email válido."),
    commander_id: z.string(),
    deputy_commander_id: z.string(),
  })
  .refine((values) => values.commander_id === "none" || values.deputy_commander_id === "none" || values.commander_id !== values.deputy_commander_id, {
    message: "Comandante e subcomandante precisam ser pessoas diferentes.",
    path: ["deputy_commander_id"],
  });

type SectorFormValues = z.infer<typeof sectorFormSchema>;

interface SectorFormProps {
  mode: "create" | "edit";
  sector?: SectorItem;
}

function getOfficerLabel(officer: { id: number; name?: string | null; registration_number?: string | null }) {
  if (officer.name && officer.registration_number) {
    return `${officer.name} • ${officer.registration_number}`;
  }

  return officer.name || officer.registration_number || `Policial #${officer.id}`;
}

export function SectorForm({ mode, sector }: SectorFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreateSectorMutation();
  const updateMutation = useUpdateSectorMutation();
  const policeOfficersQuery = useSectorPoliceOfficers(undefined, Boolean(activeSubunit));
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<SectorFormValues>({
    resolver: zodResolver(sectorFormSchema),
    defaultValues: {
      name: sector?.name ?? "",
      abbreviation: sector?.abbreviation ?? "",
      phone: sector?.phone ?? "",
      email: sector?.email ?? "",
      commander_id: sector?.commander_id ? String(sector.commander_id) : "none",
      deputy_commander_id: sector?.deputy_commander_id ? String(sector.deputy_commander_id) : "none",
    },
  });

  useEffect(() => {
    if (!sector) {
      return;
    }

    reset({
      name: sector.name,
      abbreviation: sector.abbreviation ?? "",
      phone: sector.phone ?? "",
      email: sector.email ?? "",
      commander_id: sector.commander_id ? String(sector.commander_id) : "none",
      deputy_commander_id: sector.deputy_commander_id ? String(sector.deputy_commander_id) : "none",
    });
  }, [reset, sector]);

  async function onSubmit(values: SectorFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      abbreviation: values.abbreviation.trim() ? values.abbreviation.trim().toUpperCase() : null,
      phone: values.phone.trim() ? values.phone.replace(/\D/g, "") : null,
      email: values.email.trim() ? values.email.trim().toLowerCase() : null,
      subunit_id: activeSubunit ? Number(activeSubunit.id) : null,
      commander_id: values.commander_id !== "none" ? Number(values.commander_id) : null,
      deputy_commander_id: values.deputy_commander_id !== "none" ? Number(values.deputy_commander_id) : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateSectorDTO);
      router.push(`/sectors/${response.data.id}`);
      return;
    }

    if (!sector) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: sector.id,
      payload: payloadBase satisfies UpdateSectorDTO,
    });
    router.push(`/sectors/${response.data.id}`);
  }

  const selectedCommanderId = useWatch({ control, name: "commander_id" });
  const selectedDeputyCommanderId = useWatch({ control, name: "deputy_commander_id" });
  const selectedCommander = (policeOfficersQuery.data?.data ?? []).find((officer) => String(officer.id) === selectedCommanderId);
  const selectedDeputyCommander = (policeOfficersQuery.data?.data ?? []).find((officer) => String(officer.id) === selectedDeputyCommanderId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo setor" : "Editar setor"}</CardTitle>
        <CardDescription>
          Setores ficam dentro de Administrador, mas operam no contexto da subunidade ativa e influenciam alocações e fluxos internos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Subunidade ativa: <span className="font-medium text-slate-900">{activeSubunit?.name ?? "Não selecionada"}</span>
        </div>

        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Patrimônio, Logística, Financeiro" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Sigla</Label>
            <Input id="abbreviation" maxLength={20} placeholder="Ex.: PAT" {...register("abbreviation")} />
            <p className="text-xs text-slate-500">Opcional. O backend normaliza a sigla para caixa alta.</p>
            {errors.abbreviation ? <p className="text-sm text-destructive">{errors.abbreviation.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="Ex.: 83999998888" {...register("phone")} />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="Ex.: setor@org.br" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Comandante</Label>
            <Select value={selectedCommanderId} onValueChange={(value) => setValue("commander_id", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o comandante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem comandante definido</SelectItem>
                {(policeOfficersQuery.data?.data ?? []).map((officer) => (
                  <SelectItem key={officer.id} value={String(officer.id)}>
                    {getOfficerLabel(officer)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {selectedCommander ? `Comandante selecionado: ${getOfficerLabel(selectedCommander)}.` : "Opcional. Deve ser diferente do subcomandante."}
            </p>
            {errors.commander_id ? <p className="text-sm text-destructive">{errors.commander_id.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Subcomandante</Label>
            <Select
              value={selectedDeputyCommanderId}
              onValueChange={(value) => setValue("deputy_commander_id", value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o subcomandante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem subcomandante definido</SelectItem>
                {(policeOfficersQuery.data?.data ?? []).map((officer) => (
                  <SelectItem key={officer.id} value={String(officer.id)}>
                    {getOfficerLabel(officer)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {selectedDeputyCommander
                ? `Subcomandante selecionado: ${getOfficerLabel(selectedDeputyCommander)}.`
                : "Opcional. Não pode ser a mesma pessoa do comandante."}
            </p>
            {errors.deputy_commander_id ? <p className="text-sm text-destructive">{errors.deputy_commander_id.message}</p> : null}
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            Este cadastro e isolado por subunidade ativa. Ao trocar o contexto global, a listagem e os dados visiveis também mudam.
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/sectors" : `/sectors/${sector?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar setor" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
