"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateSubunitMutation, useUpdateSubunitMutation } from "@/hooks/use-subunit-mutations";
import { useSubunitCities, useSubunitPoliceOfficers, useSubunitUnits } from "@/hooks/use-subunits";
import type { CreateSubunitDTO, SubunitItem, UpdateSubunitDTO } from "@/types/subunit.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const subunitFormSchema = z
  .object({
    name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no máximo 100 caracteres."),
    abbreviation: z.string().min(2, "A sigla precisa ter ao menos 2 caracteres.").max(20, "A sigla deve ter no máximo 20 caracteres."),
    phone: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10, "Informe um telefone com 10 ou 11 dígitos."),
    email: z.string().refine((value) => value.trim() === "" || z.email().safeParse(value.trim()).success, "Informe um email válido."),
    street: z.string().max(100, "A rua deve ter no máximo 100 caracteres."),
    number: z.string().max(20, "O número deve ter no máximo 20 caracteres."),
    neighborhood: z.string().max(100, "O bairro deve ter no máximo 100 caracteres."),
    postal_code: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length === 8, "Informe um CEP com 8 dígitos."),
    city_id: z.string(),
    unit_id: z.string(),
    commander_id: z.string(),
    deputy_commander_id: z.string(),
  })
  .refine(
    (values) => values.commander_id === "none" || values.deputy_commander_id === "none" || values.commander_id !== values.deputy_commander_id,
    {
      message: "Comandante e subcomandante precisam ser pessoas diferentes.",
      path: ["deputy_commander_id"],
    },
  );

type SubunitFormValues = z.infer<typeof subunitFormSchema>;

interface SubunitFormProps {
  mode: "create" | "edit";
  subunit?: SubunitItem;
}

function getOfficerLabel(officer: { id: number; name?: string | null; registration_number?: string | null }) {
  if (officer.name && officer.registration_number) {
    return `${officer.name} • ${officer.registration_number}`;
  }

  return officer.name || officer.registration_number || `Policial #${officer.id}`;
}

export function SubunitForm({ mode, subunit }: SubunitFormProps) {
  const router = useRouter();
  const createMutation = useCreateSubunitMutation();
  const updateMutation = useUpdateSubunitMutation();
  const citiesQuery = useSubunitCities();
  const unitsQuery = useSubunitUnits();
  const policeOfficersQuery = useSubunitPoliceOfficers();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<SubunitFormValues>({
    resolver: zodResolver(subunitFormSchema),
    defaultValues: {
      name: subunit?.name ?? "",
      abbreviation: subunit?.abbreviation ?? "",
      phone: subunit?.phone ?? "",
      email: subunit?.email ?? "",
      street: subunit?.street ?? "",
      number: subunit?.number ?? "",
      neighborhood: subunit?.neighborhood ?? "",
      postal_code: subunit?.postal_code ?? "",
      city_id: subunit?.city_id ? String(subunit.city_id) : "none",
      unit_id: subunit?.unit_id ? String(subunit.unit_id) : "none",
      commander_id: subunit?.commander_id ? String(subunit.commander_id) : "none",
      deputy_commander_id: subunit?.deputy_commander_id ? String(subunit.deputy_commander_id) : "none",
    },
  });

  useEffect(() => {
    if (!subunit) {
      return;
    }

    reset({
      name: subunit.name,
      abbreviation: subunit.abbreviation,
      phone: subunit.phone ?? "",
      email: subunit.email ?? "",
      street: subunit.street ?? "",
      number: subunit.number ?? "",
      neighborhood: subunit.neighborhood ?? "",
      postal_code: subunit.postal_code ?? "",
      city_id: subunit.city_id ? String(subunit.city_id) : "none",
      unit_id: subunit.unit_id ? String(subunit.unit_id) : "none",
      commander_id: subunit.commander_id ? String(subunit.commander_id) : "none",
      deputy_commander_id: subunit.deputy_commander_id ? String(subunit.deputy_commander_id) : "none",
    });
  }, [reset, subunit]);

  async function onSubmit(values: SubunitFormValues) {
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
      unit_id: values.unit_id !== "none" ? Number(values.unit_id) : null,
      commander_id: values.commander_id !== "none" ? Number(values.commander_id) : null,
      deputy_commander_id: values.deputy_commander_id !== "none" ? Number(values.deputy_commander_id) : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateSubunitDTO);
      router.push(`/subunits/${response.data.id}`);
      return;
    }

    if (!subunit) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: subunit.id,
      payload: payloadBase satisfies UpdateSubunitDTO,
    });
    router.push(`/subunits/${response.data.id}`);
  }

  const selectedCityId = useWatch({ control, name: "city_id" });
  const selectedUnitId = useWatch({ control, name: "unit_id" });
  const selectedCommanderId = useWatch({ control, name: "commander_id" });
  const selectedDeputyCommanderId = useWatch({ control, name: "deputy_commander_id" });
  const selectedCity = (citiesQuery.data?.data ?? []).find((city) => String(city.id) === selectedCityId);
  const selectedUnit = (unitsQuery.data?.data ?? []).find((unitItem) => String(unitItem.id) === selectedUnitId);
  const selectedCommander = (policeOfficersQuery.data?.data ?? []).find((officer) => String(officer.id) === selectedCommanderId);
  const selectedDeputyCommander = (policeOfficersQuery.data?.data ?? []).find((officer) => String(officer.id) === selectedDeputyCommanderId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova subunidade" : "Editar subunidade"}</CardTitle>
        <CardDescription>
          Subunidades ficam dentro de Administrador e possuem unicidade de nome e sigla dentro da unidade selecionada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" placeholder="Ex.: 1ª Companhia" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Sigla *</Label>
            <Input id="abbreviation" maxLength={20} placeholder="Ex.: 1CIA" {...register("abbreviation")} />
            <p className="text-xs text-slate-500">Obrigatória. O backend salva automaticamente em caixa alta.</p>
            {errors.abbreviation ? <p className="text-sm text-destructive">{errors.abbreviation.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="Ex.: 83999998888" {...register("phone")} />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="Ex.: subunidade@org.br" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Rua</Label>
            <Input id="street" placeholder="Ex.: Rua Principal" {...register("street")} />
            {errors.street ? <p className="text-sm text-destructive">{errors.street.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input id="number" placeholder="Ex.: 120" {...register("number")} />
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
            <Label>Unidade</Label>
            <Select value={selectedUnitId} onValueChange={(value) => setValue("unit_id", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem unidade vinculada</SelectItem>
                {(unitsQuery.data?.data ?? []).map((unitItem) => (
                  <SelectItem key={unitItem.id} value={String(unitItem.id)}>
                    {unitItem.name} • {unitItem.abbreviation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {selectedUnit ? `Unidade selecionada: ${selectedUnit.name} (${selectedUnit.abbreviation}).` : "A API permite subunidade sem unidade vinculada, mas a unicidade depende desse contexto."}
            </p>
            {errors.unit_id ? <p className="text-sm text-destructive">{errors.unit_id.message}</p> : null}
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
                : "Opcional. Não pode ser a mesma pessoa do comandante."}
            </p>
            {errors.deputy_commander_id ? <p className="text-sm text-destructive">{errors.deputy_commander_id.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/subunits" : `/subunits/${subunit?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar subunidade" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
