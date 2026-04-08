"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Mail, MapPin, Phone, UserCircle2, Wrench } from "lucide-react";

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
  return status === "Ativa" ? "success" : "secondary";
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
            Você precisa de `manager` e `workshops.view` para visualizar
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
            Os dados da oficina não estão disponíveis no momento.
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl text-slate-900">
                {workshop.name}
              </h1>
              <Badge variant={getStatusVariant(workshop.status_label)}>
                {workshop.status_label ?? (workshop.is_active ? "Ativa" : "Inativa")}
              </Badge>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {workshop.cnpj ? `CNPJ: ${workshop.cnpj}` : "CNPJ não informado"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Cadastro gerencial da oficina com contatos, cobertura geografica,
            especialidades e trilha de auditoria.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/workshops/${workshop.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Contato e localização</CardTitle>
            <CardDescription>
              Informações para acionamento operacional da oficina.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Telefone principal
                </p>
                <p className="text-sm text-slate-700">{workshop.phone ?? "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Email
                </p>
                <p className="text-sm text-slate-700">{workshop.email ?? "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Contato responsável
                </p>
                <p className="text-sm text-slate-700">
                  {workshop.contact_person ?? "Não informado"}
                  {workshop.contact_phone ? ` • ${workshop.contact_phone}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Endereco
                </p>
                <p className="text-sm text-slate-700">
                  {workshop.address || "Não informado"}
                </p>
                <p className="text-sm text-slate-700">
                  {[workshop.city, workshop.state].filter(Boolean).join(" / ") || "-"}
                  {workshop.zip_code ? ` • CEP ${workshop.zip_code}` : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Especialidades e auditoria</CardTitle>
            <CardDescription>
              Areas de atuação da oficina e usuários responsáveis pelo cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Especialidades
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {workshop.specialties?.length ? (
                  workshop.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline">
                      {specialty}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-700">Nenhuma especialidade informada.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Observações
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {workshop.notes ?? "Nenhuma observação registrada."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Criado por
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {workshop.creator
                  ? `${workshop.creator.name} (${workshop.creator.email})`
                  : "Não informado"}
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                Atualizado por
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {workshop.updater
                  ? `${workshop.updater.name} (${workshop.updater.email})`
                  : "Não informado"}
              </p>
              <p className="mt-3 text-sm text-slate-700">
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
