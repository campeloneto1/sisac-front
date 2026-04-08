"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSubunit } from "@/contexts/subunit-context";
import {
  useCreateNotificationResponsibilityMutation,
  useUpdateNotificationResponsibilityMutation,
} from "@/hooks/use-notification-responsibility-mutations";
import { useSectors } from "@/hooks/use-sectors";
import type {
  CreateNotificationResponsibilityDTO,
  NotificationResponsibilityItem,
  UpdateNotificationResponsibilityDTO,
} from "@/types/notification-responsibility.type";
import { getNotificationResponsibilityDomainLabel, notificationResponsibilityDomains } from "@/types/notification-responsibility.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const notificationResponsibilityFormSchema = z.object({
  domain: z.enum(notificationResponsibilityDomains, {
    message: "Selecione um dominio válido.",
  }),
  sector_id: z.string().min(1, "Selecione um setor responsável."),
});

type NotificationResponsibilityFormValues = z.infer<typeof notificationResponsibilityFormSchema>;

interface NotificationResponsibilityFormProps {
  mode: "create" | "edit";
  item?: NotificationResponsibilityItem;
}

export function NotificationResponsibilityForm({ mode, item }: NotificationResponsibilityFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreateNotificationResponsibilityMutation();
  const updateMutation = useUpdateNotificationResponsibilityMutation();
  const sectorsQuery = useSectors(
    {
      per_page: 100,
    },
    Boolean(activeSubunit),
  );
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<NotificationResponsibilityFormValues>({
    resolver: zodResolver(notificationResponsibilityFormSchema),
    defaultValues: {
      domain: item?.domain ?? "vehicle",
      sector_id: item?.sector_id ? String(item.sector_id) : "",
    },
  });

  useEffect(() => {
    if (!item) {
      return;
    }

    reset({
      domain: item.domain,
      sector_id: String(item.sector_id),
    });
  }, [item, reset]);

  async function onSubmit(values: NotificationResponsibilityFormValues) {
    if (!activeSubunit) {
      return;
    }

    const payloadBase = {
      domain: values.domain,
      sector_id: Number(values.sector_id),
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateNotificationResponsibilityDTO);
      router.push(`/notification-responsibilities/${response.data.id}`);
      return;
    }

    if (!item) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: item.id,
      payload: payloadBase satisfies UpdateNotificationResponsibilityDTO,
    });
    router.push(`/notification-responsibilities/${response.data.id}`);
  }

  const selectedDomain = useWatch({ control, name: "domain" });
  const selectedSectorId = useWatch({ control, name: "sector_id" });
  const selectedSector = (sectorsQuery.data?.data ?? []).find((sector) => String(sector.id) === selectedSectorId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova responsabilidade de notificação" : "Editar responsabilidade de notificação"}</CardTitle>
        <CardDescription>
          Defina qual setor da subunidade ativa recebera notificações automaticas para cada dominio do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Subunidade ativa: <span className="font-medium text-slate-900">{activeSubunit?.name ?? "Não selecionada"}</span>
        </div>

        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Dominio</Label>
            <Select
              value={selectedDomain}
              onValueChange={(value) =>
                setValue("domain", value as NotificationResponsibilityFormValues["domain"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um dominio" />
              </SelectTrigger>
              <SelectContent>
                {notificationResponsibilityDomains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {getNotificationResponsibilityDomainLabel(domain)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Cada subunidade pode ter apenas um setor responsável por dominio. O backend bloqueia duplicidade.
            </p>
            {errors.domain ? <p className="text-sm text-destructive">{errors.domain.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Setor responsável</Label>
            <Select value={selectedSectorId} onValueChange={(value) => setValue("sector_id", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
              <SelectContent>
                {(sectorsQuery.data?.data ?? []).map((sector) => (
                  <SelectItem key={sector.id} value={String(sector.id)}>
                    {sector.name} {sector.abbreviation ? `• ${sector.abbreviation}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {selectedSector
                ? `Setor selecionado: ${selectedSector.name}${selectedSector.abbreviation ? ` (${selectedSector.abbreviation})` : ""}.`
                : "O setor precisa pertencer a subunidade ativa, conforme validacao do backend."}
            </p>
            {errors.sector_id ? <p className="text-sm text-destructive">{errors.sector_id.message}</p> : null}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            Ao trocar a subunidade global, os setores disponíveis e as queries em cache sao atualizados automaticamente. Para editar
            uma regra de outra subunidade, troque primeiro o contexto ativo no header do sistema.
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/notification-responsibilities" : `/notification-responsibilities/${item?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar regra" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
