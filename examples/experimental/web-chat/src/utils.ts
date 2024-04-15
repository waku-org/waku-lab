import type { Peer } from "@libp2p/interface";
import type { IFilter, ILightPushSDK, IStoreSDK } from "@waku/interfaces";

export async function handleCatch(
  promise?: Promise<Peer[]>
): Promise<Peer[] | undefined> {
  if (!promise) {
    return Promise.resolve(undefined);
  }

  try {
    return await promise;
  } catch (_) {
    return undefined;
  }
}

export function getPeerIdsForProtocol(
  protocol: IStoreSDK | ILightPushSDK | IFilter | undefined,
  peers: Peer[]
) {
  if (!protocol) {
    return [];
  }
  const multicodec =
    "multicodec" in protocol
      ? protocol.multicodec
      : protocol.protocol.multicodec;
  return peers.filter((p) => p.protocols.includes(multicodec)).map((p) => p.id);
}
