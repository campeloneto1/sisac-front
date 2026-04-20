"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreatePoliceOfficerMutation, useUpdatePoliceOfficerMutation } from "@/hooks/use-police-officer-mutations";
import {
  usePoliceOfficerBanks,
  usePoliceOfficerCities,
  usePoliceOfficerEducationLevels,
  usePoliceOfficerGenders,
  usePoliceOfficerRoles,
} from "@/hooks/use-police-officers";
import type { CreatePoliceOfficerDTO, PoliceOfficerItem, UpdatePoliceOfficerDTO } from "@/types/police-officer.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const policeOfficerFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no máximo 100 caracteres."),
  cpf: z.string().refine((value) => value.replace(/\D/g, "").length === 11, "Informe um CPF com 11 dígitos."),
  email: z.string().email("Informe um email válido."),
  phone: z.string().refine((value) => value.trim() === "" || [10, 11].includes(value.replace(/\D/g, "").length), "Informe um telefone com 10 ou 11 dígitos."),
  password: z.string().optional(),
  role_id: z.string(),
  badge_number: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length <= 10, "O numeral deve ter no máximo 10 dígitos."),
  war_name: z.string().min(2, "O nome de guerra precisa ter ao menos 2 caracteres.").max(50, "O nome de guerra deve ter no máximo 50 caracteres."),
  registration_number: z.string().refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 1 && digits.length <= 8;
  }, "A matrícula deve ter entre 1 e 8 dígitos."),
  cc_registration_number: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length <= 8, "A matrícula CC deve ter no máximo 8 dígitos."),
  phone2: z.string().refine((value) => value.trim() === "" || [10, 11].includes(value.replace(/\D/g, "").length), "Informe um telefone com 10 ou 11 dígitos."),
  birth_date: z.string().optional(),
  street: z.string().max(100, "A rua deve ter no máximo 100 caracteres."),
  number: z.string().max(20, "O número deve ter no máximo 20 caracteres."),
  neighborhood: z.string().max(100, "O bairro deve ter no máximo 100 caracteres."),
  postal_code: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length === 8, "Informe um CEP com 8 dígitos."),
  inclusion_date: z.string().optional(),
  presentation_date: z.string().optional(),
  inclusion_bulletin: z.string().max(50, "O boletim de inclusao deve ter no máximo 50 caracteres."),
  presentation_bulletin: z.string().max(50, "O boletim de apresentacao deve ter no máximo 50 caracteres."),
  transfer_bulletin: z.string().max(50, "O boletim de transferencia deve ter no máximo 50 caracteres."),
  father_name: z.string().max(100, "O nome do pai deve ter no máximo 100 caracteres."),
  mother_name: z.string().max(100, "O nome da mae deve ter no máximo 100 caracteres."),
  agency: z.string().max(20, "A agencia deve ter no máximo 20 caracteres."),
  account: z.string().max(20, "A conta deve ter no máximo 20 caracteres."),
  is_active: z.string(),
  bank_id: z.string(),
  city_id: z.string(),
  gender_id: z.string(),
  education_level_id: z.string(),
});

type PoliceOfficerFormValues = z.infer<typeof policeOfficerFormSchema>;

interface PoliceOfficerFormProps {
  mode: "create" | "edit";
  policeOfficer?: PoliceOfficerItem;
}

export function PoliceOfficerForm({ mode, policeOfficer }: PoliceOfficerFormProps) {
  const router = useRouter();
  const createMutation = useCreatePoliceOfficerMutation();
  const updateMutation = useUpdatePoliceOfficerMutation();
  const banksQuery = usePoliceOfficerBanks();
  const citiesQuery = usePoliceOfficerCities();
  const gendersQuery = usePoliceOfficerGenders();
  const educationLevelsQuery = usePoliceOfficerEducationLevels();
  const rolesQuery = usePoliceOfficerRoles();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<PoliceOfficerFormValues>({
    resolver: zodResolver(policeOfficerFormSchema),
    defaultValues: {
      name: policeOfficer?.name ?? policeOfficer?.user?.name ?? "",
      cpf: policeOfficer?.cpf ?? policeOfficer?.user?.document ?? "",
      email: policeOfficer?.email ?? policeOfficer?.user?.email ?? "",
      phone: policeOfficer?.phone ?? policeOfficer?.user?.phone ?? "",
      password: "",
      role_id: "none",
      badge_number: policeOfficer?.badge_number ?? "",
      war_name: policeOfficer?.war_name ?? "",
      registration_number: policeOfficer?.registration_number ?? "",
      cc_registration_number: policeOfficer?.cc_registration_number ?? "",
      phone2: policeOfficer?.phone2 ?? "",
      birth_date: policeOfficer?.birth_date ?? "",
      street: policeOfficer?.street ?? "",
      number: policeOfficer?.number ?? "",
      neighborhood: policeOfficer?.neighborhood ?? "",
      postal_code: policeOfficer?.postal_code ?? "",
      inclusion_date: policeOfficer?.inclusion_date ?? "",
      presentation_date: policeOfficer?.presentation_date ?? "",
      inclusion_bulletin: policeOfficer?.inclusion_bulletin ?? "",
      presentation_bulletin: policeOfficer?.presentation_bulletin ?? "",
      transfer_bulletin: policeOfficer?.transfer_bulletin ?? "",
      father_name: policeOfficer?.father_name ?? "",
      mother_name: policeOfficer?.mother_name ?? "",
      agency: policeOfficer?.agency ?? "",
      account: policeOfficer?.account ?? "",
      is_active: policeOfficer?.is_active === false ? "false" : "true",
      bank_id: policeOfficer?.bank_id ? String(policeOfficer.bank_id) : "none",
      city_id: policeOfficer?.city_id ? String(policeOfficer.city_id) : "none",
      gender_id: policeOfficer?.gender_id ? String(policeOfficer.gender_id) : "none",
      education_level_id: policeOfficer?.education_level_id ? String(policeOfficer.education_level_id) : "none",
    },
  });

  useEffect(() => {
    if (!policeOfficer) {
      return;
    }

    reset({
      name: policeOfficer.name ?? policeOfficer.user?.name ?? "",
      cpf: policeOfficer.cpf ?? policeOfficer.user?.document ?? "",
      email: policeOfficer.email ?? policeOfficer.user?.email ?? "",
      phone: policeOfficer.phone ?? policeOfficer.user?.phone ?? "",
      password: "",
      role_id: "none",
      badge_number: policeOfficer.badge_number ?? "",
      war_name: policeOfficer.war_name ?? "",
      registration_number: policeOfficer.registration_number ?? "",
      cc_registration_number: policeOfficer.cc_registration_number ?? "",
      phone2: policeOfficer.phone2 ?? "",
      birth_date: policeOfficer.birth_date ?? "",
      street: policeOfficer.street ?? "",
      number: policeOfficer.number ?? "",
      neighborhood: policeOfficer.neighborhood ?? "",
      postal_code: policeOfficer.postal_code ?? "",
      inclusion_date: policeOfficer.inclusion_date ?? "",
      presentation_date: policeOfficer.presentation_date ?? "",
      inclusion_bulletin: policeOfficer.inclusion_bulletin ?? "",
      presentation_bulletin: policeOfficer.presentation_bulletin ?? "",
      transfer_bulletin: policeOfficer.transfer_bulletin ?? "",
      father_name: policeOfficer.father_name ?? "",
      mother_name: policeOfficer.mother_name ?? "",
      agency: policeOfficer.agency ?? "",
      account: policeOfficer.account ?? "",
      is_active: policeOfficer.is_active === false ? "false" : "true",
      bank_id: policeOfficer.bank_id ? String(policeOfficer.bank_id) : "none",
      city_id: policeOfficer.city_id ? String(policeOfficer.city_id) : "none",
      gender_id: policeOfficer.gender_id ? String(policeOfficer.gender_id) : "none",
      education_level_id: policeOfficer.education_level_id ? String(policeOfficer.education_level_id) : "none",
    });
  }, [policeOfficer, reset]);

  async function onSubmit(values: PoliceOfficerFormValues) {
    const payloadBase: CreatePoliceOfficerDTO = {
      name: values.name.trim(),
      cpf: values.cpf.replace(/\D/g, ""),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim() ? values.phone.replace(/\D/g, "") : null,
      password: values.password?.trim() ? values.password : null,
      role_id: values.role_id !== "none" ? Number(values.role_id) : null,
      badge_number: values.badge_number.trim() ? values.badge_number.replace(/\D/g, "") : null,
      war_name: values.war_name.trim(),
      registration_number: values.registration_number.replace(/\D/g, ""),
      cc_registration_number: values.cc_registration_number.trim() ? values.cc_registration_number.replace(/\D/g, "") : null,
      phone2: values.phone2.trim() ? values.phone2.replace(/\D/g, "") : null,
      birth_date: values.birth_date?.trim() ? values.birth_date : null,
      street: values.street.trim() || null,
      number: values.number.trim() || null,
      neighborhood: values.neighborhood.trim() || null,
      postal_code: values.postal_code.trim() ? values.postal_code.replace(/\D/g, "") : null,
      inclusion_date: values.inclusion_date?.trim() ? values.inclusion_date : null,
      presentation_date: values.presentation_date?.trim() ? values.presentation_date : null,
      inclusion_bulletin: values.inclusion_bulletin.trim() || null,
      presentation_bulletin: values.presentation_bulletin.trim() || null,
      transfer_bulletin: values.transfer_bulletin.trim() || null,
      father_name: values.father_name.trim() || null,
      mother_name: values.mother_name.trim() || null,
      agency: values.agency.trim() || null,
      account: values.account.trim() || null,
      is_active: values.is_active === "true",
      bank_id: values.bank_id !== "none" ? Number(values.bank_id) : null,
      city_id: values.city_id !== "none" ? Number(values.city_id) : null,
      gender_id: values.gender_id !== "none" ? Number(values.gender_id) : null,
      education_level_id: values.education_level_id !== "none" ? Number(values.education_level_id) : null,
    };

    if (mode === "create") {
      const createPayload: CreatePoliceOfficerDTO = Object.fromEntries(
        Object.entries(payloadBase).filter(([, value]) => value !== null),
      ) as CreatePoliceOfficerDTO;
      const response = await createMutation.mutateAsync(createPayload);
      router.push(`/police-officers/${response.data.id}`);
      return;
    }

    if (!policeOfficer) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: policeOfficer.id,
      payload: payloadBase as UpdatePoliceOfficerDTO,
    });
    router.push(`/police-officers/${response.data.id}`);
  }

  const selectedRoleId = useWatch({ control, name: "role_id" });
  const selectedBankId = useWatch({ control, name: "bank_id" });
  const selectedCityId = useWatch({ control, name: "city_id" });
  const selectedGenderId = useWatch({ control, name: "gender_id" });
  const selectedEducationLevelId = useWatch({ control, name: "education_level_id" });
  const selectedStatus = useWatch({ control, name: "is_active" });
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo policial" : "Editar policial"}</CardTitle>
        <CardDescription>
          Formulario alinhado com `StorePoliceOfficerRequest` e `UpdatePoliceOfficerRequest`, incluindo dados do usuário vinculado e dados funcionais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Usuário vinculado</h3>
              <p className="text-sm text-slate-500">Informações persistidas no `User` associado ao policial.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input id="name" {...register("name")} />
                {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input id="cpf" placeholder="Somente numeros" {...register("cpf")} />
                {errors.cpf ? <p className="text-sm text-destructive">{errors.cpf.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone principal</Label>
                <Input id="phone" placeholder="Somente numeros" {...register("phone")} />
                {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={selectedRoleId} onValueChange={(value) => setValue("role_id", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem perfil vinculado</SelectItem>
                    {(rolesQuery.data?.data ?? []).map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_id ? <p className="text-sm text-destructive">{errors.role_id.message}</p> : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">{mode === "create" ? "Senha inicial" : "Nova senha"}</Label>
                <Input id="password" type="password" {...register("password")} />
                <p className="text-xs text-slate-500">
                  {mode === "create"
                    ? "Opcional. Se não informar, a API usa o CPF como senha inicial."
                    : "Opcional. Deixe em branco para manter a senha atual."}
                </p>
                {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Identificação funcional</h3>
              <p className="text-sm text-slate-500">Campos principais do registro militar.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="war_name">Nome de guerra *</Label>
                <Input id="war_name" {...register("war_name")} />
                {errors.war_name ? <p className="text-sm text-destructive">{errors.war_name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_number">Matrícula *</Label>
                <Input id="registration_number" {...register("registration_number")} />
                {errors.registration_number ? <p className="text-sm text-destructive">{errors.registration_number.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc_registration_number">Matrícula CC</Label>
                <Input id="cc_registration_number" {...register("cc_registration_number")} />
                {errors.cc_registration_number ? <p className="text-sm text-destructive">{errors.cc_registration_number.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge_number">Numeral</Label>
                <Input id="badge_number" {...register("badge_number")} />
                {errors.badge_number ? <p className="text-sm text-destructive">{errors.badge_number.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone2">Telefone secundario</Label>
                <Input id="phone2" {...register("phone2")} />
                {errors.phone2 ? <p className="text-sm text-destructive">{errors.phone2.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => setValue("is_active", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Dados pessoais e endereco</h3>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Nascimento</Label>
                <Input id="birth_date" type="date" {...register("birth_date")} />
                {errors.birth_date ? <p className="text-sm text-destructive">{errors.birth_date.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">CEP</Label>
                <Input id="postal_code" {...register("postal_code")} />
                {errors.postal_code ? <p className="text-sm text-destructive">{errors.postal_code.message}</p> : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Rua</Label>
                <Input id="street" {...register("street")} />
                {errors.street ? <p className="text-sm text-destructive">{errors.street.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input id="number" {...register("number")} />
                {errors.number ? <p className="text-sm text-destructive">{errors.number.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" {...register("neighborhood")} />
                {errors.neighborhood ? <p className="text-sm text-destructive">{errors.neighborhood.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="father_name">Nome do pai</Label>
                <Input id="father_name" {...register("father_name")} />
                {errors.father_name ? <p className="text-sm text-destructive">{errors.father_name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mother_name">Nome da mae</Label>
                <Input id="mother_name" {...register("mother_name")} />
                {errors.mother_name ? <p className="text-sm text-destructive">{errors.mother_name.message}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Vínculos e dados bancarios</h3>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Banco</Label>
                <Select value={selectedBankId} onValueChange={(value) => setValue("bank_id", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um banco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem banco vinculado</SelectItem>
                    {(banksQuery.data?.data ?? []).map((bank) => (
                      <SelectItem key={bank.id} value={String(bank.id)}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gênero</Label>
                <Select value={selectedGenderId} onValueChange={(value) => setValue("gender_id", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem gênero vinculado</SelectItem>
                    {(gendersQuery.data?.data ?? []).map((gender) => (
                      <SelectItem key={gender.id} value={String(gender.id)}>
                        {gender.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Escolaridade</Label>
                <Select
                  value={selectedEducationLevelId}
                  onValueChange={(value) => setValue("education_level_id", value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem escolaridade vinculada</SelectItem>
                    {(educationLevelsQuery.data?.data ?? []).map((educationLevel) => (
                      <SelectItem key={educationLevel.id} value={String(educationLevel.id)}>
                        {educationLevel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agency">Agencia</Label>
                <Input id="agency" {...register("agency")} />
                {errors.agency ? <p className="text-sm text-destructive">{errors.agency.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Conta</Label>
                <Input id="account" {...register("account")} />
                {errors.account ? <p className="text-sm text-destructive">{errors.account.message}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Datas e boletins</h3>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inclusion_date">Data de inclusao</Label>
                <Input id="inclusion_date" type="date" {...register("inclusion_date")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation_date">Data de apresentacao</Label>
                <Input id="presentation_date" type="date" {...register("presentation_date")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inclusion_bulletin">Boletim de inclusao</Label>
                <Input id="inclusion_bulletin" {...register("inclusion_bulletin")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation_bulletin">Boletim de apresentacao</Label>
                <Input id="presentation_bulletin" {...register("presentation_bulletin")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="transfer_bulletin">Boletim de transferencia</Label>
                <Input id="transfer_bulletin" {...register("transfer_bulletin")} />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/police-officers" : `/police-officers/${policeOfficer?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar policial" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
