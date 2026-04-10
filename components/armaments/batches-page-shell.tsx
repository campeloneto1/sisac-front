"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Archive, ArrowLeft, Crosshair } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { useArmament } from "@/hooks/use-armaments";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ArmamentBatchesPageShellProps {
  title: string;
  description: string;
  requiredPermission: "view" | "create" | "update";
  children?: React.ReactNode;
}

export function ArmamentBatchesPageShell({
  title,
  description,
  requiredPermission,
  children,
}: ArmamentBatchesPageShellProps) {
  const params = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("armaments");
  const hasPermission =
    requiredPermission === "view"
      ? permissions.canView
      : requiredPermission === "create"
        ? permissions.canCreate
        : permissions.canUpdate;
  const armamentQuery = useArmament(
    params.id,
    hasPermission && Boolean(activeSubunit),
  );

  if (!hasPermission) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você não possui permissão suficiente para acessar a gestão de lotes
            deste armamento.
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
            O módulo de lotes de armamento depende da subunidade ativa para
            enviar o header `X-SUBUNIT-ACTIVE`.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (armamentQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (armamentQuery.isError || !armamentQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Não foi possível carregar o armamento</CardTitle>
          <CardDescription>
            Verifique se o cadastro existe e se você possui acesso a ele.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const armament = armamentQuery.data.data;
  const armamentLabel =
    [armament.type?.name, armament.variant?.name].filter(Boolean).join(" ") ||
    `Armamento #${armament.id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Button asChild type="button" variant="outline">
            <Link href={`/armaments/${armament.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao armamento
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <Crosshair className="h-4 w-4 text-primary" />
            Armamento base
          </div>
          <p className="text-sm font-semibold text-slate-900">{armamentLabel}</p>
          <p className="mt-1 text-xs text-slate-500">
            {armament.subunit?.abbreviation ||
              armament.subunit?.name ||
              "Sem subunidade"}
          </p>
        </div>
      </div>

{children}
    </div>
  );
}
