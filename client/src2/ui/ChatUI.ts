// import { Room } from "colyseus.js";

// export class ChatUI {
//   constructor(room: Room) {
//     const chatMessages = document.getElementById("chat-messages")!;

//     room.onMessage("chat", (msg) => {
//       chatMessages.innerHTML += `<div><b>${msg.from}</b>: ${msg.text}</div>`;
//       chatMessages.scrollTo(0, chatMessages.scrollHeight);
//     });

//     document.getElementById("chat-send-btn")!.onclick = () => {
//       const input = document.getElementById("chat-text") as HTMLInputElement;
//       if (input.value.trim()) {
//         room.send("chat", input.value);
//         input.value = "";
//       }
//     };
//   }

//   systemMessage(text: string) {
//     const chatMessages = document.getElementById("chat-messages")!;
//     chatMessages.innerHTML += `<div class="sys">${text}</div>`;
//   }
// }





export class ChatUI {
  private room: any;
  private messagesEl: HTMLElement;

  constructor(room: any) {
    this.room = room;
    this.messagesEl = document.getElementById("chat-messages")!;
    this.attach();
  }

  attach() {
    // receive chat messages and system messages from room
    this.room.onMessage("chat", (msg: any) => {
      this.append(`${this.escape(msg.from ?? "anon")}: ${this.escape(msg.text)}`);
    });

    this.room.onMessage("sys", (text: string) => {
      this.appendSys(String(text));
    });

    const sendBtn = document.getElementById("chat-send-btn")!;
    const input = document.getElementById("chat-text") as HTMLInputElement;

    sendBtn.onclick = () => {
      const v = input.value.trim();
      if (!v) return;
      this.room.send("chat", v);
      input.value = "";
    };
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
