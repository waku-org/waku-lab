import { Peer } from "@libp2p/interface";
import type { LightNode } from "@waku/sdk";

export const generateRandomNumber = (): number => {
    return Math.floor(Math.random() * 1000000);
  };
  
export const sha256 = async (number: number | string ): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(number.toString());
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

const DEFAULT_EXTRA_DATA = { sdk: "0.0.28" };
export const DEFAULT_EXTRA_DATA_STR = JSON.stringify(DEFAULT_EXTRA_DATA);

export const buildExtraData = async (node: LightNode, peerId: string): Promise<string> => {
  let extraData = { ...DEFAULT_EXTRA_DATA };
  const peer: Peer = (await node.libp2p.peerStore.all()).find(p => p.id.toString() === peerId);

  if (!peer || peerId === node.libp2p.peerId.toString()) {
    return JSON.stringify(extraData);
  }

  const websocket = peer
    .addresses
    .map(addr => addr.multiaddr.toString())
    .some(addr => addr.includes("ws") || addr.includes("wss"));

  return JSON.stringify({
    ...extraData,
    peerId,
    websocket,
    enabledProtocols: peer.protocols,
  });
};