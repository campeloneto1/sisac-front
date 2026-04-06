"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreatePoliceOfficerAllocationMutation,
  useUpdatePoliceOfficerAllocationMutation,
} from "@/hooks/use-police-officer-allocation-mutations";
import { useAssignments } from "@/hooks/use-assignments";
import { useSectors } from "@/hooks/use-sectors";
import type {
  CreatePoliceOfficerAllocationDTO,
  PoliceOfficerAllocationItem,
  UpdatePoliceOfficerAllocationDTO,
} from "@/types/police-officer-allocation.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const allocationSchema = z.object({
  sector_id: z.coerce.number().min(1, "Selecione o setor."),
  assignment_id: z.coerce.number().min(1, "Selecione a função."),
  start_date: z.string().min(1, "A data de início é obrigatória."),
  end_date: z.string().optional(),
}).refine((data) => {
  if (data.end_date && data.start_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }

  return true;
}, {
  message: "A data de término deve ser posterior ou igual à data de início.",
  path: ["end_date"],
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

interface PoliceOfficerAllocationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policeOfficerId: number;
  policeOfficerName: string;
  allocation?: PoliceOfficerAllocationItem | null;
}

export function PoliceOfficerAllocationsDialog({
  open,
  onOpenChange,
  policeOfficerId,
  policeOfficerName,
  allocation,
}: PoliceOfficerAllocationsDialogProps) {
  const createMutation = useCreatePoliceOfficerAllocationMutation();
  const updateMutation = useUpdatePoliceOfficerAllocationMutation();
  const sectorsQuery = useSectors({ per_page: 100 });
  const assignmentsQuery = useAssignments({ per_page: 100 });
  const {
    handleSubmit,
    reset,
    setValue,
    control,
    register,
    formState: { errors },
  } = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      sector_id: allocation?.sector_id ?? 0,
      assignment_id: allocation?.assignment_id ?? 0,
      start_date: allocation?.start_date ?? "",
      end_date: allocation?.end_date ?? "",
    },
  });

  useEffect(() => {
    reset({
      sector_id: allocation?.sector_id ?? 0,
      assignment_id: allocation?.assignment_id ?? 0,
      start_date: allocation?.start_date ?? "",
      end_date: allocation?.end_date ?? "",
    });
  }, [allocation, reset, open]);

  const selectedSectorId = useWatch({ control, name: "sector_id" });
  const selectedAssignmentId = useWatch({ control, name: "assignment_id" });
  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: AllocationFormValues) {
    const payloadBase = {
      police_officer_id: policeOfficerId,
      sector_id: values.sector_id,
      assignment_id: values.assignment_id,
      start_date: values.start_date,
      end_date: values.end_date || null,
    };

    if (allocation) {
      await updateMutation.mutateAsync({
        id: allocation.id,
        payload: payloadBase satisfies UpdatePoliceOfficerAllocationDTO,
      });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreatePoliceOfficerAllocationDTO);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{allocation ? "Editar alocação" : "Nova alocação"}</DialogTitle>
          <DialogDescription>
            {allocation
              ? `Atualize a lotação funcional de ${policeOfficerName}.`
              : `Cadastre uma nova lotação funcional para ${policeOfficerName}.`}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="allocation-sector">Setor *</Label>
            <Select
              value={selectedSectorId ? String(selectedSectorId) : ""}
              onValueChange={(value) => setValue("sector_id", Number(value), { shouldValidate: true })}
            >
              <SelectTrigger id="allocation-sector">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {(sectorsQuery.data?.data ?? []).map((sector) => (
                  <SelectItem key={sector.id} value={String(sector.id)}>
                    {sector.name} {sector.abbreviation ? `(${sector.abbreviation})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sector_id ? <p className="text-sm text-destructive">{errors.sector_id.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocation-assignment">Função *</Label>
            <Select
              value={selectedAssignmentId ? String(selectedAssignmentId) : ""}
              onValueChange={(value) => setValue("assignment_id", Number(value), { shouldValidate: true })}
            >
              <SelectTrigger id="allocation-assignment">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                {(assignmentsQuery.data?.data ?? []).map((assignment) => (
                  <SelectItem key={assignment.id} value={String(assignment.id)}>
                    {assignment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assignment_id ? <p className="text-sm text-destructive">{errors.assignment_id.message}</p> : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="allocation-start-date">Data de início *</Label>
              <Input id="allocation-start-date" type="date" {...register("start_date")} />
              {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="allocation-end-date">Data de término</Label>
              <Input id="allocation-end-date" type="date" {...register("end_date")} />
              {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : allocation ? "Salvar alocação" : "Criar alocação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
