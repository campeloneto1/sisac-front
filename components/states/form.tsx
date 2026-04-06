"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateStateMutation, useUpdateStateMutation } from "@/hooks/use-state-mutations";
import { useStateCountries } from "@/hooks/use-states";
import type { CreateStateDTO, StateItem, UpdateStateDTO } from "@/types/state.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const stateFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no maximo 100 caracteres."),
  abbreviation: z.string().min(2, "A sigla precisa ter ao menos 2 caracteres.").max(5, "A sigla deve ter no maximo 5 caracteres."),
  country_id: z.string(),
});

type StateFormValues = z.infer<typeof stateFormSchema>;

interface StateFormProps {
  mode: "create" | "edit";
  stateItem?: StateItem;
}

export function StateForm({ mode, stateItem }: StateFormProps) {
  const router = useRouter();
  const createMutation = useCreateStateMutation();
  const updateMutation = useUpdateStateMutation();
  const countriesQuery = useStateCountries();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<StateFormValues>({
    resolver: zodResolver(stateFormSchema),
    defaultValues: {
      name: stateItem?.name ?? "",
      abbreviation: stateItem?.abbreviation ?? "",
      country_id: stateItem?.country_id ? String(stateItem.country_id) : "none",
    },
  });

  useEffect(() => {
    if (!stateItem) {
      return;
    }

    reset({
      name: stateItem.name,
      abbreviation: stateItem.abbreviation,
      country_id: stateItem.country_id ? String(stateItem.country_id) : "none",
    });
  }, [reset, stateItem]);

  async function onSubmit(values: StateFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      abbreviation: values.abbreviation.trim().toUpperCase(),
      country_id: values.country_id !== "none" ? Number(values.country_id) : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateStateDTO);
      router.push(`/states/${response.data.id}`);
      return;
    }

    if (!stateItem) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: stateItem.id,
      payload: payloadBase satisfies UpdateStateDTO,
    });
    router.push(`/states/${response.data.id}`);
  }

  const selectedCountryId = useWatch({
    control,
    name: "country_id",
  });
  const selectedCountry = (countriesQuery.data?.data ?? []).find((country) => String(country.id) === selectedCountryId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo estado" : "Editar estado"}</CardTitle>
        <CardDescription>Estados ficam dentro de Administrador e dependem do pais para contexto e unicidade.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Ceara" {...register("name")} />
            <p className="text-xs text-slate-500">O backend valida unicidade do nome dentro do mesmo pais.</p>
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Sigla</Label>
            <Input id="abbreviation" maxLength={5} placeholder="Ex.: CE" {...register("abbreviation")} />
            <p className="text-xs text-slate-500">Obrigatoria. O backend salva automaticamente em caixa alta.</p>
            {errors.abbreviation ? <p className="text-sm text-destructive">{errors.abbreviation.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Pais</Label>
            <Select value={selectedCountryId} onValueChange={(value) => setValue("country_id", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um pais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem pais vinculado</SelectItem>
                {(countriesQuery.data?.data ?? []).map((country) => (
                  <SelectItem key={country.id} value={String(country.id)}>
                    {country.name} • {country.abbreviation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {selectedCountry
                ? `Pais selecionado: ${selectedCountry.name} (${selectedCountry.abbreviation}).`
                : "Selecione um pais para contextualizar o estado e suas regras de unicidade."}
            </p>
            {errors.country_id ? <p className="text-sm text-destructive">{errors.country_id.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/states" : `/states/${stateItem?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar estado" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
