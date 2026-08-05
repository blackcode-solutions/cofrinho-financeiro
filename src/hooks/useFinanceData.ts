import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';

export function useSavings() {
  const profile = useAuthStore((s) => s.profile);
  return useQuery({
    queryKey: ['savings', profile?.id],
    queryFn: () => api.listSavings(profile!.id),
    enabled: !!profile,
  });
}

export function usePurchases() {
  const profile = useAuthStore((s) => s.profile);
  return useQuery({
    queryKey: ['purchases', profile?.id],
    queryFn: () => api.listPurchases(profile!.id),
    enabled: !!profile,
  });
}

export function useMissions() {
  const profile = useAuthStore((s) => s.profile);
  return useQuery({
    queryKey: ['missions', profile?.id],
    queryFn: () => api.listUserMissions(profile!.id),
    enabled: !!profile,
  });
}
