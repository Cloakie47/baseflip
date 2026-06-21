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

  // Prefer EIP-6963-discovered connectors so each entry is a specific wallet
  // (MetaMask, Rabby, etc.). Fall back to the generic injected connector only
  // when nothing was discovered, so we never duplicate the same wallet.
  const otherWallets = useMemo<Connector[]>(() => {
    const baseAccountId = "baseAccount";
    const eip6963 = connectors.filter(
      (c) =>
        c.type === "injected" && c.id !== "injected" && c.id !== baseAccountId,
    );
    if (eip6963.length > 0) return eip6963;
    const legacy = connectors.find((c) => c.id === "injected");
    return legacy ? [legacy] : [];
  }, [connectors]);

  if (!mounted || isReconnecting || isConnecting) {
    return (
      <button className="btn btn-ghost" style={{ padding: "10px 14px" }} disabled>
        <span className="opacity-75 text-sm">Loading...</span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <button
        className="btn btn-ghost"
        style={{ padding: "10px 14px" }}
        onClick={() => disconnect()}
        title="Disconnect"
      >
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: "var(--win)" }}
        />
        <span className="truncate max-w-[120px] text-sm">{name}</span>
      </button>
    );
  }

  if (!isDisconnected && isConnected) return null;

  const baseAccount =
    connectors.find((c) => c.id === "baseAccount") ?? connectors[0];

  return (
    <div ref={wrapperRef} className="relative flex items-center gap-1.5">
      <button
        className="btn btn-primary"
        style={{ padding: "10px 14px", fontSize: 14 }}
        disabled={isConnectPending}
        onClick={() => baseAccount && connect({ connector: baseAccount })}
      >
        {isConnectPending ? "Connecting..." : "Sign in with Base"}
      </button>
      {otherWallets.length > 0 && (
        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: "10px 12px", fontSize: 12 }}
          disabled={isConnectPending}
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
          onClick={() => setPickerOpen((o) => !o)}
        >
          <span>Other wallets</span>
          <span aria-hidden="true" style={{ opacity: 0.8, marginLeft: 2 }}>
            ▾
          </span>
        </button>
      )}
      {pickerOpen && otherWallets.length > 0 && (
        <div
          role="menu"
          className="glass absolute right-0 top-full mt-2 z-30 p-2 flex flex-col gap-1"
          style={{ width: 280 }}
        >
          <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-ink-dim">
            Other wallets
          </div>
          {otherWallets.map((c) => (
            <button
              key={c.uid}
              type="button"
              role="menuitem"
              disabled={isConnectPending}
              className="flex items-center gap-3 w-full text-left transition disabled:opacity-50"
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
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
                  width={28}
                  height={28}
                  style={{ borderRadius: 8 }}
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-block"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-sm truncate">
                  {c.name}
                </div>
                <div className="text-[10px] text-ink-dim">
                  Pay your own gas
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
