"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateCompanyMutation, useUpdateCompanyMutation } from "@/hooks/use-company-mutations";
import { useCities } from "@/hooks/use-cities";
import { useSubunits } from "@/hooks/use-subunits";
import type { CreateCompanyDTO, CompanyItem, UpdateCompanyDTO } from "@/types/company.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const companyFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no maximo 100 caracteres."),
  trade_name: z.string().max(100, "O nome fantasia deve ter no maximo 100 caracteres."),
  cnpj: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length === 14, "Informe um CNPJ com 14 digitos."),
  manager_name: z.string().max(100, "O nome do gerente deve ter no maximo 100 caracteres."),
  phone: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10, "Informe um telefone com 10 ou 11 digitos."),
  phone2: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10, "Informe um telefone com 10 ou 11 digitos."),
  email: z.string().refine((value) => value.trim() === "" || z.email().safeParse(value.trim()).success, "Informe um email valido."),
  street: z.string().max(100, "A rua deve ter no maximo 100 caracteres."),
  number: z.string().max(20, "O numero deve ter no maximo 20 caracteres."),
  neighborhood: z.string().max(100, "O bairro deve ter no maximo 100 caracteres."),
  postal_code: z.string().refine((value) => value.trim() === "" || value.replace(/\D/g, "").length === 8, "Informe um CEP com 8 digitos."),
  city_id: z.string(),
  subunit_id: z.string(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface CompanyFormProps {
  mode: "create" | "edit";
  company?: CompanyItem;
}

export function CompanyForm({ mode, company }: CompanyFormProps) {
  const router = useRouter();
  const createMutation = useCreateCompanyMutation();
  const updateMutation = useUpdateCompanyMutation();
  const citiesQuery = useCities({});
  const subunitsQuery = useSubunits({});
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name ?? "",
      trade_name: company?.trade_name ?? "",
      cnpj: company?.cnpj ?? "",
      manager_name: company?.manager_name ?? "",
      phone: company?.phone ?? "",
      phone2: company?.phone2 ?? "",
      email: company?.email ?? "",
      street: company?.street ?? "",
      number: company?.number ?? "",
      neighborhood: company?.neighborhood ?? "",
      postal_code: company?.postal_code ?? "",
      city_id: company?.city_id ? String(company.city_id) : "none",
      subunit_id: company?.subunit_id ? String(company.subunit_id) : "none",
    },
  });

  useEffect(() => {
    if (!company) {
      return;
    }

    reset({
      name: company.name,
      trade_name: company.trade_name ?? "",
      cnpj: company.cnpj ?? "",
      manager_name: company.manager_name ?? "",
      phone: company.phone ?? "",
      phone2: company.phone2 ?? "",
      email: company.email ?? "",
      street: company.street ?? "",
      number: company.number ?? "",
      neighborhood: company.neighborhood ?? "",
      postal_code: company.postal_code ?? "",
      city_id: company.city_id ? String(company.city_id) : "none",
      subunit_id: company.subunit_id ? String(company.subunit_id) : "none",
    });
  }, [reset, company]);

  async function onSubmit(values: CompanyFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      trade_name: values.trade_name.trim() || undefined,
      cnpj: values.cnpj.trim() ? values.cnpj.replace(/\D/g, "") : undefined,
      manager_name: values.manager_name.trim() || undefined,
      phone: values.phone.trim() ? values.phone.replace(/\D/g, "") : undefined,
      phone2: values.phone2.trim() ? values.phone2.replace(/\D/g, "") : undefined,
      email: values.email.trim() ? values.email.trim().toLowerCase() : undefined,
      street: values.street.trim() || undefined,
      number: values.number.trim() || undefined,
      neighborhood: values.neighborhood.trim() || undefined,
      postal_code: values.postal_code.trim() ? values.postal_code.replace(/\D/g, "") : undefined,
      city_id: values.city_id !== "none" ? Number(values.city_id) : undefined,
      subunit_id: values.subunit_id !== "none" ? Number(values.subunit_id) : undefined,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateCompanyDTO);
      router.push(`/companies/${response.data.id}`);
      return;
    }

    if (!company) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: company.id,
      payload: payloadBase satisfies UpdateCompanyDTO,
    });
    router.push(`/companies/${response.data.id}`);
  }

  const selectedCityId = useWatch({ control, name: "city_id" });
  const selectedSubunitId = useWatch({ control, name: "subunit_id" });
  const selectedCity = (citiesQuery.data?.data ?? []).find((city) => String(city.id) === selectedCityId);
  const selectedSubunit = (subunitsQuery.data?.data ?? []).find((subunit) => String(subunit.id) === selectedSubunitId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova empresa" : "Editar empresa"}</CardTitle>
        <CardDescription>
          Empresas ficam dentro do painel Gestor e representam as organizacoes cadastradas no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Empresa ABC Ltda" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade_name">Nome fantasia</Label>
            <Input id="trade_name" placeholder="Ex.: ABC Comercio" {...register("trade_name")} />
            {errors.trade_name ? <p className="text-sm text-destructive">{errors.trade_name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="Ex.: 12345678000190" {...register("cnpj")} />
            {errors.cnpj ? <p className="text-sm text-destructive">{errors.cnpj.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager_name">Nome do gerente</Label>
            <Input id="manager_name" placeholder="Ex.: Joao Silva" {...register("manager_name")} />
            {errors.manager_name ? <p className="text-sm text-destructive">{errors.manager_name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="Ex.: 83999998888" {...register("phone")} />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone2">Telefone 2</Label>
            <Input id="phone2" placeholder="Ex.: 83988887777" {...register("phone2")} />
            {errors.phone2 ? <p className="text-sm text-destructive">{errors.phone2.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="Ex.: contato@empresa.com" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Rua</Label>
            <Input id="street" placeholder="Ex.: Rua Principal" {...register("street")} />
            {errors.street ? <p className="text-sm text-destructive">{errors.street.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Numero</Label>
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
            <Label>Subunidade</Label>
            <Select value={selectedSubunitId} onValueChange={(value) => setValue("subunit_id", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma subunidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem subunidade vinculada</SelectItem>
                {(subunitsQuery.data?.data ?? []).map((subunit) => (
                  <SelectItem key={subunit.id} value={String(subunit.id)}>
                    {subunit.name} • {subunit.abbreviation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {selectedSubunit ? `Subunidade selecionada: ${selectedSubunit.name} (${selectedSubunit.abbreviation}).` : "Opcional. Vincula a empresa a uma subunidade."}
            </p>
            {errors.subunit_id ? <p className="text-sm text-destructive">{errors.subunit_id.message}</p> : null}
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
              {selectedCity ? `Cidade selecionada: ${selectedCity.name} (${selectedCity.abbreviation}).` : "Opcional. Cidade onde a empresa esta localizada."}
            </p>
            {errors.city_id ? <p className="text-sm text-destructive">{errors.city_id.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/companies" : `/companies/${company?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar empresa" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
