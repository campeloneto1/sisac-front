"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarClock, CreditCard, Mail, Phone, Shield, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useUser } from "@/hooks/use-users";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResetPasswordDialog } from "@/components/users/reset-password-dialog";

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
      <div className="rounded-xl bg-white p-2 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
}

export function UserShowPage() {
  const params = useParams<{ id: string }>();
  const { user: authenticatedUser } = useAuth();
  const permissions = usePermissions("users");
  const userQuery = useUser(params.id);
  const isSelf = authenticatedUser?.id === Number(params.id);

  if (!permissions.canView && !isSelf) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `view` para acessar o detalhe do usuario.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (userQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar usuario</CardTitle>
          <CardDescription>O detalhe nao pode ser exibido agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const user = userQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-3xl text-slate-900">{user.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{user.role?.name ?? "Sem perfil"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">{user.type_label ?? "-"}</Badge>
              <Badge variant="secondary">{user.status_label ?? "-"}</Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {(permissions.canUpdate || isSelf) ? (
            <Button asChild variant="outline">
              <Link href={`/users/${user.id}/edit`}>Editar</Link>
            </Button>
          ) : null}
          {permissions.canResetPassword ? <ResetPasswordDialog userId={user.id} userName={user.name} /> : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Dados principais</CardTitle>
            <CardDescription>Informacoes basicas retornadas pelo `UserResource`.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <InfoRow icon={Mail} label="E-mail" value={user.email} />
            <InfoRow icon={Phone} label="Telefone" value={user.phone ?? "Nao informado"} />
            <InfoRow icon={CreditCard} label="Documento" value={user.document ?? "Nao informado"} />
            <InfoRow
              icon={CalendarClock}
              label="Autorizado ate"
              value={user.authorized_until ? new Date(user.authorized_until).toLocaleString("pt-BR") : "Nao se aplica"}
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Vinculos e auditoria</CardTitle>
            <CardDescription>Relacionamentos do usuario carregados pela API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={Shield} label="Perfil" value={user.role?.name ?? "Nao carregado"} />
            <InfoRow
              icon={UserCircle2}
              label="Policial vinculado"
              value={
                user.police_officer
                  ? `${user.police_officer.war_name ?? "Sem nome de guerra"} | Matricula ${user.police_officer.registration_number ?? "-"}`
                  : "Nao vinculado"
              }
            />
            <InfoRow
              icon={UserCircle2}
              label="Criado por"
              value={user.creator ? `${user.creator.name} (${user.creator.email})` : "Nao informado"}
            />
            <InfoRow
              icon={UserCircle2}
              label="Atualizado por"
              value={user.updater ? `${user.updater.name} (${user.updater.email})` : "Nao informado"}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Subunidades</CardTitle>
          <CardDescription>
            O `UserResource` preve esta relacao, mas ela so aparecera se o backend a carregar no repositório.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.subunits?.length ? (
            <div className="flex flex-wrap gap-2">
              {user.subunits.map((subunit) => (
                <Badge key={String(subunit.id)} variant="outline">
                  {subunit.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma subunidade retornada pela API para este usuario.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
