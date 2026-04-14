"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSubunit } from "@/contexts/subunit-context";
import { useCreateNoticeMutation, useUpdateNoticeMutation } from "@/hooks/use-notice-mutations";
import { useRoles } from "@/hooks/use-roles";
import { useSectors } from "@/hooks/use-sectors";
import { useUsers } from "@/hooks/use-users";
import {
  noticePriorityOptions,
  noticeTypeOptions,
  noticeVisibilityOptions,
  type CreateNoticeDTO,
  type NoticeItem,
  type NoticeTargetPayload,
  type UpdateNoticeDTO,
} from "@/types/notice.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const noticeFormSchema = z
  .object({
    title: z.string().trim().min(3, "O título precisa ter ao menos 3 caracteres.").max(255, "O título deve ter no máximo 255 caracteres."),
    content: z.string().trim().min(3, "O conteúdo precisa ter ao menos 3 caracteres."),
    type: z.enum(["info", "warning", "error", "success"]),
    priority: z.enum(["0", "1", "2"]),
    visibility: z.enum(["public", "authenticated"]),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    is_active: z.boolean(),
    is_pinned: z.boolean(),
    requires_acknowledgement: z.boolean(),
    target_mode: z.enum(["general", "all", "custom"]),
    sector_ids: z.array(z.string()),
    user_ids: z.array(z.string()),
    role_ids: z.array(z.string()),
  })
  .superRefine((values, ctx) => {
    if (values.starts_at && values.ends_at) {
      const startsAt = new Date(values.starts_at).getTime();
      const endsAt = new Date(values.ends_at).getTime();

      if (!Number.isNaN(startsAt) && !Number.isNaN(endsAt) && endsAt < startsAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ends_at"],
          message: "A data final deve ser posterior ou igual à data inicial.",
        });
      }
    }

    if (
      values.target_mode === "custom" &&
      values.sector_ids.length === 0 &&
      values.user_ids.length === 0 &&
      values.role_ids.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["target_mode"],
        message: "Selecione ao menos um setor, usuário ou perfil para segmentar o aviso.",
      });
    }
  });

type NoticeFormValues = z.infer<typeof noticeFormSchema>;

interface NoticeFormProps {
  mode: "create" | "edit";
  notice?: NoticeItem;
}

function formatDateTimeLocalInput(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function deriveDefaultValues(notice?: NoticeItem): NoticeFormValues {
  const targets = notice?.targets ?? [];
  const hasAllTarget = targets.some((target) => target.target_type === "all");
  const targetMode = hasAllTarget ? "all" : targets.length ? "custom" : "general";

  return {
    title: notice?.title ?? "",
    content: notice?.content ?? "",
    type: notice?.type ?? "info",
    priority: String(notice?.priority ?? 0) as NoticeFormValues["priority"],
    visibility: notice?.visibility ?? "authenticated",
    starts_at: formatDateTimeLocalInput(notice?.starts_at),
    ends_at: formatDateTimeLocalInput(notice?.ends_at),
    is_active: notice?.is_active ?? true,
    is_pinned: notice?.is_pinned ?? false,
    requires_acknowledgement: notice?.requires_acknowledgement ?? false,
    target_mode: targetMode,
    sector_ids: targets.filter((target) => target.target_type === "sector" && target.target_id !== null).map((target) => String(target.target_id)),
    user_ids: targets.filter((target) => target.target_type === "user" && target.target_id !== null).map((target) => String(target.target_id)),
    role_ids: targets.filter((target) => target.target_type === "role" && target.target_id !== null).map((target) => String(target.target_id)),
  };
}

function toggleSelection(values: string[], value: string, checked: boolean) {
  if (checked) {
    return values.includes(value) ? values : [...values, value];
  }

  return values.filter((item) => item !== value);
}

function SelectionGroup({
  title,
  description,
  options,
  selectedValues,
  disabled,
  onToggle,
}: {
  title: string;
  description: string;
  options: Array<{ id: number; label: string; helper?: string | null }>;
  selectedValues: string[];
  disabled: boolean;
  onToggle: (value: string, checked: boolean) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      {options.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {options.map((option) => {
            const checked = selectedValues.includes(String(option.id));

            return (
              <label
                key={option.id}
                className={`flex items-start gap-3 rounded-2xl border bg-white p-3 transition ${checked ? "border-primary/40" : "border-slate-200/70"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={(nextChecked) => onToggle(String(option.id), Boolean(nextChecked))}
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">{option.label}</p>
                  {option.helper ? <p className="text-xs text-slate-500">{option.helper}</p> : null}
                </div>
              </label>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Nenhuma opção disponível no contexto atual.</p>
      )}
    </div>
  );
}

export function NoticeForm({ mode, notice }: NoticeFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreateNoticeMutation();
  const updateMutation = useUpdateNoticeMutation();
  const sectorsQuery = useSectors({ per_page: 100 }, Boolean(activeSubunit));
  const usersQuery = useUsers({ per_page: 100 });
  const rolesQuery = useRoles({ per_page: 100 });
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: deriveDefaultValues(notice),
  });

  useEffect(() => {
    reset(deriveDefaultValues(notice));
  }, [notice, reset]);

  const watchedValues = useWatch({ control });
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isPublicVisibility = watchedValues.visibility === "public";
  const customModeEnabled = watchedValues.target_mode === "custom" && !isPublicVisibility;
  const activeSubunitId = activeSubunit ? Number(activeSubunit.id) : null;
  const filteredUsers = (usersQuery.data?.data ?? []).filter((user) =>
    user.subunits?.some((subunit) => Number(subunit.id) === activeSubunitId),
  );
  const sectorOptions = (sectorsQuery.data?.data ?? []).map((sector) => ({
    id: sector.id,
    label: sector.name,
    helper: sector.abbreviation ?? sector.subunit?.abbreviation ?? null,
  }));
  const userOptions = filteredUsers.map((user) => ({
    id: user.id,
    label: user.name,
    helper: user.email,
  }));
  const roleOptions = (rolesQuery.data?.data ?? []).map((role) => ({
    id: role.id,
    label: role.name,
    helper: role.slug,
  }));

  async function onSubmit(values: NoticeFormValues) {
    if (!activeSubunit) {
      return;
    }

    const targets: NoticeTargetPayload[] =
      values.target_mode === "general"
        ? []
        : values.target_mode === "all"
          ? [{ target_type: "all", target_id: null }]
          : [
              ...values.sector_ids.map((sectorId) => ({ target_type: "sector" as const, target_id: Number(sectorId) })),
              ...values.user_ids.map((userId) => ({ target_type: "user" as const, target_id: Number(userId) })),
              ...values.role_ids.map((roleId) => ({ target_type: "role" as const, target_id: Number(roleId) })),
            ];

    const payloadBase = {
      title: values.title.trim(),
      content: values.content.trim(),
      type: values.type,
      priority: Number(values.priority) as CreateNoticeDTO["priority"],
      visibility: values.visibility,
      starts_at: values.starts_at ? new Date(values.starts_at).toISOString() : null,
      ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : null,
      is_active: values.is_active,
      is_pinned: values.is_pinned,
      requires_acknowledgement: values.requires_acknowledgement,
      targets,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateNoticeDTO);
      router.push(`/notices/${response.data.id}`);
      return;
    }

    if (!notice) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: notice.id,
      payload: payloadBase satisfies UpdateNoticeDTO,
    });
    router.push(`/notices/${response.data.id}`);
  }

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo aviso" : "Editar aviso"}</CardTitle>
        <CardDescription>
          Cadastre avisos por subunidade com controle de prioridade, janela de exibição e público-alvo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Subunidade ativa: <span className="font-medium text-slate-900">{activeSubunit?.abbreviation || activeSubunit?.name || "Não selecionada"}</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" placeholder="Ex.: Manutenção no sistema amanhã" {...register("title")} />
              {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea id="content" placeholder="Descreva o aviso com o contexto necessário para o público-alvo." {...register("content")} />
              {errors.content ? <p className="text-sm text-destructive">{errors.content.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={watchedValues.type} onValueChange={(value) => setValue("type", value as NoticeFormValues["type"], { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {noticeTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type ? <p className="text-sm text-destructive">{errors.type.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={watchedValues.priority} onValueChange={(value) => setValue("priority", value as NoticeFormValues["priority"], { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {noticePriorityOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority ? <p className="text-sm text-destructive">{errors.priority.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Visibilidade</Label>
              <Select
                value={watchedValues.visibility}
                onValueChange={(value) => {
                  setValue("visibility", value as NoticeFormValues["visibility"], { shouldValidate: true });
                  if (value === "public") {
                    setValue("target_mode", "general", { shouldValidate: true });
                    setValue("sector_ids", [], { shouldValidate: true });
                    setValue("user_ids", [], { shouldValidate: true });
                    setValue("role_ids", [], { shouldValidate: true });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a visibilidade" />
                </SelectTrigger>
                <SelectContent>
                  {noticeVisibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {watchedValues.visibility === "public"
                  ? "Avisos públicos aparecem na tela de login para todos os visitantes."
                  : "Avisos autenticados são visíveis apenas para usuários logados."}
              </p>
              {errors.visibility ? <p className="text-sm text-destructive">{errors.visibility.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="starts_at">Início da exibição</Label>
              <Input id="starts_at" type="datetime-local" {...register("starts_at")} />
              <p className="text-xs text-slate-500">Se vazio, o aviso pode aparecer imediatamente.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">Fim da exibição</Label>
              <Input id="ends_at" type="datetime-local" {...register("ends_at")} />
              <p className="text-xs text-slate-500">Se vazio, o aviso permanece sem prazo final.</p>
              {errors.ends_at ? <p className="text-sm text-destructive">{errors.ends_at.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <Checkbox checked={watchedValues.is_active} onCheckedChange={(checked) => setValue("is_active", Boolean(checked), { shouldValidate: true })} />
              <div>
                <p className="font-medium text-slate-900">Aviso ativo</p>
                <p className="text-sm text-slate-500">Permite que a API considere o aviso para exibição conforme a janela de datas.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <Checkbox checked={watchedValues.is_pinned} onCheckedChange={(checked) => setValue("is_pinned", Boolean(checked), { shouldValidate: true })} />
              <div>
                <p className="font-medium text-slate-900">Fixar aviso</p>
                <p className="text-sm text-slate-500">Mantém o aviso com maior destaque nas listagens ordenadas pela API.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <Checkbox
                checked={watchedValues.requires_acknowledgement}
                onCheckedChange={(checked) => setValue("requires_acknowledgement", Boolean(checked), { shouldValidate: true })}
              />
              <div>
                <p className="font-medium text-slate-900">Exigir ciência</p>
                <p className="text-sm text-slate-500">Usuários destinatários poderão precisar confirmar leitura deste aviso.</p>
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900">Segmentação do aviso</h3>
              <p className="text-sm text-slate-500">Defina se o aviso é geral, para todos explicitamente ou segmentado por setores, usuários e perfis.</p>
            </div>

            {isPublicVisibility ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Avisos públicos são exibidos na tela de login e não podem ser segmentados. Para segmentar, altere a visibilidade para &quot;Autenticado&quot;.
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    {
                      value: "general",
                      title: "Geral da subunidade",
                      description: "Não envia targets. O aviso vale para a subunidade ativa inteira.",
                    },
                    {
                      value: "all",
                      title: "Todos explicitamente",
                      description: "Envia um target `all`, deixando a abrangência explícita na API.",
                    },
                    {
                      value: "custom",
                      title: "Segmentado",
                      description: "Permite escolher setores, usuários e perfis específicos.",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`rounded-2xl border p-4 text-left transition ${watchedValues.target_mode === option.value ? "border-primary bg-primary/5" : "border-slate-200/70 bg-slate-50 hover:border-slate-300"}`}
                      onClick={() => setValue("target_mode", option.value as NoticeFormValues["target_mode"], { shouldValidate: true })}
                    >
                      <p className="font-medium text-slate-900">{option.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{option.description}</p>
                    </button>
                  ))}
                </div>

                {errors.target_mode ? <p className="text-sm text-destructive">{errors.target_mode.message}</p> : null}

                <div className="grid gap-4">
                  <SelectionGroup
                    title="Setores"
                    description="Setores da subunidade ativa que receberão o aviso."
                    options={sectorOptions}
                    selectedValues={watchedValues.sector_ids ?? []}
                    disabled={!customModeEnabled}
                    onToggle={(value, checked) => setValue("sector_ids", toggleSelection(watchedValues.sector_ids ?? [], value, checked), { shouldValidate: true })}
                  />

                  <SelectionGroup
                    title="Usuários"
                    description="Usuários vinculados à subunidade ativa que devem receber o aviso."
                    options={userOptions}
                    selectedValues={watchedValues.user_ids ?? []}
                    disabled={!customModeEnabled}
                    onToggle={(value, checked) => setValue("user_ids", toggleSelection(watchedValues.user_ids ?? [], value, checked), { shouldValidate: true })}
                  />

                  <SelectionGroup
                    title="Perfis"
                    description="Perfis globais do sistema para segmentação por RBAC."
                    options={roleOptions}
                    selectedValues={watchedValues.role_ids ?? []}
                    disabled={!customModeEnabled}
                    onToggle={(value, checked) => setValue("role_ids", toggleSelection(watchedValues.role_ids ?? [], value, checked), { shouldValidate: true })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/notices" : `/notices/${notice?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar aviso" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
