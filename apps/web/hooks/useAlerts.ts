import { useQuery } from "@tanstack/react-query";
import { getAlertSettings, getAlertSummary, updateAlertSettings } from "@/services/alerts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAlertSummary(params?: { inactiveDays?: number; staleDays?: number }) {
  return useQuery({
    queryKey: ["alerts", "summary", params],
    queryFn: () => getAlertSummary(params),
  });
}

export function useAlertSettings() {
  return useQuery({
    queryKey: ["alerts", "settings"],
    queryFn: () => getAlertSettings(),
  });
}

export function useUpdateAlertSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAlertSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["alerts", "summary"] });
    },
  });
}
