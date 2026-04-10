"use client";

import { useParams } from "next/navigation";

import { ArmamentBatchesPageShell } from "@/components/armaments/batches-page-shell";
import { ArmamentBatchForm } from "@/components/armaments/batch-form";

export function ArmamentBatchCreatePage() {
  const params = useParams<{ id: string }>();

  return (
    <ArmamentBatchesPageShell
      title="Novo lote"
      description="Cadastre um lote vinculado ao armamento selecionado."
      requiredPermission="create"
    >
      <ArmamentBatchForm armamentId={params.id} mode="create" />
    </ArmamentBatchesPageShell>
  );
}
