import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";

const APP_NAME = "Baseflip";

export function buildWagmiConfig() {
  return createConfig({
    chains: [base],
    connectors: [
      baseAccount({ appName: APP_NAME }),
      injected({ shimDisconnect: true }),
    ],
    ssr: true,
    storage: createStorage({ storage: cookieStorage }),
    transports: {
      [base.id]: http("https://mainnet.base.org"),
    },
  });
}

export const wagmiConfig = buildWagmiConfig();

export type AppWagmiConfig = ReturnType<typeof buildWagmiConfig>;
