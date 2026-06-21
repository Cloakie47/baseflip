"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect, type Connector } from "wagmi";
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

  const [pickerOpen, setPickerOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [pickerOpen]);

  // Dedupe alternative wallets. Prefer EIP-6963-discovered connectors (each is
  // a specific extension like MetaMask or Rabby) and only fall back to the
  // generic `injected` connector when nothing was discovered.
  const otherWallets = useMemo<Connector[]>(() => {
    const baseAccountId = "baseAccount";
    const eip6963 = connectors.filter(
      (c) => c.type === "injected" && c.id !== "injected" && c.id !== baseAccountId,
    );
    if (eip6963.length > 0) return eip6963;
    const legacy = connectors.find((c) => c.id === "injected");
    return legacy ? [legacy] : [];
  }, [connectors]);

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

  if (!isDisconnected && isConnected) return null;

  const baseAccount =
    connectors.find((c) => c.id === "baseAccount") ?? connectors[0];

  return (
    <div ref={wrapperRef} className="relative flex items-center gap-1">
      <button
        className="btn btn-primary min-w-[140px]"
        disabled={isConnectPending}
        onClick={() => baseAccount && connect({ connector: baseAccount })}
      >
        {isConnectPending ? "Connecting..." : "Sign in with Base"}
      </button>
      {otherWallets.length > 0 && (
        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: "10px 12px" }}
          disabled={isConnectPending}
          aria-label="Use a different wallet"
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
          onClick={() => setPickerOpen((o) => !o)}
        >
          <span aria-hidden="true">▾</span>
        </button>
      )}
      {pickerOpen && otherWallets.length > 0 && (
        <div
          role="menu"
          className="glass absolute right-0 top-full mt-2 z-30 p-2 min-w-[220px] flex flex-col gap-1"
        >
          <div className="px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ink-dim">
            Other wallets
          </div>
          {otherWallets.map((c) => (
            <button
              key={c.uid}
              type="button"
              role="menuitem"
              disabled={isConnectPending}
              className="btn btn-ghost justify-start"
              style={{ padding: "10px 12px", borderRadius: 14 }}
              onClick={() => {
                setPickerOpen(false);
                connect({ connector: c });
              }}
            >
              {c.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.icon}
                  alt=""
                  width={20}
                  height={20}
                  className="rounded"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-block w-5 h-5 rounded"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
              )}
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
