"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useDisplayName } from "@/hooks/useDisplayName";

export function ConnectWallet() {
  const {
    address,
    isConnected,
    isConnecting,
    isReconnecting,
    isDisconnected,
  } = useAccount();
  const { connectors, connect, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { name } = useDisplayName(address);

  // Avoid SSR/CSR hydration flash, render the placeholder until mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || isReconnecting || isConnecting) {
    return (
      <button className="btn btn-ghost min-w-[140px]" disabled>
        <span className="opacity-75">Loading...</span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <button
        className="btn btn-ghost min-w-[140px]"
        onClick={() => disconnect()}
        title="Disconnect"
      >
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: "var(--win)" }}
        />
        <span className="truncate max-w-[140px]">{name}</span>
      </button>
    );
  }

  // Disconnected. Prefer Base Account connector when present.
  const baseAccount =
    connectors.find((c) => c.id === "baseAccount") ?? connectors[0];

  if (isDisconnected || !isConnected) {
    return (
      <button
        className="btn btn-primary min-w-[140px]"
        disabled={isConnectPending}
        onClick={() => baseAccount && connect({ connector: baseAccount })}
      >
        {isConnectPending ? "Connecting..." : "Sign in with Base"}
      </button>
    );
  }

  return null;
}
