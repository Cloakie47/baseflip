"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { decodeEventLog, encodeFunctionData, type Address, type Hex } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useChainId,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  BASEFLIP_ABI,
  BASEFLIP_ADDRESS,
  BASEFLIP_DATA_SUFFIX,
  Side,
} from "@/config/baseflip";

export type FlipPhase =
  | "idle"
  | "awaiting-wallet"
  | "confirming"
  | "done"
  | "error";

export type FlipOutcome = {
  choice: Side;
  result: Side;
  win: boolean;
  totalFlips: bigint;
  currentStreak: number;
  weeklyStreak: number;
  txHash: Hex;
};

type LogLike = { address: Hex; data: Hex; topics: readonly Hex[] };

function isUserRejection(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  // viem UserRejectedRequestError + common wallet messages.
  const code = (err as { code?: number; name?: string } | null)?.code;
  const name = (err as { name?: string } | null)?.name ?? "";
  if (code === 4001) return true;
  if (name === "UserRejectedRequestError") return true;
  return (
    msg.includes("user rejected") ||
    msg.includes("user denied") ||
    msg.includes("request rejected") ||
    msg.includes("rejected the request")
  );
}

function isInsufficientFunds(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  const name = (err as { name?: string } | null)?.name ?? "";
  if (name === "InsufficientFundsError") return true;
  return (
    msg.includes("insufficient funds") ||
    msg.includes("insufficient balance") ||
    msg.includes("exceeds the balance") ||
    msg.includes("gas required exceeds")
  );
}

function decodeFlippedLog(
  logs: readonly LogLike[],
  contract: Address,
  player: Address | undefined,
  choice: Side,
  txHash: Hex,
): FlipOutcome | null {
  const contractLower = contract.toLowerCase();
  for (const log of logs) {
    if (log.address.toLowerCase() !== contractLower) continue;
    try {
      const decoded = decodeEventLog({
        abi: BASEFLIP_ABI,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
        eventName: "Flipped",
      });
      const args = decoded.args as unknown as {
        player: Address;
        choice: number;
        result: number;
        win: boolean;
        totalFlips: bigint;
        currentStreak: number;
        weeklyStreak: number;
      };
      if (player && args.player.toLowerCase() !== player.toLowerCase()) {
        continue;
      }
      return {
        choice,
        result: args.result as Side,
        win: args.win,
        totalFlips: args.totalFlips,
        currentStreak: Number(args.currentStreak),
        weeklyStreak: Number(args.weeklyStreak),
        txHash,
      };
    } catch {
      // Not a Flipped event log, keep scanning.
    }
  }
  return null;
}

export function useFlip() {
  const queryClient = useQueryClient();
  const { address, connector } = useAccount();
  const chainId = useChainId();
  const isWrongChain = chainId !== base.id;

  const [phase, setPhase] = useState<FlipPhase>("idle");
  const [outcome, setOutcome] = useState<FlipOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeHash, setActiveHash] = useState<Hex | undefined>();
  const currentChoiceRef = useRef<Side | null>(null);

  const writeContract = useWriteContract();
  const sendTx = useSendTransaction();
  const txReceipt = useWaitForTransactionReceipt({
    hash: activeHash,
    chainId: base.id,
    query: { enabled: Boolean(activeHash) },
  });

  const reset = useCallback(() => {
    setPhase("idle");
    setOutcome(null);
    setError(null);
    setActiveHash(undefined);
    currentChoiceRef.current = null;
    writeContract.reset();
    sendTx.reset();
  }, [writeContract, sendTx]);

  const flip = useCallback(
    async (choice: Side) => {
      if (!address) {
        setError("Connect a wallet first.");
        setPhase("error");
        return;
      }
      if (isWrongChain) {
        setError("Switch to Base to flip.");
        setPhase("error");
        return;
      }

      setError(null);
      setOutcome(null);
      setActiveHash(undefined);
      currentChoiceRef.current = choice;
      setPhase("awaiting-wallet");

      // Base Account smart wallet: keep the writeContract path so the wallet's
      // AA flow is preserved and base.dev credits via the app_id mapping.
      // Any other connector (MetaMask, Rabby, generic injected): append the
      // ERC-8021 builder code suffix to the calldata so base.dev's indexer
      // credits these EOA flips to the same builder code.
      const isBaseAccount = connector?.id === "baseAccount";

      try {
        let hash: Hex;
        if (isBaseAccount) {
          hash = await writeContract.writeContractAsync({
            chainId: base.id,
            address: BASEFLIP_ADDRESS,
            abi: BASEFLIP_ABI,
            functionName: "flip",
            args: [choice],
          });
        } else {
          const callData = encodeFunctionData({
            abi: BASEFLIP_ABI,
            functionName: "flip",
            args: [choice],
          });
          const data = `${callData}${BASEFLIP_DATA_SUFFIX.slice(2)}` as Hex;
          hash = await sendTx.sendTransactionAsync({
            chainId: base.id,
            to: BASEFLIP_ADDRESS,
            data,
          });
        }
        setActiveHash(hash);
        setPhase("confirming");
      } catch (e) {
        currentChoiceRef.current = null;
        if (isUserRejection(e)) {
          // Quiet reset, no scary error in the UI.
          setError(null);
          setPhase("idle");
          return;
        }
        if (isInsufficientFunds(e)) {
          setError("You need a little ETH on Base for gas.");
          setPhase("error");
          return;
        }
        const message =
          e instanceof Error ? e.message : "Something went wrong.";
        setError(message);
        setPhase("error");
      }
    },
    [address, connector, isWrongChain, writeContract, sendTx],
  );

  // Decode the Flipped event from the receipt and finalize.
  useEffect(() => {
    if (phase !== "confirming") return;
    const receipt = txReceipt.data;
    const choice = currentChoiceRef.current;
    if (!receipt || choice === null) return;
    const decoded = decodeFlippedLog(
      receipt.logs,
      BASEFLIP_ADDRESS,
      address,
      choice,
      receipt.transactionHash,
    );
    if (decoded) {
      setOutcome(decoded);
      setPhase("done");
      // Refresh every read against BASEFLIP_ADDRESS so the StreakBar and
      // Leaderboard reflect the new flip immediately.
      void queryClient.invalidateQueries({ queryKey: ["baseflip"] });
      void queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [phase, txReceipt.data, address, queryClient]);

  // Bubble up errors that surface asynchronously after the write was accepted
  // (for example the tx reverts or the wait fails).
  useEffect(() => {
    if (phase !== "confirming") return;
    const err = txReceipt.error;
    if (!err) return;
    if (isInsufficientFunds(err)) {
      setError("You need a little ETH on Base for gas.");
    } else {
      setError(err.message);
    }
    setPhase("error");
  }, [phase, txReceipt.error]);

  const isBusy = useMemo(
    () => phase === "awaiting-wallet" || phase === "confirming",
    [phase],
  );

  return {
    flip,
    reset,
    phase,
    outcome,
    error,
    isBusy,
    isWrongChain,
  };
}
