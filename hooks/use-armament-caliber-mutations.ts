import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { armamentCalibersService } from "@/services/armament-calibers/service";

export function useCreateArmamentCaliberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: armamentCalibersService.create,
    onSuccess: (response) => {
      toast.success(response.message || "Calibre criado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["armament-calibers"] });
    },
    onError: () => {
      toast.error("Não foi possível criar o calibre de armamento.");
    },
  });
}

export function useUpdateArmamentCaliberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof armamentCalibersService.update>[1];
    }) => armamentCalibersService.update(id, payload),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Calibre atualizado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["armament-calibers"] });
      queryClient.invalidateQueries({
        queryKey: ["armament-calibers", variables.id],
      });
    },
    onError: () => {
      toast.error("Não foi possível atualizar o calibre de armamento.");
    },
  });
}

export function useDeleteArmamentCaliberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: armamentCalibersService.remove,
    onSuccess: (response) => {
      toast.success(response.message || "Calibre removido com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["armament-calibers"] });
    },
    onError: () => {
      toast.error("Não foi possível remover o calibre de armamento.");
    },
  });
}
