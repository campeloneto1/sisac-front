"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useCreateUserSubunitMutation, useDeleteUserSubunitMutation } from "@/hooks/use-user-subunit-mutations";
import { useUserSubunitOptions, useUserSubunits } from "@/hooks/use-user-subunits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface UserSubunitsDialogProps {
  userId: number;
  userName: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline";
  onAfterChange?: () => Promise<void> | void;
}

export function UserSubunitsDialog({
  userId,
  userName,
  triggerLabel = "Gerenciar subunidades",
  triggerVariant = "outline",
  onAfterChange,
}: UserSubunitsDialogProps) {
  const { user: authenticatedUser, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedSubunitId, setSelectedSubunitId] = useState<string>("");
  const userSubunitsQuery = useUserSubunits(open ? userId : undefined);
  const subunitOptionsQuery = useUserSubunitOptions();
  const createMutation = useCreateUserSubunitMutation(userId);
  const deleteMutation = useDeleteUserSubunitMutation(userId);
  const isSelf = authenticatedUser?.id === userId;

  const linkedSubunitIds = useMemo(
    () => new Set((userSubunitsQuery.data?.data ?? []).map((item) => item.subunit_id)),
    [userSubunitsQuery.data?.data],
  );
  const availableSubunits = useMemo(
    () => (subunitOptionsQuery.data?.data ?? []).filter((subunit) => !linkedSubunitIds.has(Number(subunit.id))),
    [linkedSubunitIds, subunitOptionsQuery.data?.data],
  );

  async function syncAfterChange() {
    if (isSelf) {
      await refreshUser();
    }

    await onAfterChange?.();
  }

  async function handleAdd() {
    if (!selectedSubunitId) {
      return;
    }

    await createMutation.mutateAsync({
      user_id: userId,
      subunit_id: Number(selectedSubunitId),
    });
    setSelectedSubunitId("");
    await syncAfterChange();
  }

  async function handleRemove(id: number) {
    await deleteMutation.mutateAsync(id);
    await syncAfterChange();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Subunidades com acesso</DialogTitle>
          <DialogDescription>
            Defina quais subunidades {userName} pode selecionar na navbar. A subunidade ativa escolhida la sera enviada no header `X-Active-Subunit`.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4">
            <p className="text-sm font-medium text-slate-900">Adicionar subunidade</p>
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <Select value={selectedSubunitId} onValueChange={setSelectedSubunitId}>
                  <SelectTrigger>
                    <SelectValue placeholder={subunitOptionsQuery.isLoading ? "Carregando subunidades..." : "Selecione uma subunidade"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubunits.map((subunit) => (
                      <SelectItem key={String(subunit.id)} value={String(subunit.id)}>
                        {subunit.name}
                        {subunit.abbreviation ? ` • ${subunit.abbreviation}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => void handleAdd()} disabled={!selectedSubunitId || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Vincular
              </Button>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">Subunidades vinculadas</p>

            {userSubunitsQuery.isLoading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : !userSubunitsQuery.data?.data.length ? (
              <p className="mt-4 text-sm text-slate-500">Este usuario ainda nao possui subunidades vinculadas.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {userSubunitsQuery.data.data.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.subunit?.name ?? `Subunidade #${item.subunit_id}`}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.subunit?.abbreviation ?? "Sem sigla"}</p>
                    </div>
                    <Button variant="outline" size="icon" disabled={deleteMutation.isPending} onClick={() => void handleRemove(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
