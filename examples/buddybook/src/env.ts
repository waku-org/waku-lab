import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Define a global type for our environment variables
declare global {
  const __ENV__: {
    NODE_ENV: string;
    VITE_WALLETCONNECT_PROJECT_ID: string;
  }
}

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_WALLETCONNECT_PROJECT_ID: z.string().length(32, "WalletConnect Project ID must be 32 characters long"),
  },
  runtimeEnv: {
    VITE_WALLETCONNECT_PROJECT_ID: __ENV__.VITE_WALLETCONNECT_PROJECT_ID
  },
  emptyStringAsUndefined: true,
});
