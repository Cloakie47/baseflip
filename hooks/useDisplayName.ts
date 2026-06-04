"use client";

import { useName } from "@coinbase/onchainkit/identity";
import { base } from "wagmi/chains";
import type { Address } from "viem";

function truncate(addr: Address) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function useDisplayName(address?: Address) {
  // Basename first.
  const baseQ = useName({ address: address as Address, chain: base });
  // ENS fallback (mainnet, default chain when none passed).
  const ensQ = useName({ address: address as Address });

  if (!address) {
    return { name: "", isLoading: false } as const;
  }

  if (baseQ.isLoading || ensQ.isLoading) {
    return { name: truncate(address), isLoading: true } as const;
  }

  if (baseQ.data) return { name: baseQ.data, isLoading: false } as const;
  if (ensQ.data) return { name: ensQ.data, isLoading: false } as const;

  return { name: truncate(address), isLoading: false } as const;
}
