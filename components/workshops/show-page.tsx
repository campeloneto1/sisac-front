"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, Phone, UserCircle2, Wrench } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useWorkshop } from "@/hooks/use-workshops";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function getStatusVariant(status?: string | null) {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "secondary";
    default:
      return "outline";
  }
}

export function WorkshopShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("workshops");
  const workshopQuery = useWorkshop(params.id);

  if (!hasPermission(user, "manager") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `manager` e `workshops.view` para visualizar
            oficinas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (workshopQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (workshopQuery.isError || !workshopQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar oficina</CardTitle>
          <CardDescription>
            Os dados da oficina nao estao disponiveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const workshop = workshopQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {workshop.name}
            </h1>
            <Badge variant={getStatusVariant(workshop.status)}>
              {workshop.status_label ?? "Sem status"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {workshop.city || workshop.state
              ? `${workshop.city ?? "Cidade nao informada"}${
                  workshop.state ? ` • ${workshop.state}` : ""
                }`
              : "Localizacao nao informada"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Cadastro gerencial da oficina com contatos, localizacao e
            especialidades atendidas.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/workshops/${workshop.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Dados institucionais</CardTitle>
            <CardDescription>
              Identificacao e cobertura geografica da oficina.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                CNPJ
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {workshop.cnpj ?? "Nao informado"}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Endereco
                </p>
                <p className="text-sm text-slate-700">
                  {workshop.address ?? "Nao informado"}
                </p>
                <p className="text-xs text-slate-500">
                  {workshop.city ?? "Cidade nao informada"}
                  {workshop.state ? ` • ${workshop.state}` : ""}
                  {workshop.zip_code ? ` • CEP ${workshop.zip_code}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Contato da oficina
                </p>
                <p className="text-sm text-slate-700">
                  {workshop.phone ?? "Nao informado"}
                </p>
                <p className="text-xs text-slate-500">
                  {workshop.email ?? "Email nao informado"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Observacoes
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {workshop.notes || "Nao informadas"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Operacao e auditoria</CardTitle>
            <CardDescription>
              Especialidades, pessoa de contato e historico do cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Contato principal
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {workshop.contact_person ?? "Nao informado"}
              </p>
              <p className="text-xs text-slate-500">
                {workshop.contact_phone ?? "Telefone nao informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Especialidades
                </p>
              </div>
              {workshop.specialties?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {workshop.specialties.map((item) => (
                    <Badge key={item} variant="info">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-700">
                  Nenhuma especialidade informada.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Criado por
                </p>
                <p className="text-sm text-slate-700">
                  {workshop.creator
                    ? `${workshop.creator.name} (${workshop.creator.email})`
                    : "Nao informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Atualizado por
                </p>
                <p className="text-sm text-slate-700">
                  {workshop.updater
                    ? `${workshop.updater.name} (${workshop.updater.email})`
                    : "Nao informado"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Timestamps
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {workshop.created_at ?? "-"}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {workshop.updated_at ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
