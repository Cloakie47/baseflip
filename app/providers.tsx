"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { wagmiConfig } from "@/config/wagmi";

const ONCHAINKIT_API_KEY =
  process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ?? undefined;

export function Providers({
  cookie,
  children,
}: {
  cookie: string | null;
  children: React.ReactNode;
}) {
  const initialState = useMemo(
    () => cookieToInitialState(wagmiConfig, cookie),
    [cookie],
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider apiKey={ONCHAINKIT_API_KEY} chain={base}>
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
