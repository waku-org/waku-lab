import { createRLN, Keystore, extractMetaMaskSigner } from "@waku/rln";
import { createLightNode, waitForRemotePeer } from "@waku/sdk";
import { randomNumber } from "./utils";
import { SIGNATURE_MESSAGE } from "./const";
import protobuf from "protobufjs";

export const CONTENT_TOPIC = "/toy-chat/2/luzhou/proto";
export const ProtoChatMessage = new protobuf.Type("ChatMessage")
  .add(new protobuf.Field("timestamp", 1, "uint64"))
  .add(new protobuf.Field("nick", 2, "string"))
  .add(new protobuf.Field("text", 3, "string"));


export async function initRLN({ onStatusChange }) {
  onStatusChange("Initializing RLN...");

  let rln;
  let encoder;
  let decoder;
  let node;
  try {
    rln = await createRLN();
  } catch (err) {
    onStatusChange(`Failed to initialize RLN: ${err}`, "error");
    throw Error(err);
  }

  onStatusChange("RLN initialized. Initializing Waku...");
  node = await createLightNode({
    defaultBootstrap: true,
  });
  onStatusChange("Waiting for peers");
  await node.start();
  await waitForRemotePeer(node);
  onStatusChange("RLN initialized. Waku peer connected.", "success");

  const connectWallet = async () => {
    let signer;
    try {
      onStatusChange("Connecting to wallet...");
      signer = await extractMetaMaskSigner();
      console.log("connected metamask")
    } catch (err) {
      onStatusChange(`Failed to access MetaMask: ${err}`, "error");
      throw Error(err);
    }
    console.log("reading local keystore")
    try {
      onStatusChange("Connecting to Ethereum...");
      const localKeystore = readLocalKeystore();
      console.log("got local keystore")
      console.log(localKeystore)
      rln.keystore = Keystore.fromString(localKeystore);

      await rln.start({ signer, fetchMembersFromService: true });
    } catch (err) {
      onStatusChange(`Failed to connect to Ethereum: ${err}`, "error");
      throw Error(err);
    }

    onStatusChange("RLN started", "success");
  };

  const registerCredential = async (password) => {
    if (!rln.signer) {
      alert("RLN is not initialized. Try connecting wallet first.");
      return;
    }

    const signature = await rln.signer.signMessage(
      `${SIGNATURE_MESSAGE}. Nonce: ${randomNumber()}`
    );

    const credential = await rln.registerMembership({ signature });
    if (!rln.keystore) {
      rln.keystore = Keystore.create();
    }
    const credStr = JSON.stringify({
      treeIndex: credential.membership.treeIndex,
      identityCredential: {
        idCommitment: credential.identity.IDCommitment,
        idNullifier: credential.identity.IDNullifier,
        idSecretHash: credential.identity.IDSecretHash,
        idTrapdoor: credential.identity.IDTrapdoor
      },
      membershipContract: {
        chainId: credential.membership.chainId,
        address: credential.membership.address
      }
    });
    console.log(credential)
    console.log(credStr)
    const hash = await rln.keystore.addCredential(credential, password);
    console.log(rln.keystore)

    return { hash, credential };
  };

  const readKeystoreOptions = () => {
    return rln.keystore?.keys();
  };

  const readCredential = async (hash, password) => {
    return rln.keystore.readCredential(hash, password);
  };

  const saveLocalKeystore = () => {
    const keystoreStr = rln.keystore.toString();
    localStorage.setItem("keystore", keystoreStr);
    return keystoreStr;
  };

  const importLocalKeystore = (keystoreStr) => {
    rln.keystore = Keystore.fromString(keystoreStr) || Keystore.create();
  };

  const createEncoderDecoder = async (credentials) => {
    encoder = await rln.createEncoder({
      ephemeral: false,
      contentTopic: CONTENT_TOPIC,
      credentials,
      fetchMembersFromService: true
    });
    decoder = rln.createDecoder(CONTENT_TOPIC);

    return { encoder, decoder }
  }

  const onSend = async (nick, text) => {
    const timestamp = new Date();
    const msg = ProtoChatMessage.create({
      text,
      nick,
      timestamp: Math.floor(timestamp.valueOf() / 1000),
    });
    const payload = ProtoChatMessage.encode(msg).finish();
    console.log("Sending message with proof...");

    const res = await node.lightPush.send(encoder, { payload, timestamp });
    console.log("Message sent:", res);
  };

  return {
    rln,
    connectWallet,
    registerCredential,
    readKeystoreOptions,
    readCredential,
    saveLocalKeystore,
    importLocalKeystore,
    createEncoderDecoder,
    onSend
  };
}

function readLocalKeystore() {
  return localStorage.getItem("keystore") || "";
}
