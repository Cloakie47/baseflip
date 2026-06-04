"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

export function SwitchChainButton() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (chainId === base.id) return null;

  return (
    <button
      className="btn btn-primary w-full"
      disabled={isPending}
      onClick={() => switchChain({ chainId: base.id })}
    >
      {isPending ? "Switching..." : "Switch to Base"}
    </button>
  );
}
