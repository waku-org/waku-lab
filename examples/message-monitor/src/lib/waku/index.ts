import { createLightNode, waitForRemotePeer } from "@waku/sdk";
import { nodes as bootstrap, DEFAULT_CONTENT_TOPIC } from "../../constants";
import { multiaddr } from '@multiformats/multiaddr'

export async function setupWaku() {
  const waku = await createLightNode({
    networkConfig: {
      contentTopics: [DEFAULT_CONTENT_TOPIC]
    },
    defaultBootstrap: true
  });
  await waku.start();
  await Promise.all(getBootstrapNodes().map((node) => waku.dial(node)));
  await waitForRemotePeer(waku);

  return waku;
}

function getBootstrapNodes(nodes: string[] = bootstrap) {
  return bootstrap.map((node) => multiaddr(node));
}