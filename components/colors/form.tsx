"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateColorMutation,
  useUpdateColorMutation,
} from "@/hooks/use-color-mutations";
import type {
  ColorItem,
  CreateColorDTO,
  UpdateColorDTO,
} from "@/types/color.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const colorFormSchema = z.object({
  name: z
    .string()
    .min(2, "O nome precisa ter ao menos 2 caracteres.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  slug: z
    .string()
    .min(2, "O slug precisa ter ao menos 2 caracteres.")
    .max(50, "O slug deve ter no máximo 50 caracteres."),
  hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Informe um HEX válido no formato #RRGGBB.")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
});

type ColorFormValues = z.infer<typeof colorFormSchema>;

interface ColorFormProps {
  mode: "create" | "edit";
  color?: ColorItem;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getColorPreviewStyle(hex?: string) {
  return {
    backgroundColor: hex && /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#e2e8f0",
  };
}

export function ColorForm({ mode, color }: ColorFormProps) {
  const router = useRouter();
  const createMutation = useCreateColorMutation();
  const updateMutation = useUpdateColorMutation();
  const [autoSlug, setAutoSlug] = useState(mode === "create");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ColorFormValues>({
    resolver: zodResolver(colorFormSchema),
    defaultValues: {
      name: color?.name ?? "",
      slug: color?.slug ?? "",
      hex: color?.hex ?? "",
      is_active: color?.is_active ?? true,
    },
  });

  const nameField = register("name");
  const slugField = register("slug");
  const watchedName = useWatch({
    control,
    name: "name",
  });
  const watchedHex = useWatch({
    control,
    name: "hex",
  });
  const isActive = useWatch({
    control,
    name: "is_active",
  });

  useEffect(() => {
    if (!color) {
      return;
    }

    reset({
      name: color.name,
      slug: color.slug,
      hex: color.hex ?? "",
      is_active: color.is_active,
    });
    setAutoSlug(false);
  }, [color, reset]);

  useEffect(() => {
    if (!autoSlug || mode !== "create") {
      return;
    }

    setValue("slug", slugify(watchedName || ""), {
      shouldValidate: Boolean(watchedName),
      shouldDirty: false,
    });
  }, [autoSlug, mode, setValue, watchedName]);

  async function onSubmit(values: ColorFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      slug: slugify(values.slug),
      hex: values.hex?.trim() || null,
      is_active: values.is_active,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreateColorDTO,
      );
      router.push(`/colors/${response.data.id}`);
      return;
    }

    if (!color) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: color.id,
      payload: payloadBase satisfies UpdateColorDTO,
    });
    router.push(`/colors/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova cor" : "Editar cor"}</CardTitle>
        <CardDescription>
          Cores ficam em Administrador e podem ser reutilizadas por cadastros
          mestres dependentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Ex.: Azul marinho, Vermelho, Preto"
                  {...nameField}
                  onChange={(event) => {
                    nameField.onChange(event);
                  }}
                />
                {errors.name ? (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="Ex.: azul-marinho"
                  {...slugField}
                  onChange={(event) => {
                    setAutoSlug(false);
                    slugField.onChange(event);
                  }}
                />
                <p className="text-xs text-slate-500">
                  No cadastro novo, o slug e sugerido automaticamente a partir
                  do nome, mas continua editavel.
                </p>
                {errors.slug ? (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hex">HEX</Label>
                <Input
                  id="hex"
                  placeholder="Ex.: #1E3A8A"
                  {...register("hex")}
                />
                <p className="text-xs text-slate-500">
                  Opcional. Use o formato padrao `#RRGGBB`.
                </p>
                {errors.hex ? (
                  <p className="text-sm text-destructive">{errors.hex.message}</p>
                ) : null}
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    setValue("is_active", checked === true, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
                <span className="space-y-1">
                  <span className="block text-sm font-medium text-slate-900">
                    Cor ativa
                  </span>
                  <span className="block text-sm text-slate-500">
                    Cores inativas continuam historicas, mas podem ser ocultadas
                    em fluxos futuros.
                  </span>
                </span>
              </label>
            </div>

            <div className="space-y-3 rounded-[24px] border border-slate-200/70 bg-slate-50 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Preview
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Visualizacao rapida da cor cadastrada.
                </p>
              </div>

              <div
                className="h-40 rounded-[24px] border border-slate-200 shadow-inner"
                style={getColorPreviewStyle(watchedHex)}
              />

              <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  HEX atual
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {watchedHex?.trim() || "Não informado"}
                </p>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/colors" : `/colors/${color?.id}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar cor"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
