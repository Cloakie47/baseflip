// Deployed BaseFlip contract on Base mainnet (chain id 8453).

import { stringToHex, type Address, type Hex } from "viem";

export const BASEFLIP_ADDRESS: Address =
  "0x47E9C83B9FBabf93EeB02Ca265Ac368bD093D31a";

// Base builder attribution. ERC-8021 Schema 0 suffix is appended to flip()
// calldata; contracts safely ignore trailing bytes past the function args.
export const BASEFLIP_BUILDER_CODE = "bc_ykjch1zi";

const ERC8021_MARKER = "80218021802180218021802180218021";

function buildErc8021Suffix(codes: readonly string[]): Hex {
  const joined = codes.join(",");
  const codesHex = stringToHex(joined).slice(2);
  const codesLen = joined.length.toString(16).padStart(2, "0");
  return `0x${codesLen}${codesHex}00${ERC8021_MARKER}` as Hex;
}

export const BASEFLIP_DATA_SUFFIX: Hex = buildErc8021Suffix([
  BASEFLIP_BUILDER_CODE,
]);

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
