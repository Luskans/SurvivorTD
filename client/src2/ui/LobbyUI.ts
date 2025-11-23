// import { network } from "../networking/NetworkService";
// import { ScreenManager } from "./ScreenManager";
// import { getStateCallbacks } from "colyseus.js";
// import { ChatUI } from "./ChatUI";

// export class LobbyUI {
//   private countdown: number | null = null;
//   private chatUI: ChatUI;

//   constructor() {
//     this.chatUI = new ChatUI(network.room!);
//     this.initListeners();
//     this.refreshPlayers();
//   }

//   initListeners() {
//     const room = network.room!;
//     const $ = getStateCallbacks(room);

//     const readyBtn = document.getElementById("ready-btn")!;
//     readyBtn.onclick = () => network.toggleReady();

//     document.getElementById("leave-btn")!.onclick = () => {
//       if (this.countdown && this.countdown <= 3) return;
//       network.leaveRoom();
//       ScreenManager.show("home-screen");
//     };

//     $(room.state.players).onAdd(() => this.refreshPlayers());
//     $(room.state.players).onRemove(() => this.refreshPlayers());
//     $(room.state.players).onChange(() => this.refreshPlayers());

//     room.onMessage("countdown", (sec) => this.handleCountdown(sec));
//   }

//   refreshPlayers() {
//     const list = document.getElementById("players-list")!;
//     list.innerHTML = "";

//     network.room!.state.players.forEach(p => {
//       const div = document.createElement("div");
//       div.className = "player-entry";
//       div.innerHTML = `
//         <span class="name">${p.name}</span>
//         <span class="elo">${p.elo}</span>
//         <span class="state">${p.ready ? "✔" : "⏳"}</span>
//         ${p.isHost ? "👑" : ""}
//       `;
//       list.appendChild(div);
//     });
//   }

//   handleCountdown(sec: number) {
//     this.countdown = sec;
//     this.chatUI.systemMessage(`Début dans ${sec}…`);

//     const readyBtn = document.getElementById("ready-btn")!;
//     const leaveBtn = document.getElementById("leave-btn")!;

//     if (sec <= 3) {
//       readyBtn.setAttribute("disabled", "true");
//       leaveBtn.setAttribute("disabled", "true");
//     }
//   }
// }







import { getStateCallbacks } from "colyseus.js";
import { network } from "../networking/NetworkService";
import { ChatUI } from "./ChatUI";

/**
 * LobbyUI is instantiated with a Colyseus Room instance (any)
 * It registers state callbacks and updates the DOM.
 */
export class LobbyUI {
  private room: any;
  private chat: ChatUI;
  private countdownTimer: number | null = null;
  private locked = false;

  constructor(room: any) {
    this.room = room;
    this.chat = new ChatUI(room);
    this.init();
  }

  init() {
    this.setupButtons();
    this.setupStateListeners();
  }

  setupButtons() {
    const readyBtn = document.getElementById("ready-btn") as HTMLButtonElement;
    const leaveBtn = document.getElementById("leave-btn") as HTMLButtonElement;

    readyBtn.onclick = () => {
      if (this.locked) return;
      network.toggleReady();
    };

    leaveBtn.onclick = () => {
      if (this.locked) return;
      network.leaveRoom();
      document.getElementById("room-code-container")?.classList.add("hidden");
      document.getElementById("room-code")!.textContent = "";
      // go back to home
      document.getElementById("lobby-screen")!.classList.add("hidden");
      document.getElementById("home-screen")!.classList.remove("hidden");
    };
  }

  setupStateListeners() {
    const $ = getStateCallbacks(this.room);

    // players is a MapSchema on the server
    // ensure existence before attaching
    const tryAttach = () => {
      if (!this.room.state || !this.room.state.players) return;
      const playersMap = this.room.state.players;

      // attach add/remove/change
      $(playersMap).onAdd((p: any, sessionId: string) => {
        this.chat.systemMessage(`${p.name ?? sessionId} a rejoint le lobby`);
        // attach change on player
        $(p).onChange(() => this.renderPlayers());
        this.renderPlayers();
      });

      $(playersMap).onRemove((p: any, sessionId: string) => {
        this.chat.systemMessage(`${p?.name ?? sessionId} a quitté le lobby`);
        this.renderPlayers();
      });

      $(playersMap).onChange((p:any, key:string) => {
        // general map change
        this.renderPlayers();
      });

      // listen server countdown messages
      this.room.onMessage("countdown", (n:number) => this.onCountdown(n));
      this.room.onMessage("host_changed", (hostName:string) => {
        this.chat.systemMessage(`Nouveau host: ${hostName}`);
        this.renderPlayers();
      });

      // initial render
      this.renderPlayers();
    };

    // onStateChange to wait for initial state
    this.room.onStateChange(() => {
      tryAttach();
    });

    // call immediately if already present
    tryAttach();
  }

  renderPlayers() {
    const container = document.getElementById("players-list")!;
    container.innerHTML = "";

    const players = this.room.state?.players;
    if (!players) return;

    // players.forEach may not be a real array, use forEach if available
    try {
      players.forEach((p: any, id: string) => {
        const el = this.createPlayerRow(p, id);
        container.appendChild(el);
      });
    } catch (e) {
      // fallback
      for (const k in players) {
        if (Object.prototype.hasOwnProperty.call(players, k)) {
          const p = players[k];
          container.appendChild(this.createPlayerRow(p, k));
        }
      }
    }
  }

  createPlayerRow(p: any, id: string) {
    const div = document.createElement("div");
    div.className = "player-entry";
    if (p.isHost) div.classList.add("host");

    const left = document.createElement("div");
    left.innerHTML = `<div style="font-weight:700">${this.escape(p.name ?? id)}</div>
                      <div class="meta">ELO: ${Number(p.elo ?? 1200)}</div>`;

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.gap = "8px";
    const state = document.createElement("div");
    state.textContent = p.ready ? "✔ READY" : "⏳";
    state.style.color = p.ready ? "var(--success)" : "var(--muted)";
    right.appendChild(state);

    if (p.isHost) {
      const crown = document.createElement("div");
      crown.textContent = "👑";
      right.appendChild(crown);
    }

    div.appendChild(left);
    div.appendChild(right);
    return div;
  }

  onCountdown(sec: number) {
    const countdownEl = document.getElementById("countdown")!;
    countdownEl.classList.remove("hidden");
    countdownEl.textContent = String(sec);

    // lock when last 3 seconds
    if (sec <= 3) {
      this.locked = true;
      (document.getElementById("ready-btn") as HTMLButtonElement).setAttribute("disabled","true");
      (document.getElementById("leave-btn") as HTMLButtonElement).setAttribute("disabled","true");
      this.chat.systemMessage("Démarrage imminent : actions désactivées.");
    } else {
      this.locked = false;
      (document.getElementById("ready-btn") as HTMLButtonElement).removeAttribute("disabled");
      (document.getElementById("leave-btn") as HTMLButtonElement).removeAttribute("disabled");
    }

    if (sec === 0) {
      countdownEl.classList.add("hidden");
    }
  }

  escape(s: string) { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
}
