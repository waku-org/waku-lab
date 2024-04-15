import { initUI } from "./ui";
import { initRLN } from "./rln";
import { initWaku } from "./waku";

async function run() {
  const { onStatusChange, registerEvents } = initUI();
  const { rln, connectWallet } = await initRLN(onStatusChange);
  const { onSend, onSubscribe, onInitWaku } = await initWaku({
    rln,
    onStatusChange,
  });

  registerEvents({ onSend, onSubscribe, connectWallet, onInitWaku });
}

run();
