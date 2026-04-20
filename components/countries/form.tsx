"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateCountryMutation, useUpdateCountryMutation } from "@/hooks/use-country-mutations";
import type { CountryItem, CreateCountryDTO, UpdateCountryDTO } from "@/types/country.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const countryFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no máximo 100 caracteres."),
  abbreviation: z.string().min(2, "A sigla precisa ter ao menos 2 caracteres.").max(5, "A sigla deve ter no máximo 5 caracteres."),
});

type CountryFormValues = z.infer<typeof countryFormSchema>;

interface CountryFormProps {
  mode: "create" | "edit";
  country?: CountryItem;
}

export function CountryForm({ mode, country }: CountryFormProps) {
  const router = useRouter();
  const createMutation = useCreateCountryMutation();
  const updateMutation = useUpdateCountryMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: {
      name: country?.name ?? "",
      abbreviation: country?.abbreviation ?? "",
    },
  });

  useEffect(() => {
    if (!country) {
      return;
    }

    reset({
      name: country.name,
      abbreviation: country.abbreviation,
    });
  }, [country, reset]);

  async function onSubmit(values: CountryFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      abbreviation: values.abbreviation.trim().toUpperCase(),
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateCountryDTO);
      router.push(`/countries/${response.data.id}`);
      return;
    }

    if (!country) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: country.id,
      payload: payloadBase satisfies UpdateCountryDTO,
    });
    router.push(`/countries/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo país" : "Editar país"}</CardTitle>
        <CardDescription>Países ficam dentro de Administrador e servem como base para cadastros territoriais.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" placeholder="Ex.: Brasil" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Sigla *</Label>
            <Input id="abbreviation" maxLength={5} placeholder="Ex.: BR" {...register("abbreviation")} />
            <p className="text-xs text-slate-500">Obrigatória. O backend salva automaticamente em caixa alta.</p>
            {errors.abbreviation ? <p className="text-sm text-destructive">{errors.abbreviation.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/countries" : `/countries/${country?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar país" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
