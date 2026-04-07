import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { armamentsService } from "@/services/armaments/service";

export function useCreateArmamentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: armamentsService.create,
    onSuccess: (response) => {
      toast.success(response.message || "Armamento criado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["armaments"] });
    },
    onError: () => {
      toast.error("Nao foi possivel criar o armamento.");
    },
  });
}

export function useUpdateArmamentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof armamentsService.update>[1];
    }) => armamentsService.update(id, payload),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Armamento atualizado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["armaments"] });
      queryClient.invalidateQueries({ queryKey: ["armaments", variables.id] });
    },
    onError: () => {
      toast.error("Nao foi possivel atualizar o armamento.");
    },
  });
}

export function useDeleteArmamentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: armamentsService.remove,
    onSuccess: (response) => {
      toast.success(response.message || "Armamento removido com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["armaments"] });
    },
    onError: () => {
      toast.error("Nao foi possivel remover o armamento.");
    },
  });
}
