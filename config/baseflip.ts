// Deployed BaseFlip contract on Base mainnet (chain id 8453).

import type { Address } from "viem";

export const BASEFLIP_ADDRESS: Address =
  "0x47E9C83B9FBabf93EeB02Ca265Ac368bD093D31a";

export enum Side {
  BTC = 0,
  ETH = 1,
}

export const BASEFLIP_ABI = [
  {
    type: "function",
    name: "flip",
    stateMutability: "nonpayable",
    inputs: [{ name: "choice", type: "uint8" }],
    outputs: [
      { name: "result", type: "uint8" },
      { name: "win", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "getPlayer",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "totalFlips", type: "uint64" },
          { name: "wins", type: "uint64" },
          { name: "currentStreak", type: "uint32" },
          { name: "bestStreak", type: "uint32" },
          { name: "weeklyStreak", type: "uint32" },
          { name: "lastFlipWeek", type: "uint32" },
          { name: "lastFlipAt", type: "uint64" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "playerCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getPlayers",
    stateMutability: "view",
    inputs: [
      { name: "start", type: "uint256" },
      { name: "count", type: "uint256" },
    ],
    outputs: [
      { name: "addrs", type: "address[]" },
      {
        name: "players",
        type: "tuple[]",
        components: [
          { name: "totalFlips", type: "uint64" },
          { name: "wins", type: "uint64" },
          { name: "currentStreak", type: "uint32" },
          { name: "bestStreak", type: "uint32" },
          { name: "weeklyStreak", type: "uint32" },
          { name: "lastFlipWeek", type: "uint32" },
          { name: "lastFlipAt", type: "uint64" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "totalFlips",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "Flipped",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "choice", type: "uint8", indexed: false },
      { name: "result", type: "uint8", indexed: false },
      { name: "win", type: "bool", indexed: false },
      { name: "totalFlips", type: "uint64", indexed: false },
      { name: "currentStreak", type: "uint32", indexed: false },
      { name: "weeklyStreak", type: "uint32", indexed: false },
    ],
    anonymous: false,
  },
] as const;

export type BaseflipAbi = typeof BASEFLIP_ABI;
