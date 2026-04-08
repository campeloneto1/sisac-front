"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";

import { useCreateContractRoleMutation, useDeleteContractRoleMutation, useUpdateContractRoleMutation } from "@/hooks/use-contract-role-mutations";
import { useContractRoles } from "@/hooks/use-contract-roles";
import { usePermissions } from "@/hooks/use-permissions";
import { formatPoliceOfficerOptionLabel } from "@/lib/option-labels";
import { policeOfficersService } from "@/services/police-officers/service";
import type { ContractRoleItem, CreateContractRoleDTO, UpdateContractRoleDTO } from "@/types/contract-role.type";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { contractRoleOptions, getContractRoleLabel } from "@/types/contract-role.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractSubpageShell } from "@/components/contracts/subpage-shell";

const roleSchema = z.object({
  police_officer_id: z.string(),
  role: z.string().min(1, "Selecione o papel."),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.string(),
}).refine((values) => !values.start_date || !values.end_date || values.end_date >= values.start_date, {
  message: "A data final precisa ser posterior a data inicial.",
  path: ["end_date"],
});

type RoleFormValues = z.infer<typeof roleSchema>;

function formatDate(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR") : "Não informado";
}

function getPoliceOfficerLabel(role: ContractRoleItem) {
  const policeOfficer = role.police_officer;

  if (!policeOfficer) {
    return "Não vinculado";
  }

  return policeOfficer.registration_number
    ? `${policeOfficer.war_name ?? policeOfficer.user?.name ?? "Policial"} (${policeOfficer.registration_number})`
    : policeOfficer.war_name ?? policeOfficer.user?.name ?? "Policial";
}

function RoleDialog({
  open,
  onOpenChange,
  contractId,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  role?: ContractRoleItem | null;
}) {
  const createMutation = useCreateContractRoleMutation(contractId);
  const updateMutation = useUpdateContractRoleMutation(contractId);
  const { handleSubmit, register, reset, setValue, control, formState: { errors } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      police_officer_id: role?.police_officer_id ? String(role.police_officer_id) : "none",
      role: role?.role ?? "manager",
      start_date: role?.start_date ?? "",
      end_date: role?.end_date ?? "",
      is_active: role?.is_active ? "true" : "false",
    },
  });

  useEffect(() => {
    reset({
      police_officer_id: role?.police_officer_id ? String(role.police_officer_id) : "none",
      role: role?.role ?? "manager",
      start_date: role?.start_date ?? "",
      end_date: role?.end_date ?? "",
      is_active: role?.is_active ? "true" : "false",
    });
  }, [open, reset, role]);

  const selectedPoliceOfficerId = useWatch({ control, name: "police_officer_id" });
  const selectedRole = useWatch({ control, name: "role" });
  const selectedStatus = useWatch({ control, name: "is_active" });
  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedPoliceOfficer = role?.police_officer
    ? {
        value: String(role.police_officer.id),
        label: formatPoliceOfficerOptionLabel({
          ...role.police_officer,
          id: role.police_officer.id,
        }),
      }
    : null;

  async function onSubmit(values: RoleFormValues) {
    const payloadBase = {
      contract_id: Number(contractId),
      police_officer_id: values.police_officer_id !== "none" ? Number(values.police_officer_id) : null,
      role: values.role,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      is_active: values.is_active === "true",
    };

    if (role) {
      await updateMutation.mutateAsync({ id: role.id, payload: payloadBase satisfies UpdateContractRoleDTO });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreateContractRoleDTO);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? "Editar papel do contrato" : "Novo papel do contrato"}</DialogTitle>
          <DialogDescription>
            Registre quem responde pelo contrato e o intervalo de vigência operacional desse papel.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Policial</Label>
            <AsyncSearchableSelect
              value={selectedPoliceOfficerId === "none" ? undefined : selectedPoliceOfficerId}
              onValueChange={(value) => setValue("police_officer_id", value, { shouldValidate: true })}
              queryKey={["contract-roles", "police-officers"]}
              loadPage={({ page, search }) =>
                policeOfficersService.index({
                  page,
                  per_page: 20,
                  is_active: true,
                  search: search || undefined,
                })
              }
              mapOption={(policeOfficer) => ({
                value: String(policeOfficer.id),
                label: formatPoliceOfficerOptionLabel(policeOfficer),
              })}
              selectedOption={selectedPoliceOfficer}
              placeholder="Não vinculado"
              searchPlaceholder="Buscar policial por nome ou matrícula"
              emptyMessage="Nenhum policial encontrado."
            />
            <p className="text-xs text-slate-500">
              {selectedPoliceOfficer ? `Selecionado: ${selectedPoliceOfficer.label}.` : "Opcional, conforme retorno da API."}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Papel</Label>
              <Select value={selectedRole} onValueChange={(value) => setValue("role", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  {contractRoleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role ? <p className="text-sm text-destructive">{errors.role.message}</p> : null}
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

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-role-start-date">Início</Label>
              <Input id="contract-role-start-date" type="date" {...register("start_date")} />
              {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-role-end-date">Fim</Label>
              <Input id="contract-role-end-date" type="date" {...register("end_date")} />
              {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : role ? "Salvar papel" : "Criar papel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContractRolesPage() {
  const { id } = useParams<{ id: string }>();
  const permissions = usePermissions("contract-roles");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingRole, setEditingRole] = useState<ContractRoleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<ContractRoleItem | null>(null);
  const deleteMutation = useDeleteContractRoleMutation(id);

  const filters = useMemo(
    () => ({
      page,
      per_page: 10,
      search: search || undefined,
      role: roleFilter !== "all" ? roleFilter : undefined,
      is_active: statusFilter === "all" ? undefined : statusFilter === "true",
    }),
    [page, roleFilter, search, statusFilter],
  );

  const rolesQuery = useContractRoles(id, filters, permissions.canViewAny);

  async function handleDelete() {
    if (!roleToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(roleToDelete.id);
    setRoleToDelete(null);
  }

  return (
    <ContractSubpageShell
      title="Papeis do contrato"
      description="Gerencie gestor, fiscal e demais responsáveis com histórico de vigência."
      canView={permissions.canViewAny}
      permissionDeniedTitle="Acesso negado"
      permissionDeniedDescription="Você precisa da permissão `viewAny` para visualizar os papeis do contrato."
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Histórico de papeis</CardTitle>
            <CardDescription>Use filtros para localizar rapidamente o responsável atual ou papeis encerrados.</CardDescription>
          </div>
          {permissions.canCreate ? (
            <Button onClick={() => { setEditingRole(null); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo papel
            </Button>
          ) : null}
        </CardHeader>
      </Card>

      <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contract-role-search">Busca</Label>
          <Input id="contract-role-search" placeholder="Busque por policial ou matrícula" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        <div className="space-y-2">
          <Label>Papel</Label>
          <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os papeis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {contractRoleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {rolesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : rolesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar papeis</CardTitle>
            <CardDescription>Verifique se a API dos papeis do contrato já esta publicada.</CardDescription>
          </CardHeader>
        </Card>
      ) : !rolesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum papel encontrado</CardTitle>
            <CardDescription>Cadastre o gestor, fiscal e demais responsáveis operacionais deste contrato.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Responsável</th>
                    <th className="px-4 py-3 font-medium">Papel</th>
                    <th className="px-4 py-3 font-medium">Vigência</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rolesQuery.data.data.map((role) => (
                    <tr key={role.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{getPoliceOfficerLabel(role)}</p>
                          <p className="mt-1 text-xs text-slate-500">ID interno #{role.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          <span>{getContractRoleLabel(role.role)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(role.start_date)} ate {formatDate(role.end_date)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={role.is_active ? "success" : "outline"}>{role.is_active ? "Ativo" : "Inativo"}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {permissions.canUpdate ? (
                            <Button size="icon" variant="outline" onClick={() => { setEditingRole(role); setIsDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {permissions.canDelete ? (
                            <Button size="icon" variant="outline" onClick={() => setRoleToDelete(role)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={rolesQuery.data.meta.current_page}
            lastPage={rolesQuery.data.meta.last_page}
            total={rolesQuery.data.meta.total}
            from={rolesQuery.data.meta.from}
            to={rolesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={rolesQuery.isFetching}
          />
        </div>
      )}

      <RoleDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} contractId={id} role={editingRole} />

      <Dialog open={Boolean(roleToDelete)} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir papel do contrato</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o papel {roleToDelete ? `de ${getPoliceOfficerLabel(roleToDelete)}` : "selecionado"}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setRoleToDelete(null)}>Cancelar</Button>
            <Button type="button" variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContractSubpageShell>
  );
}
