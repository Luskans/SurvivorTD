import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";
import { Room } from "colyseus.js";

export class ChatUI {
  private room: Room<LobbyState>;
  private messagesEl: HTMLElement;

  constructor(room: Room<LobbyState>) {
    this.room = room;
    this.messagesEl = document.getElementById("chat-messages")!;
    this.attach();
  }

  attach() {
    this.room.onMessage("chat", (msg: any) => {
      this.append(`${this.escape(msg.from ?? "anon")}: ${this.escape(msg.text)}`);
    });

    this.room.onMessage("sys", (text: string) => {
      this.appendSys(String(text));
    });

    const sendBtn = document.getElementById("chat-send-btn")!;
    
    sendBtn.onclick = () => {
      const v = input.value.trim();
      if (!v) return;
      this.room.send("chat", v);
      input.value = "";
    };
    
    const input = document.getElementById("chat-text") as HTMLInputElement;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const v = input.value.trim();
        if (!v) return;
        this.room.send("chat", v);
        input.value = "";
      }
    });
  }

  append(text: string) {
    const d = document.createElement("div");
    d.textContent = text;
    this.messagesEl.appendChild(d);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  appendSys(text: string) {
    const d = document.createElement("div");
    d.className = "sys";
    d.textContent = text;
    this.messagesEl.appendChild(d);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  private escape(s: string) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  systemMessage(text: string) { this.appendSys(text); }
}