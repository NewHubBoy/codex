import { useQuery } from "@tanstack/react-query";
import { getAlertSummary } from "@/services/alerts";

export function useAlertSummary(params?: { inactiveDays?: number; staleDays?: number }) {
  return useQuery({
    queryKey: ["alerts", "summary", params],
    queryFn: () => getAlertSummary(params),
  });
}
