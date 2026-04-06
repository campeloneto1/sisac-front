"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateCityMutation, useUpdateCityMutation } from "@/hooks/use-city-mutations";
import { useCityStates } from "@/hooks/use-cities";
import type { CityItem, CreateCityDTO, UpdateCityDTO } from "@/types/city.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const cityFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no maximo 100 caracteres."),
  abbreviation: z
    .string()
    .max(5, "A sigla deve ter no maximo 5 caracteres.")
    .refine((value) => value.trim() === "" || value.trim().length >= 2, "A sigla precisa ter ao menos 2 caracteres."),
  state_id: z.string(),
});

type CityFormValues = z.infer<typeof cityFormSchema>;

interface CityFormProps {
  mode: "create" | "edit";
  city?: CityItem;
}

export function CityForm({ mode, city }: CityFormProps) {
  const router = useRouter();
  const createMutation = useCreateCityMutation();
  const updateMutation = useUpdateCityMutation();
  const statesQuery = useCityStates();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CityFormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      name: city?.name ?? "",
      abbreviation: city?.abbreviation ?? "",
      state_id: city?.state_id ? String(city.state_id) : "none",
    },
  });

  useEffect(() => {
    if (!city) {
      return;
    }

    reset({
      name: city.name,
      abbreviation: city.abbreviation ?? "",
      state_id: city.state_id ? String(city.state_id) : "none",
    });
  }, [city, reset]);

  async function onSubmit(values: CityFormValues) {
    const normalizedAbbreviation = values.abbreviation.trim().toUpperCase();
    const payloadBase = {
      name: values.name.trim(),
      abbreviation: normalizedAbbreviation ? normalizedAbbreviation : null,
      state_id: values.state_id !== "none" ? Number(values.state_id) : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateCityDTO);
      router.push(`/cities/${response.data.id}`);
      return;
    }

    if (!city) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: city.id,
      payload: payloadBase satisfies UpdateCityDTO,
    });
    router.push(`/cities/${response.data.id}`);
  }

  const selectedStateId = useWatch({
    control,
    name: "state_id",
  });
  const selectedState = (statesQuery.data?.data ?? []).find((state) => String(state.id) === selectedStateId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova cidade" : "Editar cidade"}</CardTitle>
        <CardDescription>
          Cidades ficam dentro de Administrador e possuem unicidade de nome e sigla dentro do estado selecionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Fortaleza" {...register("name")} />
            <p className="text-xs text-slate-500">Obrigatorio. O backend aplica trim e valida unicidade dentro do mesmo estado.</p>
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Sigla</Label>
            <Input id="abbreviation" maxLength={5} placeholder="Ex.: FOR" {...register("abbreviation")} />
            <p className="text-xs text-slate-500">Opcional. Quando informada, a API salva automaticamente em caixa alta.</p>
            {errors.abbreviation ? <p className="text-sm text-destructive">{errors.abbreviation.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={selectedStateId} onValueChange={(value) => setValue("state_id", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem estado vinculado</SelectItem>
                {(statesQuery.data?.data ?? []).map((state) => (
                  <SelectItem key={state.id} value={String(state.id)}>
                    {state.name} • {state.abbreviation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {selectedState
                ? `Estado selecionado: ${selectedState.name} (${selectedState.abbreviation}).`
                : "Selecione um estado ou mantenha sem vinculo para refletir a regra atual da API."}
            </p>
            {errors.state_id ? <p className="text-sm text-destructive">{errors.state_id.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/cities" : `/cities/${city?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar cidade" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
