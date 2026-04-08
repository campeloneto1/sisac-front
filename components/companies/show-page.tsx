"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, MapPin, Phone, Mail, UserCircle2, FileText } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useCompany } from "@/hooks/use-companies";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("companies");
  const companyQuery = useCompany(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `companies.view` para visualizar empresas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (companyQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (companyQuery.isError || !companyQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar empresa</CardTitle>
          <CardDescription>Os dados da empresa não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const company = companyQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">{company.name}</h1>
          {company.trade_name ? <p className="mt-2 text-lg text-slate-600">{company.trade_name}</p> : null}
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Empresa cadastrada no painel Gestor do sistema.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/companies/${company.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Informações gerais</CardTitle>
            <CardDescription>Dados basicos da empresa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nome</p>
                <p className="text-sm text-slate-700">{company.name}</p>
              </div>
            </div>

            {company.trade_name ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Building2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nome fantasia</p>
                  <p className="text-sm text-slate-700">{company.trade_name}</p>
                </div>
              </div>
            ) : null}

            {company.cnpj ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">CNPJ</p>
                  <p className="text-sm text-slate-700">{company.cnpj}</p>
                </div>
              </div>
            ) : null}

            {company.manager_name ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <UserCircle2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Gerente</p>
                  <p className="text-sm text-slate-700">{company.manager_name}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Contato</CardTitle>
            <CardDescription>Informações de contato da empresa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {company.phone ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Telefone</p>
                  <p className="text-sm text-slate-700">{company.phone}</p>
                </div>
              </div>
            ) : null}

            {company.phone2 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Telefone 2</p>
                  <p className="text-sm text-slate-700">{company.phone2}</p>
                </div>
              </div>
            ) : null}

            {company.email ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
                  <p className="text-sm text-slate-700">{company.email}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Endereco</CardTitle>
            <CardDescription>Localização da empresa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {company.street ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Rua</p>
                  <p className="text-sm text-slate-700">{company.street}</p>
                </div>
              </div>
            ) : null}

            {company.number ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Número</p>
                  <p className="text-sm text-slate-700">{company.number}</p>
                </div>
              </div>
            ) : null}

            {company.neighborhood ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Bairro</p>
                  <p className="text-sm text-slate-700">{company.neighborhood}</p>
                </div>
              </div>
            ) : null}

            {company.postal_code ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">CEP</p>
                  <p className="text-sm text-slate-700">{company.postal_code}</p>
                </div>
              </div>
            ) : null}

            {company.city ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cidade</p>
                  <p className="text-sm text-slate-700">{company.city.name}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>Informações de criação e atualização.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {company.subunit ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Building2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Subunidade</p>
                  <p className="text-sm text-slate-700">{company.subunit.name}</p>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{company.creator ? `${company.creator.name} (${company.creator.email})` : "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{company.updater ? `${company.updater.name} (${company.updater.email})` : "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
