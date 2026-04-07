"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSubunit } from "@/contexts/subunit-context";
import { useCreateContractMutation, useUpdateContractMutation } from "@/hooks/use-contract-mutations";
import {
  useContractCompanies,
  useContractObjectsOptions,
  useContracts,
  useContractTypesOptions,
} from "@/hooks/use-contracts";
import type { ContractItem, CreateContractDTO, UpdateContractDTO } from "@/types/contract.type";
import { contractStatusOptions, getContractStatusLabel } from "@/types/contract.type";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const contractFormSchema = z
  .object({
    company_id: z.string().min(1, "Selecione uma empresa."),
    contract_type_id: z.string(),
    contract_object_id: z.string(),
    renewed_from_contract_id: z.string(),
    contract_number: z.string().min(2, "Informe o numero do contrato.").max(50, "O numero do contrato deve ter no maximo 50 caracteres."),
    sacc_number: z.string().min(2, "Informe o numero SACC.").max(50, "O numero SACC deve ter no maximo 50 caracteres."),
    total_value: z.coerce.number().min(0, "O valor total nao pode ser negativo."),
    start_date: z.string().min(1, "Informe a data inicial."),
    end_date: z.string().min(1, "Informe a data final."),
    status: z.string().min(1, "Selecione um status."),
    is_extendable: z.boolean(),
    is_active: z.boolean(),
    notes: z.string().max(5000, "As observacoes devem ter no maximo 5000 caracteres."),
  })
  .refine((values) => values.end_date >= values.start_date, {
    message: "A data final precisa ser posterior a data inicial.",
    path: ["end_date"],
  });

type ContractFormValues = z.infer<typeof contractFormSchema>;

interface ContractFormProps {
  mode: "create" | "edit";
  contract?: ContractItem;
}

function formatCurrencyPreview(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ContractForm({ mode, contract }: ContractFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreateContractMutation();
  const updateMutation = useUpdateContractMutation();
  const companiesQuery = useContractCompanies(Boolean(activeSubunit));
  const contractTypesQuery = useContractTypesOptions(Boolean(activeSubunit));
  const contractObjectsQuery = useContractObjectsOptions(Boolean(activeSubunit));
  const renewalContractsQuery = useContracts({ per_page: 100 }, Boolean(activeSubunit));
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      company_id: contract?.company_id ? String(contract.company_id) : "",
      contract_type_id: contract?.contract_type_id ? String(contract.contract_type_id) : "none",
      contract_object_id: contract?.contract_object_id ? String(contract.contract_object_id) : "none",
      renewed_from_contract_id: contract?.renewed_from_contract_id ? String(contract.renewed_from_contract_id) : "none",
      contract_number: contract?.contract_number ?? "",
      sacc_number: contract?.sacc_number ?? "",
      total_value: contract?.total_value ? Number(contract.total_value) : 0,
      start_date: contract?.start_date ?? "",
      end_date: contract?.end_date ?? "",
      status: contract?.status ?? "active",
      is_extendable: contract?.is_extendable ?? false,
      is_active: contract?.is_active ?? true,
      notes: contract?.notes ?? "",
    },
  });

  useEffect(() => {
    if (!contract) {
      return;
    }

    reset({
      company_id: String(contract.company_id),
      contract_type_id: contract.contract_type_id ? String(contract.contract_type_id) : "none",
      contract_object_id: contract.contract_object_id ? String(contract.contract_object_id) : "none",
      renewed_from_contract_id: contract.renewed_from_contract_id ? String(contract.renewed_from_contract_id) : "none",
      contract_number: contract.contract_number,
      sacc_number: contract.sacc_number,
      total_value: Number(contract.total_value),
      start_date: contract.start_date,
      end_date: contract.end_date,
      status: contract.status,
      is_extendable: contract.is_extendable,
      is_active: contract.is_active,
      notes: contract.notes ?? "",
    });
  }, [contract, reset]);

  async function onSubmit(values: ContractFormValues) {
    if (!activeSubunit) {
      return;
    }

    const payloadBase = {
      subunit_id: Number(activeSubunit.id),
      company_id: Number(values.company_id),
      contract_type_id: values.contract_type_id !== "none" ? Number(values.contract_type_id) : null,
      contract_object_id: values.contract_object_id !== "none" ? Number(values.contract_object_id) : null,
      renewed_from_contract_id: values.renewed_from_contract_id !== "none" ? Number(values.renewed_from_contract_id) : null,
      contract_number: values.contract_number.trim(),
      sacc_number: values.sacc_number.trim(),
      total_value: Number(values.total_value),
      start_date: values.start_date,
      end_date: values.end_date,
      status: values.status as CreateContractDTO["status"],
      is_extendable: values.is_extendable,
      is_active: values.is_active,
      notes: values.notes.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateContractDTO);
      router.push(`/contracts/${response.data.id}`);
      return;
    }

    if (!contract) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: contract.id,
      payload: payloadBase satisfies UpdateContractDTO,
    });
    router.push(`/contracts/${response.data.id}`);
  }

  const selectedCompanyId = useWatch({ control, name: "company_id" });
  const selectedContractTypeId = useWatch({ control, name: "contract_type_id" });
  const selectedContractObjectId = useWatch({ control, name: "contract_object_id" });
  const selectedRenewedFromContractId = useWatch({ control, name: "renewed_from_contract_id" });
  const selectedStatus = useWatch({ control, name: "status" });
  const selectedTotalValue = useWatch({ control, name: "total_value" });
  const isExtendable = useWatch({ control, name: "is_extendable" });
  const isActive = useWatch({ control, name: "is_active" });

  const selectedCompany = (companiesQuery.data?.data ?? []).find((company) => String(company.id) === selectedCompanyId);
  const selectedContractType = (contractTypesQuery.data?.data ?? []).find((item) => String(item.id) === selectedContractTypeId);
  const selectedContractObject = (contractObjectsQuery.data?.data ?? []).find((item) => String(item.id) === selectedContractObjectId);
  const selectedRenewedFromContract = (renewalContractsQuery.data?.data ?? []).find((item) => String(item.id) === selectedRenewedFromContractId);
  const renewalOptions = (renewalContractsQuery.data?.data ?? []).filter((item) => item.id !== contract?.id);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo contrato" : "Editar contrato"}</CardTitle>
        <CardDescription>
          Cadastre o contrato principal da subunidade ativa com empresa, tipo, objeto, vigencia, situacao operacional e observacoes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Subunidade ativa: <span className="font-medium text-slate-900">{activeSubunit?.name ?? "Nao selecionada"}</span>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract_number">Numero do contrato</Label>
              <Input id="contract_number" placeholder="Ex.: CTR-2026-001" {...register("contract_number")} />
              {errors.contract_number ? <p className="text-sm text-destructive">{errors.contract_number.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sacc_number">Numero SACC</Label>
              <Input id="sacc_number" placeholder="Ex.: SACC-2026-0001" {...register("sacc_number")} />
              {errors.sacc_number ? <p className="text-sm text-destructive">{errors.sacc_number.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={selectedCompanyId} onValueChange={(value) => setValue("company_id", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {(companiesQuery.data?.data ?? []).map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {selectedCompany ? `Empresa selecionada: ${selectedCompany.name}.` : "A empresa e carregada no contexto da subunidade ativa."}
              </p>
              {errors.company_id ? <p className="text-sm text-destructive">{errors.company_id.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_value">Valor total</Label>
              <Input id="total_value" step="0.01" type="number" placeholder="0,00" {...register("total_value", { valueAsNumber: true })} />
              <p className="text-xs text-slate-500">Preview: {formatCurrencyPreview(Number.isFinite(selectedTotalValue) ? selectedTotalValue : 0)}</p>
              {errors.total_value ? <p className="text-sm text-destructive">{errors.total_value.message}</p> : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de contrato</Label>
              <Select value={selectedContractTypeId} onValueChange={(value) => setValue("contract_type_id", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem tipo vinculado</SelectItem>
                  {(contractTypesQuery.data?.data ?? []).map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">{selectedContractType ? `Tipo selecionado: ${selectedContractType.name}.` : "Opcional."}</p>
              {errors.contract_type_id ? <p className="text-sm text-destructive">{errors.contract_type_id.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Objeto de contrato</Label>
              <Select value={selectedContractObjectId} onValueChange={(value) => setValue("contract_object_id", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um objeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem objeto vinculado</SelectItem>
                  {(contractObjectsQuery.data?.data ?? []).map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">{selectedContractObject ? `Objeto selecionado: ${selectedContractObject.name}.` : "Opcional."}</p>
              {errors.contract_object_id ? <p className="text-sm text-destructive">{errors.contract_object_id.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Renovado a partir de</Label>
              <Select
                value={selectedRenewedFromContractId}
                onValueChange={(value) => setValue("renewed_from_contract_id", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um contrato anterior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nao se aplica</SelectItem>
                  {renewalOptions.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.contract_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {selectedRenewedFromContract ? `Contrato de origem: ${selectedRenewedFromContract.contract_number}.` : "Use quando este contrato for uma renovacao de outro."}
              </p>
              {errors.renewed_from_contract_id ? <p className="text-sm text-destructive">{errors.renewed_from_contract_id.message}</p> : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data inicial</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
              {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data final</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
              {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setValue("status", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {contractStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Status atual: {getContractStatusLabel(selectedStatus)}</p>
              {errors.status ? <p className="text-sm text-destructive">{errors.status.message}</p> : null}
            </div>

            <div className="grid gap-4 pt-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Checkbox checked={isExtendable} onCheckedChange={(checked) => setValue("is_extendable", Boolean(checked), { shouldDirty: true })} />
                <div>
                  <p className="text-sm font-medium text-slate-900">Contrato prorrogavel</p>
                  <p className="text-xs text-slate-500">Indica se o contrato admite prorrogacoes futuras.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Checkbox checked={isActive} onCheckedChange={(checked) => setValue("is_active", Boolean(checked), { shouldDirty: true })} />
                <div>
                  <p className="text-sm font-medium text-slate-900">Contrato ativo no sistema</p>
                  <p className="text-xs text-slate-500">Permite distinguir registros inativos mesmo antes do encerramento formal.</p>
                </div>
              </label>
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              rows={6}
              placeholder="Descreva clausulas relevantes, contexto operacional ou observacoes administrativas."
              {...register("notes")}
            />
            {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
          </section>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
            Alertas, papeis, transacoes, aditivos e prorrogacoes ja aparecem no detalhe quando existirem. Podemos evoluir depois para edicao dedicada desses submodulos.
          </div>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/contracts" : `/contracts/${contract?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar contrato" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
