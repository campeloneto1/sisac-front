import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { armamentSizesService } from "@/services/armament-sizes/service";

export function useCreateArmamentSizeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: armamentSizesService.create,
    onSuccess: (response) => {
      toast.success(response.message || "Tamanho criado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["armament-sizes"] });
    },
    onError: () => {
      toast.error("Não foi possível criar o tamanho de armamento.");
    },
  });
}

export function useUpdateArmamentSizeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof armamentSizesService.update>[1];
    }) => armamentSizesService.update(id, payload),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Tamanho atualizado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["armament-sizes"] });
      queryClient.invalidateQueries({
        queryKey: ["armament-sizes", variables.id],
      });
    },
    onError: () => {
      toast.error("Não foi possível atualizar o tamanho de armamento.");
    },
  });
}

export function useDeleteArmamentSizeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: armamentSizesService.remove,
    onSuccess: (response) => {
      toast.success(response.message || "Tamanho removido com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["armament-sizes"] });
    },
    onError: () => {
      toast.error("Não foi possível remover o tamanho de armamento.");
    },
  });
}
