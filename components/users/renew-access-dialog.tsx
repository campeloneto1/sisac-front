"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RefreshCcw } from "lucide-react";

import { useRenewAccessMutation } from "@/hooks/use-user-mutations";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RenewAccessDialogProps {
  userId: number;
  userName: string;
  currentAuthorizedUntil?: string | null;
}

const renewAccessSchema = z.object({
  authorized_until: z.string().optional(),
});

type RenewAccessFormData = z.infer<typeof renewAccessSchema>;

export function RenewAccessDialog({ userId, userName, currentAuthorizedUntil }: RenewAccessDialogProps) {
  const [open, setOpen] = useState(false);
  const renewAccessMutation = useRenewAccessMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenewAccessFormData>({
    resolver: zodResolver(renewAccessSchema),
    defaultValues: {
      authorized_until: currentAuthorizedUntil
        ? new Date(currentAuthorizedUntil).toISOString().split("T")[0]
        : undefined,
    },
  });

  const onSubmit = (data: RenewAccessFormData) => {
    renewAccessMutation.mutate(
      {
        id: userId,
        authorized_until: data.authorized_until,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" size="default">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Renovar Acesso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Renovar acesso temporário</DialogTitle>
            <DialogDescription>
              Renove o acesso temporário de <strong>{userName}</strong>.
              Defina uma nova data de expiração ou deixe em branco para remover a limitação.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="authorized_until">Nova data de expiração</Label>
              <Input
                id="authorized_until"
                type="date"
                {...register("authorized_until")}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.authorized_until?.message ? (
                <p className="text-sm text-red-500">{errors.authorized_until.message}</p>
              ) : null}
              <p className="text-xs text-slate-500">
                Deixe em branco para renovar sem data de expiração específica.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={renewAccessMutation.isPending}>
              {renewAccessMutation.isPending ? "Renovando..." : "Renovar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
