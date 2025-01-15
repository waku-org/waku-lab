import { RLNInstance, createRLN, extractMetaMaskSigner } from "@waku/rln";
import { Signer } from "ethers";
import { StatusChangeArgs } from "./types";

export async function initRLN(onStatusChange: ({}: StatusChangeArgs) => void) {
  onStatusChange({
    newStatus: "Initializing RLN..."
  });

  let rln: RLNInstance;
  try {
    console.time("createRLN")
    rln = await createRLN();
    console.timeEnd("createRLN")
  } catch (err) {
    onStatusChange({
      newStatus: `Failed to initialize RLN: ${err}`,
      className: "error"
    });
    throw err;
  }

  onStatusChange({
    newStatus: "RLN initialized",
    className: "success"
  });

  const connectWallet = async () => {
    let signer: Signer;
    try {
      onStatusChange({
        newStatus: "Connecting to wallet..."
      });
      signer = await extractMetaMaskSigner();
      console.log("done")
    } catch (err) {
      onStatusChange({
        newStatus: `Failed to access MetaMask: ${err}`,
        className: "error"
      });
      throw err;
    }

    try {
      onStatusChange({
        newStatus: "Connecting to Ethereum..."
      });
      await rln.start({ signer });
    } catch (err) {
      onStatusChange({
        newStatus: `Failed to connect to Ethereum: ${err}`,
        className: "error"
      });
      throw err;
    }

    onStatusChange({
      newStatus: "RLN started",
      className: "success"
    });
  };

  return {
    rln,
    connectWallet,
  };
}
