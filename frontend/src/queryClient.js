import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes cache freshness
      gcTime: 1000 * 60 * 15, // 15 minutes in memory cache
      refetchOnWindowFocus: false, // smooth experience without unnecessary background network spam
      retry: 1, // retry once on transient network failure
    },
  },
});
