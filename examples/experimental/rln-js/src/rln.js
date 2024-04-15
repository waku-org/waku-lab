import { createRLN, extractMetaMaskSigner } from "@waku/rln";

export async function initRLN(onStatusChange) {
  onStatusChange("Initializing RLN...");

  let rln;
  try {
    rln = await createRLN();
  } catch (err) {
    onStatusChange(`Failed to initialize RLN: ${err}`, "error");
    throw Error(err);
  }

  onStatusChange("RLN initialized", "success");

  const connectWallet = async () => {
    let signer;
    try {
      onStatusChange("Connecting to wallet...");
      signer = await extractMetaMaskSigner();
    } catch (err) {
      onStatusChange(`Failed to access MetaMask: ${err}`, "error");
      throw Error(err);
    }

    try {
      onStatusChange("Connecting to Ethereum...");
      await rln.start({ signer });
    } catch (err) {
      onStatusChange(`Failed to connect to Ethereum: ${err}`, "error");
      throw Error(err);
    }

    onStatusChange("RLN started", "success");
  };

  return {
    rln,
    connectWallet,
  };
}
