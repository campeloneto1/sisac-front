import { ShieldCheck, Workflow, Building2, BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Area autenticada pronta",
    description: "Shell com sidebar, header global, menu do usuario e area para CRUDs.",
    icon: ShieldCheck,
  },
  {
    title: "Subunidade ativa",
    description: "Troca global com invalidacao de cache e preparacao para header obrigatorio.",
    icon: Building2,
  },
  {
    title: "Permissoes centralizadas",
    description: "Base pronta para `can(user, action, resource)` e protecao reativa da interface.",
    icon: Workflow,
  },
  {
    title: "Camada de dados preparada",
    description: "React Query e client HTTP configurados para crescer junto com a API Laravel.",
    icon: BarChart3,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-slate-950 text-white">
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-200">
              Base inicial do SISAC
            </span>
            <div className="space-y-3">
              <h1 className="font-display text-3xl leading-tight md:text-4xl">
                Estrutura pronta para login, dashboard autenticado e crescimento por entidades.
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                O projeto ja nasce com shell administrativo, permissao centralizada, contexto de subunidade
                e uma experiencia visual consistente para evoluirmos os CRUDs com seguranca.
              </p>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Proximos passos naturais</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-100">
              <li>Conectar login ao backend Laravel.</li>
              <li>Popular permissoes reais via Policies/RBAC.</li>
              <li>Criar o primeiro recurso dentro de `/app/(dashboard)`.</li>
              <li>Substituir dados mockados por services reais.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {highlights.map((item) => (
          <Card key={item.title} className="border-slate-200/70 bg-white/80">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="rounded-2xl bg-secondary p-3 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Estrutura pensada para o seu fluxo</CardTitle>
            <CardDescription>
              Login e area autenticada ja estao separadas para facilitar middleware, layouts e componentes de
              dominio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>Use `/login` para a area publica e `/dashboard` como casca autenticada principal.</p>
            <p>
              O contexto global de subunidade e o helper de permissao ja ficam disponiveis para qualquer CRUD
              que criarmos em seguida.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-gradient-to-br from-orange-100 to-teal-50">
          <CardHeader>
            <CardTitle>Pronto para ShadCN</CardTitle>
            <CardDescription>
              Os componentes base seguem o estilo do ecossistema ShadCN e o `components.json` ja foi adicionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p>Podemos continuar adicionando componentes com a mesma base visual sem retrabalho estrutural.</p>
            <p>A proxima entidade ja pode nascer em cima de hooks, services e tipagem forte.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

