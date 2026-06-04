# Baseflip

A free, gas-sponsored coinflip mini app on Base. Pick a side (Bitcoin or Ethereum),
flip, the result is recorded onchain. Tracks win streaks, a weekly streak, and a
leaderboard. Built as a Farcaster / Base App mini app, mobile-first.

This file is the build brief. Follow it. Ask before inventing scope.

## Hard rules

- No em dashes anywhere in UI copy, comments, or commit messages. Use commas or periods.
- Mobile-first. Design for a ~390px viewport first, scale up second.
- Every flip is a real onchain transaction. "Free" means gas is sponsored, not absent.
- Do not put any private keys, RPC keys, or secrets in client code or in git. Use env vars.

## Stack

- Next.js (App Router, TypeScript, Tailwind)
- wagmi + viem + @tanstack/react-query
- @base-org/account (Base Account smart wallet connector)
- @coinbase/onchainkit (identity / name resolution)
- Foundry for the contract (BaseFlip.sol, already written, in /contracts/src)
- Solidity ^0.8.20

## Networks

- Primary target: Base mainnet (chain id 8453).
- Test on Base Sepolia (84532) first, then flip to mainnet.
- Keep both chains in the wagmi config during development; ship pointing at mainnet.
- RPC: `https://mainnet.base.org` and `https://sepolia.base.org`. If either rate-limits,
  swap to a PublicNode endpoint (`https://base-rpc.publicnode.com`,
  `https://base-sepolia-rpc.publicnode.com`).

## Project structure

```
/contracts            Foundry project, BaseFlip.sol in src/
/config/wagmi.ts       wagmi config (base + baseSepolia)
/config/baseflip.ts    contract address + ABI (export `as const`)
/app/providers.tsx     WagmiProvider + QueryClientProvider + OnchainKitProvider
/app/page.tsx          assembles the game
/components/Coin.tsx           the flipping coin (BTC / ETH faces)
/components/ChoiceButtons.tsx  Bitcoin / Ethereum picker that triggers the flip
/components/FlipResult.tsx     win / lose animation + result text
/components/StreakBar.tsx      current streak, best streak, weekly streak
/components/Leaderboard.tsx    reads getPlayers, sorts client-side, resolves names
/components/ConnectWallet.tsx  handles all four connection states
/hooks/useFlip.ts              the write + receipt + event-decode flow
/hooks/useDisplayName.ts       Base name first, ENS fallback, address fallback
/hooks/useWalletCapabilities.ts  batch + paymaster detection
```

## Contract interface (BaseFlip.sol)

Already written. Key surface:

- `flip(uint8 choice)` where `0 = BTC`, `1 = ETH`. Returns `(uint8 result, bool win)`.
- Emits `Flipped(address indexed player, uint8 choice, uint8 result, bool win, uint64 totalFlips, uint32 currentStreak, uint32 weeklyStreak)`.
- `getPlayer(address) -> Player` struct: `totalFlips, wins, currentStreak, bestStreak, weeklyStreak, lastFlipWeek, lastFlipAt, exists`.
- `playerCount() -> uint256`.
- `getPlayers(uint256 start, uint256 count) -> (address[], Player[])` for the leaderboard.

Set the deployed address in `config/baseflip.ts`. Define the ABI with `as const` or wagmi
cannot infer types.

## The flip flow (useFlip.ts)

1. User picks a side. The choice triggers the transaction directly (no separate confirm step).
2. Detect capabilities first (see useWalletCapabilities). If the wallet supports the
   paymaster service, send via `useSendCalls` with the `paymasterService` capability so the
   flip is sponsored (free for the user). Otherwise fall back to `useWriteContract` (EOA pays
   its own small gas).
3. Wait for the receipt (`useWaitForTransactionReceipt` for the write path,
   `useWaitForCallsStatus` for the batched path).
4. Decode the `Flipped` event from the receipt logs with viem `decodeEventLog` to get
   `result` and `win`. Drive the coin landing + win/lose animation from that. Do NOT guess
   the result client-side; it must come from the onchain event.
5. On success, invalidate the leaderboard + getPlayer queries so streaks refresh.
6. Surface the three states clearly: waiting for wallet, confirming onchain, done.
7. Always handle wrong-network: if `chainId !== base.id`, show a "Switch to Base" button
   using `useSwitchChain` before allowing a flip. Never call the write while on the wrong chain.

## Free gas (Paymaster)

- Use a CDP Paymaster. Create a gas policy in the CDP portal, allowlist the BaseFlip
  contract address and the `flip` function, set a per-user and total budget cap.
- Pass the paymaster URL through an env var, read it server-side, never expose a key client-side.
- Because flips are free and sponsored, a script can spam flips. Cap the policy budget and
  rank the leaderboard on streaks (below) rather than raw flip count to kill the spam incentive.
- Optional ERC-8021 builder code: attach the builder code to flips for Base builder
  attribution if desired. Confirm the current encoding before wiring it.

## Name resolution (useDisplayName.ts)

Resolve an address to a human name with this priority, using OnchainKit:

1. Basename: `useName({ address, chain: base })`.
2. If null, ENS: `useName({ address })` (no chain = mainnet ENS).
3. If still null, truncate: `0x1234...abcd`.

Return `{ name, isLoading }`. Use it in the leaderboard and in the connected-wallet header.

## Leaderboard (Leaderboard.tsx)

- Read `playerCount()`, then page through `getPlayers(start, count)` (e.g. 100 at a time).
- Sort client-side. Default sort: best streak, then weekly streak, then wins. Offer a tab
  to switch the metric. Avoid leading with raw flip count (spam-prone, see Paymaster note).
- Show rank, resolved name (useDisplayName), the metric value, and medals for top 3.
- Highlight the connected user's own row.

## Design system

Base-blue, gamified, arcade energy. Mobile-first.

### Color tokens (CSS variables)

```
--base-blue:    #0052FF;  /* primary action, accents */
--base-blue-2:  #2A6BFF;  /* hover / lighter accent */
--bg-deep:      #0A1530;  /* app background, deep navy */
--bg-panel:     #0F1E3D;  /* cards / panels */
--ink:          #EAF1FF;  /* primary text */
--ink-dim:      #8AA0CC;  /* secondary text */
--win:          #2CD673;  /* win green */
--lose:         #FF4D5E;  /* lose red */
--btc:          #F7931A;  /* bitcoin orange */
--eth:          #627EEA;  /* ethereum periwinkle */
--gold:         #FFCB45;  /* streak / medals */
```

Background: deep navy with a subtle radial blue glow behind the coin. Glassy panels with
soft blue borders and a faint outer glow. Rounded corners, chunky tappable buttons.

### The coin (Coin.tsx)

- A circular coin with two faces: BTC side (bitcoin orange face, ₿ / bitcoin mark) and ETH
  side (ethereum periwinkle face, the ETH diamond). Use clean SVG marks, not raster logos.
- Idle: a slow gentle bob + soft shadow so it feels alive.
- Flipping: a 3D CSS transform spin (`rotateX` or `rotateY`, multiple full turns,
  ~1.2 to 1.8s, ease-out so it decelerates into the result). Use `transform-style: preserve-3d`
  and `backface-visibility: hidden` on the two faces.
- The coin must land showing the actual onchain result face. Compute final rotation from the
  decoded event so the visible face matches `result`.
- Add motion blur / a streaking glow mid-spin for arcade feel.

### Choice buttons (ChoiceButtons.tsx)

- Two big buttons below the coin: "Bitcoin" (btc orange) and "Ethereum" (eth periwinkle),
  each with its mark.
- Tapping a side IS the action: it selects and fires the flip in one tap.
- While a flip is in flight, disable both and show the inline state ("Flipping...",
  "Confirming...").

### Win animation (FlipResult.tsx)

- Coin lands on the user's side with a satisfying bounce + scale pop.
- Green glow burst, confetti, and the streak counter ticks up with a bounce.
- Short rising chime. Trigger `navigator.vibrate(40)` on mobile for a haptic tap.
- Banner: "WIN" in win green, plus the streak (e.g. "3 in a row").

### Lose animation (FlipResult.tsx) -- requested, make it feel bad in a fun way

- Coin lands on the opposite side, then a quick screen shake (translate jitter ~250ms).
- Red flash vignette around the edges, the coin desaturates / dims briefly, a small
  "crack" overlay on the coin.
- The streak counter visibly snaps back to 0 with a downward drop + a soft "deflate" sound.
- Trigger `navigator.vibrate([20, 40, 20])` for a stutter haptic.
- Banner: "MISS" in lose red. Keep it playful, not punishing. Offer an immediate "Flip again".

### Gamified elements

- Persistent streak bar up top: current streak (flame icon, gold), best streak, weekly streak.
- A weekly streak badge that fills as the week's flips land.
- Sound on / off toggle, default on but respectful (short, soft sounds only).
- Subtle particle / star field in the background for arcade ambience.
- Everything responds to touch with quick scale / glow feedback. No sluggish transitions.

### Sounds

- Use the Web Audio API or short audio files for: flip whoosh, win chime, lose deflate, tap.
- Gate all sound behind the toggle and behind a user gesture (browsers block autoplay).

## Wagmi gotchas (from the Base quickstart, do not skip)

- `ssr: true` + `cookieStorage` to avoid hydration mismatches.
- Handle all four `useAccount` states (isConnecting, isReconnecting, isConnected,
  isDisconnected), not just isConnected, or the UI flashes on load.
- `useReadContract` caches and does not auto-refetch after a write. Invalidate the query key
  on success.
- `useChainId()` is the wallet's chain, not your deploy chain. Check capabilities and gate
  writes against `base.id` explicitly.
- Never call `useSendCalls` unless capabilities confirm batching/paymaster support; it throws
  on a plain EOA.

## Build order

1. Scaffold + wagmi config + providers (base + baseSepolia) + OnchainKitProvider.
2. ConnectWallet with all four states.
3. Deploy BaseFlip.sol to Base Sepolia with Foundry, set the address in config/baseflip.ts.
4. Coin + ChoiceButtons + useFlip, wired to Sepolia, result driven by the decoded event.
5. Win / lose animations + sounds + haptics.
6. StreakBar + leaderboard with name resolution.
7. Wire the Paymaster so flips are sponsored; test the EOA fallback path too.
8. Redeploy to Base mainnet, point config at mainnet, retest end to end.
9. Add the Farcaster / Base App mini app manifest so it embeds and launches in-app.
