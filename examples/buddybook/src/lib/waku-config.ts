import { type CreateWakuNodeOptions } from "@waku/sdk";

export const WAKU_NODE_OPTIONS: CreateWakuNodeOptions = {
  defaultBootstrap: true,
  nodeToUse: {
    store: "/dns4/store-02.ac-cn-hongkong-c.status.staging.status.im/tcp/443/wss/p2p/16Uiu2HAmU7xtcwytXpGpeDrfyhJkiFvTkQbLB9upL5MXPLGceG9K"
  }
};
