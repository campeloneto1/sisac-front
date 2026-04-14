"use client";

import Link from "next/link";
import { Search, ArrowLeft, CarFront, Wrench, Building2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { useCompanies } from "@/hooks/use-companies";
import { usePermissions } from "@/hooks/use-permissions";
import { useUsers } from "@/hooks/use-users";
import { useVariants } from "@/hooks/use-variants";
import { useVehicles } from "@/hooks/use-vehicles";
import { useVehicleTypes } from "@/hooks/use-vehicle-types";
import { useWorkshops } from "@/hooks/use-workshops";
import { hasPermission } from "@/lib/permissions";
import {
  vehicleDamageDetectionMomentOptions,
  vehicleDamageSeverityOptions,
  vehicleDamageStatusOptions,
  vehicleDamageTypeOptions,
} from "@/types/vehicle-damage.type";
import { vehicleFuelTypeOptions } from "@/types/vehicle-fueling.type";
import { vehicleLoanStatusOptions } from "@/types/vehicle-loan.type";
import {
  vehicleMaintenanceStatusOptions,
  vehicleMaintenanceTypeOptions,
} from "@/types/vehicle-maintenance.type";
import { vehicleOwnershipTypeOptions, vehicleOperationalStatusOptions } from "@/types/vehicle.type";
import { vehicleRentalStatusOptions } from "@/types/vehicle-rental.type";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return value.slice(0, 10);
}

export function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

export function formatNumber(value?: number | null, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(value ?? 0);
}

export function formatVehicleLabel(
  vehicle?: {
    license_plate?: string | null;
    vehicle_type?: { name?: string | null } | string | null;
    variant?: { name?: string | null } | string | null;
  } | null,
) {
  if (!vehicle) {
    return "Sem veículo";
  }

  const vehicleType =
    typeof vehicle.vehicle_type === "string"
      ? vehicle.vehicle_type
      : vehicle.vehicle_type?.name;
  const variant =
    typeof vehicle.variant === "string" ? vehicle.variant : vehicle.variant?.name;

  return [vehicle.license_plate, vehicleType, variant].filter(Boolean).join(" • ");
}

export function VehicleReportsGuard({
  requireView = false,
  children,
}: {
  requireView?: boolean;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("vehicles");

  if (!hasPermission(user, "reports") || !(requireView ? permissions.canView : permissions.canViewAny)) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa do slug `reports` e da permissão `vehicles.{requireView ? "view" : "viewAny"}` para acessar este relatório.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>
            Os relatórios de veículos dependem da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <>{children}</>;
}

export function useVehicleReportsAccess(requireView = false) {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("vehicles");

  return {
    hasReportsSlug: hasPermission(user, "reports"),
    canViewAny: permissions.canViewAny,
    canView: permissions.canView,
    hasActiveSubunit: Boolean(activeSubunit),
    enabled: hasPermission(user, "reports") && (requireView ? permissions.canView : permissions.canViewAny) && Boolean(activeSubunit),
  };
}

export function VehicleReportShell({
  title,
  description,
  href = "/vehicle-reports",
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6">
        <Button asChild variant="ghost" className="w-fit px-2">
          <Link href={href}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Relatórios
          </Link>
        </Button>
        <div className="mt-3 flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export function LoadingCardList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-32 rounded-[24px]" />
      ))}
    </div>
  );
}

export function ErrorCard({ text }: { text: string }) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>Erro ao carregar</CardTitle>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function EmptyCard({ text }: { text: string }) {
  return (
    <Card className="border-dashed border-slate-200/70 bg-white/70">
      <CardHeader>
        <CardTitle>Nenhum registro</CardTitle>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function TableWrap({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Pager({
  data,
  onPageChange,
  disabled,
}: {
  data: {
    meta: {
      current_page: number;
      last_page: number;
      total: number;
      from: number | null;
      to: number | null;
    };
  };
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  return (
    <Pagination
      currentPage={data.meta.current_page}
      lastPage={data.meta.last_page}
      total={data.meta.total}
      from={data.meta.from}
      to={data.meta.to}
      onPageChange={onPageChange}
      isDisabled={disabled}
    />
  );
}

export function SearchField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative md:col-span-2 xl:col-span-6">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        className="pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

export function FiltersGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-6">
      {children}
    </div>
  );
}

function GenericSelect({
  value,
  placeholder,
  allLabel,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  allLabel: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function VehicleSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const vehiclesQuery = useVehicles({ per_page: 100 }, { enabled: true });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Veículo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os veículos</SelectItem>
        {(vehiclesQuery.data?.data ?? []).map((vehicle) => (
          <SelectItem key={vehicle.id} value={String(vehicle.id)}>
            {vehicle.license_plate}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function VehicleTypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const vehicleTypesQuery = useVehicleTypes({ per_page: 100 });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os tipos</SelectItem>
        {(vehicleTypesQuery.data?.data ?? []).map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function VariantSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const variantsQuery = useVariants({ per_page: 100 });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Variante" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as variantes</SelectItem>
        {(variantsQuery.data?.data ?? []).map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function WorkshopSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const workshopsQuery = useWorkshops({ per_page: 100 });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Oficina" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as oficinas</SelectItem>
        {(workshopsQuery.data?.data ?? []).map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CompanySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const companiesQuery = useCompanies({ per_page: 100 });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Empresa" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as empresas</SelectItem>
        {(companiesQuery.data?.data ?? []).map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {item.trade_name ?? item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AssignedUserSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const usersQuery = useUsers({ per_page: 100 });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Responsável" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os responsáveis</SelectItem>
        {(usersQuery.data?.data ?? []).map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OperationalStatusSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Status operacional"
      allLabel="Todos os status"
      options={vehicleOperationalStatusOptions}
      onChange={props.onChange}
    />
  );
}

export function OwnershipTypeSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Posse"
      allLabel="Todas as posses"
      options={vehicleOwnershipTypeOptions}
      onChange={props.onChange}
    />
  );
}

export function LoanStatusSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Status do empréstimo"
      allLabel="Todos os status"
      options={vehicleLoanStatusOptions}
      onChange={props.onChange}
    />
  );
}

export function MaintenanceStatusSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Status da manutenção"
      allLabel="Todos os status"
      options={vehicleMaintenanceStatusOptions}
      onChange={props.onChange}
    />
  );
}

export function MaintenanceTypeSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Tipo de manutenção"
      allLabel="Todos os tipos"
      options={vehicleMaintenanceTypeOptions}
      onChange={props.onChange}
    />
  );
}

export function FuelTypeSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Combustível"
      allLabel="Todos os combustíveis"
      options={vehicleFuelTypeOptions}
      onChange={props.onChange}
    />
  );
}

export function DamageStatusSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Status da avaria"
      allLabel="Todos os status"
      options={vehicleDamageStatusOptions}
      onChange={props.onChange}
    />
  );
}

export function DamageSeveritySelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Gravidade"
      allLabel="Todas as gravidades"
      options={vehicleDamageSeverityOptions}
      onChange={props.onChange}
    />
  );
}

export function DamageTypeSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Tipo de avaria"
      allLabel="Todos os tipos"
      options={vehicleDamageTypeOptions}
      onChange={props.onChange}
    />
  );
}

export function DetectionMomentSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Momento da detecção"
      allLabel="Todos os momentos"
      options={vehicleDamageDetectionMomentOptions}
      onChange={props.onChange}
    />
  );
}

export function RentalStatusSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GenericSelect
      value={props.value}
      placeholder="Status da locação"
      allLabel="Todos os status"
      options={vehicleRentalStatusOptions}
      onChange={props.onChange}
    />
  );
}

export function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onClick}>
      Limpar
    </Button>
  );
}

export function VehicleStateBadge({
  label,
  variant,
}: {
  label: string;
  variant: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info";
}) {
  return <Badge variant={variant}>{label}</Badge>;
}

export function VehicleMiniStat({
  icon,
  label,
  value,
}: {
  icon: "vehicle" | "maintenance" | "company";
  label: string;
  value: string;
}) {
  const Icon = icon === "vehicle" ? CarFront : icon === "maintenance" ? Wrench : Building2;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
}
