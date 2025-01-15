import { StatusChangeArgs } from "./types";

const status = document.getElementById("status");
const chat = document.getElementById("chat-area");
const messages = document.getElementById("messages");

const nickInput = document.getElementById("nick") as HTMLInputElement;
const textInput = document.getElementById("text") as HTMLInputElement;
const sendButton = document.getElementById("send") as HTMLInputElement;

const connectWalletButton = document.getElementById("connect");

export const initUI = () => {
  const onStatusChange = ({ newStatus, className }: StatusChangeArgs) => {
    if (!status) {
      console.log("Status element not found.");
      return;
    }
    status.innerText = newStatus;
    status.className = className || "progress";
  };

  const onLoaded = () => {
    if (!chat) {
      console.log("Chat element not found.");
      return;
    }
    chat.style.display = "block";
  };

  const _renderMessage = (nick: string, text: string, timestamp: number, proofStatus: string) => {
    if (!messages) {
      console.log("Messages element not found.");
      return;
    }
    messages.innerHTML += `
            <li>
                (${nick})(${proofStatus})
                <strong>${text}</strong>
                <i>[${new Date(timestamp).toISOString()}]</i>
            </li>
        `;
  };

  type Events = {
    connectWallet: () => Promise<void>,
    onInitWaku: () => Promise<void>,
    onSubscribe: (cb: (nick: string, text: string, timestamp: number, proofStatus: string) => void) => void,
    onSend: (nick: string, text: string) => Promise<void>,
  }

  const registerEvents = (events: Events) => {
    if (!connectWalletButton) {
      console.log("Connect wallet button not found.");
      return;
    }

    if (!sendButton) {
      console.log("Send button not found.");
      return;
    }

    connectWalletButton.addEventListener("click", async () => {
      await events.connectWallet();
      await events.onInitWaku();

      onLoaded();

      events.onSubscribe((nick: string, text: string, timestamp: number, proofStatus: string) => {
        _renderMessage(nick, text, timestamp, proofStatus);
      });
  

      sendButton.addEventListener("click", async () => {
        if (!nickInput || !textInput) {
          console.log("Nick or text input not found.");
          return;
        }
        if (!events.onSend) {
          console.log("onSend event not found.");
          return;
        }

        const nick = nickInput.value;
        const text = textInput.value;
  
        if (!nick || !text) {
          console.log("Not sending message: missing nick or text.");
          return;
        }
  
        await events.onSend(nick, text);
        textInput.value = "";
      });
    });
  };

  return {
    registerEvents,
    onStatusChange,
  };
};
