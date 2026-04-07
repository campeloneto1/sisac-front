"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";

import {
  useCreateWorkshopMutation,
  useUpdateWorkshopMutation,
} from "@/hooks/use-workshop-mutations";
import type {
  CreateWorkshopDTO,
  UpdateWorkshopDTO,
  WorkshopItem,
  WorkshopStatus,
} from "@/types/workshop.type";
import { workshopStatusOptions } from "@/types/workshop.type";
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

const workshopFormSchema = z.object({
  name: z
    .string()
    .min(2, "O nome precisa ter ao menos 2 caracteres.")
    .max(100, "O nome deve ter no maximo 100 caracteres."),
  cnpj: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.replace(/\D/g, "").length === 14,
      "Informe um CNPJ com 14 digitos.",
    ),
  phone: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10,
      "Informe um telefone valido.",
    ),
  email: z
    .string()
    .refine(
      (value) =>
        value.trim() === "" || z.email().safeParse(value.trim()).success,
      "Informe um email valido.",
    ),
  address: z.string().max(200, "O endereco deve ter no maximo 200 caracteres."),
  city: z.string().max(100, "A cidade deve ter no maximo 100 caracteres."),
  state: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.trim().length === 2,
      "A UF deve ter 2 caracteres.",
    ),
  zip_code: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.replace(/\D/g, "").length === 8,
      "Informe um CEP com 8 digitos.",
    ),
  contact_person: z
    .string()
    .max(100, "O contato principal deve ter no maximo 100 caracteres."),
  contact_phone: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10,
      "Informe um telefone de contato valido.",
    ),
  status: z.string(),
  notes: z
    .string()
    .max(5000, "As observacoes devem ter no maximo 5000 caracteres."),
  specialties: z.array(
    z.object({
      value: z
        .string()
        .min(1, "Informe a especialidade.")
        .max(100, "A especialidade deve ter no maximo 100 caracteres."),
    }),
  ),
});

type WorkshopFormValues = z.infer<typeof workshopFormSchema>;

interface WorkshopFormProps {
  mode: "create" | "edit";
  workshop?: WorkshopItem;
}

export function WorkshopForm({ mode, workshop }: WorkshopFormProps) {
  const router = useRouter();
  const createMutation = useCreateWorkshopMutation();
  const updateMutation = useUpdateWorkshopMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorkshopFormValues>({
    resolver: zodResolver(workshopFormSchema),
    defaultValues: {
      name: workshop?.name ?? "",
      cnpj: workshop?.cnpj ?? "",
      phone: workshop?.phone ?? "",
      email: workshop?.email ?? "",
      address: workshop?.address ?? "",
      city: workshop?.city ?? "",
      state: workshop?.state ?? "",
      zip_code: workshop?.zip_code ?? "",
      contact_person: workshop?.contact_person ?? "",
      contact_phone: workshop?.contact_phone ?? "",
      status: workshop?.status ?? "active",
      notes: workshop?.notes ?? "",
      specialties:
        workshop?.specialties?.map((item) => ({ value: item })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specialties",
  });

  useEffect(() => {
    if (!workshop) {
      return;
    }

    reset({
      name: workshop.name ?? "",
      cnpj: workshop.cnpj ?? "",
      phone: workshop.phone ?? "",
      email: workshop.email ?? "",
      address: workshop.address ?? "",
      city: workshop.city ?? "",
      state: workshop.state ?? "",
      zip_code: workshop.zip_code ?? "",
      contact_person: workshop.contact_person ?? "",
      contact_phone: workshop.contact_phone ?? "",
      status: workshop.status ?? "active",
      notes: workshop.notes ?? "",
      specialties:
        workshop.specialties?.map((item) => ({ value: item })) ?? [],
    });
  }, [workshop, reset]);

  async function onSubmit(values: WorkshopFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      cnpj: values.cnpj.trim() ? values.cnpj.replace(/\D/g, "") : null,
      phone: values.phone.trim() ? values.phone.replace(/\D/g, "") : null,
      email: values.email.trim() ? values.email.trim().toLowerCase() : null,
      address: values.address.trim() || null,
      city: values.city.trim() || null,
      state: values.state.trim() ? values.state.trim().toUpperCase() : null,
      zip_code: values.zip_code.trim()
        ? values.zip_code.replace(/\D/g, "")
        : null,
      specialties: values.specialties.length
        ? values.specialties.map((item) => item.value.trim()).filter(Boolean)
        : null,
      contact_person: values.contact_person.trim() || null,
      contact_phone: values.contact_phone.trim()
        ? values.contact_phone.replace(/\D/g, "")
        : null,
      status: values.status as WorkshopStatus,
      notes: values.notes.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreateWorkshopDTO,
      );
      router.push(`/workshops/${response.data.id}`);
      return;
    }

    if (!workshop) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: workshop.id,
      payload: payloadBase satisfies UpdateWorkshopDTO,
    });
    router.push(`/workshops/${response.data.id}`);
  }

  const selectedStatus = watch("status");
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nova oficina" : "Editar oficina"}
        </CardTitle>
        <CardDescription>
          Oficinas ficam dentro do painel Gestor e organizam prestadores de
          servicos para manutencao veicular.
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
                Identificacao institucional e status da oficina.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Ex.: Auto Mecanica Silva"
                  {...register("name")}
                />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setValue("status", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {workshopStatusOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" placeholder="Ex.: 12345678000190" {...register("cnpj")} />
                {errors.cnpj ? (
                  <p className="text-sm text-destructive">{errors.cnpj.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="Ex.: 83999998888" {...register("phone")} />
                {errors.phone ? (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Ex.: contato@oficina.com"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Localizacao e contato
              </h3>
              <p className="text-sm text-slate-500">
                Endereco e pessoa de referencia para operacao.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2 xl:col-span-3">
                <Label htmlFor="address">Endereco</Label>
                <Input
                  id="address"
                  placeholder="Ex.: Rua das Flores, 123"
                  {...register("address")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="Ex.: Joao Pessoa" {...register("city")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">UF</Label>
                <Input
                  id="state"
                  maxLength={2}
                  placeholder="Ex.: PB"
                  {...register("state")}
                />
                {errors.state ? (
                  <p className="text-sm text-destructive">{errors.state.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input id="zip_code" placeholder="Ex.: 58000000" {...register("zip_code")} />
                {errors.zip_code ? (
                  <p className="text-sm text-destructive">
                    {errors.zip_code.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Contato principal</Label>
                <Input
                  id="contact_person"
                  placeholder="Ex.: Joao Silva"
                  {...register("contact_person")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Telefone do contato</Label>
                <Input
                  id="contact_phone"
                  placeholder="Ex.: 83988887777"
                  {...register("contact_phone")}
                />
                {errors.contact_phone ? (
                  <p className="text-sm text-destructive">
                    {errors.contact_phone.message}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Especialidades
                </h3>
                <p className="text-sm text-slate-500">
                  Liste os servicos que a oficina atende.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ value: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {fields.length ? (
                fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Ex.: Funilaria, pintura, injecao eletronica"
                        {...register(`specialties.${index}.value`)}
                      />
                      {errors.specialties?.[index]?.value ? (
                        <p className="text-sm text-destructive">
                          {errors.specialties[index]?.value?.message}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  Nenhuma especialidade adicionada ainda.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Observacoes
              </h3>
              <p className="text-sm text-slate-500">
                Campo livre para acordos, restricoes ou contexto adicional.
              </p>
            </div>
            <div className="space-y-2">
              <Textarea
                rows={5}
                placeholder="Registre observacoes gerais sobre a oficina."
                {...register("notes")}
              />
              {errors.notes ? (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              ) : null}
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link
                href={
                  mode === "create" ? "/workshops" : `/workshops/${workshop?.id}`
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar oficina"
                  : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
