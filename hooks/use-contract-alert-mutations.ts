"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { contractAlertsService } from "@/services/contract-alerts/service";

function invalidateContractAlertQueries(queryClient: ReturnType<typeof useQueryClient>, contractId: number | string) {
  queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
  queryClient.invalidateQueries({ queryKey: ["contract-alerts"] });
}

export function useCreateContractAlertMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractAlertsService.create,
    onSuccess(response) {
      invalidateContractAlertQueries(queryClient, contractId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateContractAlertMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof contractAlertsService.update>[1] }) =>
      contractAlertsService.update(id, payload),
    onSuccess(response) {
      invalidateContractAlertQueries(queryClient, contractId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteContractAlertMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractAlertsService.remove,
    onSuccess(response) {
      invalidateContractAlertQueries(queryClient, contractId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useAcknowledgeContractAlertMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractAlertsService.acknowledge,
    onSuccess(response) {
      invalidateContractAlertQueries(queryClient, contractId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useResolveContractAlertMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractAlertsService.resolve,
    onSuccess(response) {
      invalidateContractAlertQueries(queryClient, contractId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
