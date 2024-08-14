import { TELEMETRY_URL } from "./constants";
import { TelemetryClient } from "./lib/telemetry/client";
import { setupWaku } from "./lib/waku";
import { EVENTS } from "./lib/waku/events";
import { startFilterSubscription } from "./lib/waku/filter";
import { startLightPushSequence } from "./lib/waku/lightpush";

(async () => {
  const telemetryClient = new TelemetryClient(TELEMETRY_URL, 5000);
  const waku = await setupWaku();
  (window as any).waku = waku;

  const runningScreen = document.getElementById("runningScreen");
  runningScreen.style.display = "block";

  await telemetryClient.start();
  startFilterSubscription(waku, telemetryClient);

  let sentMessagesCount = 0;
  const sentMessagesCounter = document.getElementById(
    "numSent"
  ) as HTMLSpanElement;
  document.addEventListener("messageSent", () => {
    sentMessagesCount++;
    sentMessagesCounter.textContent = sentMessagesCount.toString();
  });

  document.addEventListener(EVENTS.SEQUENCE_COMPLETED.type, async () => await startLightPushSequence(waku, telemetryClient));
  await startLightPushSequence(waku, telemetryClient);
})();
