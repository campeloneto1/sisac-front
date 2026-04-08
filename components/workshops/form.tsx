"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

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
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  cnpj: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.replace(/\D/g, "").length === 14,
      "Informe um CNPJ com 14 dígitos.",
    ),
  phone: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10,
      "Informe um telefone com 10 ou 11 dígitos.",
    ),
  email: z
    .string()
    .refine(
      (value) =>
        value.trim() === "" || z.email().safeParse(value.trim()).success,
      "Informe um email válido.",
    ),
  address: z
    .string()
    .max(255, "O endereco deve ter no máximo 255 caracteres."),
  city: z.string().max(100, "A cidade deve ter no máximo 100 caracteres."),
  state: z
    .string()
    .max(2, "A UF deve ter no máximo 2 caracteres.")
    .refine(
      (value) => value.trim() === "" || value.trim().length === 2,
      "Informe uma UF com 2 caracteres.",
    ),
  zip_code: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.replace(/\D/g, "").length === 8,
      "Informe um CEP com 8 dígitos.",
    ),
  contact_person: z
    .string()
    .max(100, "O nome do contato deve ter no máximo 100 caracteres."),
  contact_phone: z
    .string()
    .refine(
      (value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10,
      "Informe um telefone com 10 ou 11 dígitos.",
    ),
  status: z.enum(["active", "inactive"]),
  notes: z.string().max(5000, "As observações devem ter no máximo 5000 caracteres."),
  specialties: z.array(
    z.object({
      value: z
        .string()
        .max(100, "A especialidade deve ter no máximo 100 caracteres."),
    }),
  ),
});

type WorkshopFormValues = z.infer<typeof workshopFormSchema>;

interface WorkshopFormProps {
  mode: "create" | "edit";
  workshop?: WorkshopItem;
}

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeSpecialties(values: WorkshopFormValues["specialties"]) {
  const normalized = values
    .map((item) => item.value.trim())
    .filter(Boolean);

  return normalized.length ? Array.from(new Set(normalized)) : null;
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
        workshop?.specialties?.length
          ? workshop.specialties.map((specialty) => ({ value: specialty }))
          : [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specialties",
  });

  const selectedStatus = useWatch({
    control,
    name: "status",
  });

  useEffect(() => {
    if (!workshop) {
      return;
    }

    reset({
      name: workshop.name,
      cnpj: workshop.cnpj ?? "",
      phone: workshop.phone ?? "",
      email: workshop.email ?? "",
      address: workshop.address ?? "",
      city: workshop.city ?? "",
      state: workshop.state ?? "",
      zip_code: workshop.zip_code ?? "",
      contact_person: workshop.contact_person ?? "",
      contact_phone: workshop.contact_phone ?? "",
      status: workshop.status,
      notes: workshop.notes ?? "",
      specialties:
        workshop.specialties?.length
          ? workshop.specialties.map((specialty) => ({ value: specialty }))
          : [{ value: "" }],
    });
  }, [reset, workshop]);

  async function onSubmit(values: WorkshopFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      cnpj: values.cnpj.trim() ? sanitizeDigits(values.cnpj) : null,
      phone: values.phone.trim() ? sanitizeDigits(values.phone) : null,
      email: values.email.trim() ? values.email.trim().toLowerCase() : null,
      address: values.address.trim() || null,
      city: values.city.trim() || null,
      state: values.state.trim() ? values.state.trim().toUpperCase() : null,
      zip_code: values.zip_code.trim() ? sanitizeDigits(values.zip_code) : null,
      contact_person: values.contact_person.trim() || null,
      contact_phone: values.contact_phone.trim()
        ? sanitizeDigits(values.contact_phone)
        : null,
      status: values.status satisfies WorkshopStatus,
      notes: values.notes.trim() || null,
      specialties: normalizeSpecialties(values.specialties),
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

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nova oficina" : "Editar oficina"}
        </CardTitle>
        <CardDescription>
          Oficinas ficam no painel Gestor e centralizam fornecedores de
          manutenção e serviços veiculares.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Ex.: Oficina Centro Sul" {...register("name")} />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="Ex.: 12345678000190" {...register("cnpj")} />
              {errors.cnpj ? (
                <p className="text-sm text-destructive">{errors.cnpj.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setValue("status", value as WorkshopStatus, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {workshopStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status ? (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone principal</Label>
              <Input id="phone" placeholder="Ex.: 83999998888" {...register("phone")} />
              {errors.phone ? (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Ex.: oficina@empresa.com" {...register("email")} />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contato responsável</Label>
              <Input
                id="contact_person"
                placeholder="Ex.: Maria Pereira"
                {...register("contact_person")}
              />
              {errors.contact_person ? (
                <p className="text-sm text-destructive">
                  {errors.contact_person.message}
                </p>
              ) : null}
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
          </section>

          <section className="grid gap-5 md:grid-cols-[1.4fr_0.8fr_0.6fr]">
            <div className="space-y-2">
              <Label htmlFor="address">Endereco</Label>
              <Input
                id="address"
                placeholder="Ex.: Rua das Oficinas, 120"
                {...register("address")}
              />
              {errors.address ? (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" placeholder="Ex.: Joao Pessoa" {...register("city")} />
              {errors.city ? (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">UF</Label>
              <Input
                id="state"
                maxLength={2}
                placeholder="PB"
                {...register("state")}
                onChange={(event) =>
                  setValue("state", event.target.value.toUpperCase(), {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
              {errors.state ? (
                <p className="text-sm text-destructive">{errors.state.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:max-w-xs">
              <Label htmlFor="zip_code">CEP</Label>
              <Input id="zip_code" placeholder="Ex.: 58000000" {...register("zip_code")} />
              {errors.zip_code ? (
                <p className="text-sm text-destructive">{errors.zip_code.message}</p>
              ) : null}
            </div>
          </section>

          <section className="space-y-4 rounded-[24px] border border-slate-200/70 bg-slate-50 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Especialidades
                </h2>
                <p className="text-sm text-slate-500">
                  Adicione as frentes de serviço que essa oficina atende.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ value: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar especialidade
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Ex.: mecanica, eletrica, funilaria"
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
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      fields.length > 1 ? remove(index) : setValue("specialties.0.value", "")
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Registre combinados, especialidades complementares ou observações operacionais."
              {...register("notes")}
            />
            {errors.notes ? (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            ) : null}
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/workshops" : `/workshops/${workshop?.id}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar oficina" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
