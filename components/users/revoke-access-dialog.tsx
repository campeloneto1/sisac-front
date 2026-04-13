"use client";

import { useState } from "react";
import { ShieldBan } from "lucide-react";

import { useRevokeAccessMutation } from "@/hooks/use-user-mutations";
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

interface RevokeAccessDialogProps {
  userId: number;
  userName: string;
}

export function RevokeAccessDialog({ userId, userName }: RevokeAccessDialogProps) {
  const [open, setOpen] = useState(false);
  const revokeAccessMutation = useRevokeAccessMutation();

  const handleRevoke = () => {
    revokeAccessMutation.mutate(userId, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="default">
          <ShieldBan className="mr-2 h-4 w-4" />
          Revogar Acesso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Revogar acesso</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja revogar o acesso temporário de <strong>{userName}</strong>?
            Esta ação irá desativar o usuário imediatamente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRevoke}
            disabled={revokeAccessMutation.isPending}
          >
            {revokeAccessMutation.isPending ? "Revogando..." : "Revogar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
