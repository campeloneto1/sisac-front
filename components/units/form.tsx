"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateUnitMutation, useUpdateUnitMutation } from "@/hooks/use-unit-mutations";
import { useUnitCities, useUnitPoliceOfficers } from "@/hooks/use-units";
import type { CreateUnitDTO, UnitItem, UpdateUnitDTO } from "@/types/unit.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const unitFormSchema = z
  .object({
    name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no maximo 100 caracteres."),
    abbreviation: z.string().min(2, "A sigla precisa ter ao menos 2 caracteres.").max(20, "A sigla deve ter no maximo 20 caracteres."),
    phone: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10, "Informe um telefone com 10 ou 11 digitos."),
    email: z.string().refine((value) => value.trim() === "" || z.email().safeParse(value.trim()).success, "Informe um email valido."),
    street: z.string().max(100, "A rua deve ter no maximo 100 caracteres."),
    number: z.string().max(20, "O numero deve ter no maximo 20 caracteres."),
    neighborhood: z.string().max(100, "O bairro deve ter no maximo 100 caracteres."),
    postal_code: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length === 8, "Informe um CEP com 8 digitos."),
    city_id: z.string(),
    commander_id: z.string(),
    deputy_commander_id: z.string(),
  })
  .refine((values) => values.commander_id === "none" || values.deputy_commander_id === "none" || values.commander_id !== values.deputy_commander_id, {
    message: "Comandante e subcomandante precisam ser pessoas diferentes.",
    path: ["deputy_commander_id"],
  });

type UnitFormValues = z.infer<typeof unitFormSchema>;

interface UnitFormProps {
  mode: "create" | "edit";
  unit?: UnitItem;
}

function getOfficerLabel(officer: { id: number; name?: string | null; registration_number?: string | null }) {
  if (officer.name && officer.registration_number) {
    return `${officer.name} • ${officer.registration_number}`;
  }

  return officer.name || officer.registration_number || `Policial #${officer.id}`;
}

export function UnitForm({ mode, unit }: UnitFormProps) {
  const router = useRouter();
  const createMutation = useCreateUnitMutation();
  const updateMutation = useUpdateUnitMutation();
  const citiesQuery = useUnitCities();
  const policeOfficersQuery = useUnitPoliceOfficers();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: unit?.name ?? "",
      abbreviation: unit?.abbreviation ?? "",
      phone: unit?.phone ?? "",
      email: unit?.email ?? "",
      street: unit?.street ?? "",
      number: unit?.number ?? "",
      neighborhood: unit?.neighborhood ?? "",
      postal_code: unit?.postal_code ?? "",
      city_id: unit?.city_id ? String(unit.city_id) : "none",
      commander_id: unit?.commander_id ? String(unit.commander_id) : "none",
      deputy_commander_id: unit?.deputy_commander_id ? String(unit.deputy_commander_id) : "none",
    },
  });

  useEffect(() => {
    if (!unit) {
      return;
    }

    reset({
      name: unit.name,
      abbreviation: unit.abbreviation,
      phone: unit.phone ?? "",
      email: unit.email ?? "",
      street: unit.street ?? "",
      number: unit.number ?? "",
      neighborhood: unit.neighborhood ?? "",
      postal_code: unit.postal_code ?? "",
      city_id: unit.city_id ? String(unit.city_id) : "none",
      commander_id: unit.commander_id ? String(unit.commander_id) : "none",
      deputy_commander_id: unit.deputy_commander_id ? String(unit.deputy_commander_id) : "none",
    });
  }, [reset, unit]);

  async function onSubmit(values: UnitFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      abbreviation: values.abbreviation.trim().toUpperCase(),
      phone: values.phone.trim() ? values.phone.replace(/\D/g, "") : null,
      email: values.email.trim() ? values.email.trim().toLowerCase() : null,
      street: values.street.trim() || null,
      number: values.number.trim() || null,
      neighborhood: values.neighborhood.trim() || null,
      postal_code: values.postal_code.trim() ? values.postal_code.replace(/\D/g, "") : null,
      city_id: values.city_id !== "none" ? Number(values.city_id) : null,
      commander_id: values.commander_id !== "none" ? Number(values.commander_id) : null,
      deputy_commander_id: values.deputy_commander_id !== "none" ? Number(values.deputy_commander_id) : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateUnitDTO);
      router.push(`/units/${response.data.id}`);
      return;
    }

    if (!unit) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: unit.id,
      payload: payloadBase satisfies UpdateUnitDTO,
    });
    router.push(`/units/${response.data.id}`);
  }

  const selectedCityId = useWatch({ control, name: "city_id" });
  const selectedCommanderId = useWatch({ control, name: "commander_id" });
  const selectedDeputyCommanderId = useWatch({ control, name: "deputy_commander_id" });
  const selectedCity = (citiesQuery.data?.data ?? []).find((city) => String(city.id) === selectedCityId);
  const selectedCommander = (policeOfficersQuery.data?.data ?? []).find((officer) => String(officer.id) === selectedCommanderId);
  const selectedDeputyCommander = (policeOfficersQuery.data?.data ?? []).find(
    (officer) => String(officer.id) === selectedDeputyCommanderId,
  );
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova unidade" : "Editar unidade"}</CardTitle>
        <CardDescription>
          Unidades ficam dentro de Administrador e concentram identificacao institucional, contato, endereco e cadeia de comando.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Comando de Policiamento da Capital" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Sigla</Label>
            <Input id="abbreviation" maxLength={20} placeholder="Ex.: CPC" {...register("abbreviation")} />
            <p className="text-xs text-slate-500">Obrigatoria. O backend salva automaticamente em caixa alta.</p>
            {errors.abbreviation ? <p className="text-sm text-destructive">{errors.abbreviation.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="Ex.: 83999998888" {...register("phone")} />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="Ex.: unidade@org.br" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Rua</Label>
            <Input id="street" placeholder="Ex.: Avenida Central" {...register("street")} />
            {errors.street ? <p className="text-sm text-destructive">{errors.street.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Numero</Label>
            <Input id="number" placeholder="Ex.: 1200" {...register("number")} />
            {errors.number ? <p className="text-sm text-destructive">{errors.number.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input id="neighborhood" placeholder="Ex.: Centro" {...register("neighborhood")} />
            {errors.neighborhood ? <p className="text-sm text-destructive">{errors.neighborhood.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">CEP</Label>
            <Input id="postal_code" placeholder="Ex.: 58000000" {...register("postal_code")} />
            {errors.postal_code ? <p className="text-sm text-destructive">{errors.postal_code.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Cidade</Label>
            <Select value={selectedCityId} onValueChange={(value) => setValue("city_id", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem cidade vinculada</SelectItem>
                {(citiesQuery.data?.data ?? []).map((city) => (
                  <SelectItem key={city.id} value={String(city.id)}>
                    {city.name} • {city.abbreviation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {selectedCity ? `Cidade selecionada: ${selectedCity.name} (${selectedCity.abbreviation}).` : "A cidade e opcional no backend atual."}
            </p>
            {errors.city_id ? <p className="text-sm text-destructive">{errors.city_id.message}</p> : null}
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
            <Select value={selectedDeputyCommanderId} onValueChange={(value) => setValue("deputy_commander_id", value, { shouldValidate: true })}>
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
                : "Opcional. Nao pode ser a mesma pessoa do comandante."}
            </p>
            {errors.deputy_commander_id ? <p className="text-sm text-destructive">{errors.deputy_commander_id.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/units" : `/units/${unit?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar unidade" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
