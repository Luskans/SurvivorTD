// import { getStateCallbacks } from "colyseus.js";
// import { network } from "../networking/NetworkService";
// import { ChatUI } from "./ChatUI";
// import { ScreenManager } from "./ScreenManager";
// import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";
// import type { Player, PLayer } from "../../../server/src/rooms/schema/Player";
// import { Client, Room } from "colyseus.js";


// export class LobbyUI {
//   private room: Room<LobbyState>;
//   private chat: ChatUI;
//   private locked: boolean = false;

//   constructor(room: Room<LobbyState>) {
//     this.room = room;
//     this.chat = new ChatUI(room);
//     this.listenButtons();
//     this.listenStates();
//     this.listenHost();
//   }

//   // listenHost() {
//   //   if (!this.inviteBtn) return;
//   //   this.inviteBtn.style.display = "none";

//   //   this.room.onMessage("host_changed", () => {
//   //     this.updateHostUI();
//   //   });

//   //   this.room.onStateChange(() => {
//   //     this.updateHostUI();
//   //   });

//   //   this.updateHostUI();
//   // }

//   listenHost() {
//     const isHost = this.room.sessionId === this.room.metadata?.hostSessionId;
//     const isPrivate = this.room.metadata?.isPrivate;

//     if (isHost && isPrivate) {
//       this.inviteBtn.style.display = "block";
//     } else {
//       this.inviteBtn.style.display = "none";
//     }
//   }

//   updateHostUI() {
//     if (!this.room.state || !this.room.state.players) {
//       return; // State pas prête → on attend
//     }

//     const me = this.room.state.players.get(this.room.sessionId);
//     if (!me) return;

//     if (me.isHost) {
//       this.inviteBtn.style.display = "block";

//       // reset du listener pour éviter les doublons
//       const newEl = this.inviteBtn.cloneNode(true) as HTMLButtonElement;
//       this.inviteBtn.replaceWith(newEl);
//       this.inviteBtn = newEl;

//       this.inviteBtn.onclick = () => {
//         const inviteURL = `${window.location.origin}/private/${this.room.roomId}`;
//         navigator.clipboard.writeText(inviteURL)
//           .then(() => this.chat.systemMessage(`Room link copied to clipboard.`))
//           .catch(() => alert("Impossible de copier le lien"));
//       };
//     } else {
//       this.inviteBtn.style.display = "none";
//     }
//   }


//   // listenHost() {
//   //   const inviteBtn = document.getElementById("copy-invite-btn")!;

//   //   if (this.room.sessionId === this.hostSessionId) {
//   //     inviteBtn.style.display = "block";

//   //     inviteBtn.addEventListener("click", () => {
//   //       const inviteURL = `${window.location.origin}/private/${this.room.roomId}`;
//   //       // this.chat.systemMessage(`Copied room link to clipboard.`);
//   //       navigator.clipboard.writeText(inviteURL)
//   //         // .then(() => alert("Lien copié !"))
//   //         .then(() => this.chat.systemMessage(`Copied room link to clipboard.`))
//   //         .catch(() => alert("Impossible de copier le lien"));
//   //     });
//   //   }
//   // }

//   listenButtons() {
//     const readyBtn = document.getElementById("ready-btn") as HTMLButtonElement;
//     const leaveBtn = document.getElementById("leave-btn") as HTMLButtonElement;

//     readyBtn.onclick = () => {
//       if (this.locked) return;
//       network.toggleReady();
//       // readyBtn.textContent = readyBtn.textContent === "Ready" ? "Not Ready" : "Ready";
//     };

//     leaveBtn.onclick = () => {
//       if (this.locked) return;
//       network.leaveRoom();
//       ScreenManager.show("home-screen");
//     };
//   }

//   listenStates() {
//     const $ = getStateCallbacks(this.room);
//     let listenersAttached = false;

//     const tryAttach = () => {
//       if (listenersAttached) return;
//       if (!this.room.state || !this.room.state.players) return;
//       const playersMap = this.room.state.players;
//       listenersAttached = true;

//       $(playersMap).onAdd((p: any, sessionId: string) => {
//         this.chat.systemMessage(`${p.name ?? sessionId} a rejoint le lobby`);
//         $(p).onChange(() => this.renderPlayers());
//         this.renderPlayers();
//       });

//       $(playersMap).onRemove((p: any, sessionId: string) => {
//         this.chat.systemMessage(`${p?.name ?? sessionId} a quitté le lobby`);
//         this.renderPlayers();
//       });

//       $(playersMap).onChange((p:any, key:string) => {
//         this.renderPlayers();
//       });

//       this.room.onMessage("countdown", (n:number) => this.onCountdown(n));
//       this.room.onMessage("host_changed", (hostName:string) => {
//         this.chat.systemMessage(`Nouveau host: ${hostName}`);
//         this.renderPlayers();
//       });

//       this.renderPlayers();
//     };

//     this.room.onStateChange(() => {
//       tryAttach();
//     });

//     tryAttach();
//   }

//   renderPlayers() {
//     const container = document.getElementById("players-list")!;
//     container.innerHTML = "";

//     const players = this.room.state?.players;
//     if (!players) return;

//     try {
//       players.forEach((p: any, id: string) => {
//         const el = this.createPlayerRow(p, id);
//         container.appendChild(el);

//         if (id === this.room.sessionId) {
//           const readyBtn = document.getElementById("ready-btn") as HTMLButtonElement;
//           readyBtn.textContent = p.ready ? "Not Ready" : "Ready";
//         }
//       });
//     } catch (e) {
//       console.log("errorr creating players list");
//     }
//   }

//   createPlayerRow(p: any, id: string) {
//     const div = document.createElement("div");
//     div.className = "player-entry";
//     if (p.isHost) div.classList.add("host");

//     const left = document.createElement("div");
//     left.innerHTML = `<div style="font-weight:700">${p.isHost ? "👑" : ""}${this.escape(p.name ?? id)}</div>
//                       <div class="meta">ELO: ${Number(p.elo ?? 1200)}</div>`;

//     const right = document.createElement("div");
//     right.style.display = "flex";
//     right.style.gap = "8px";

//     const state = document.createElement("div");
//     state.textContent = p.ready ? "✔ READY" : "⏳";
//     state.style.color = p.ready ? "var(--success)" : "var(--muted)";

//     right.appendChild(state);
//     div.appendChild(left);
//     div.appendChild(right);
//     return div;
//   }

//   onCountdown(sec: number) {
//     const countdownEl = document.getElementById("countdown")!;
//     countdownEl.classList.remove("hidden");
//     countdownEl.textContent = String(sec);

//     // lock when last 3 seconds
//     if (sec <= 3) {
//       this.locked = true;
//       (document.getElementById("ready-btn") as HTMLButtonElement).setAttribute("disabled","true");
//       (document.getElementById("leave-btn") as HTMLButtonElement).setAttribute("disabled","true");
//       this.chat.systemMessage(`Game starting in ..${sec}`);

//     } else {
//       this.locked = false;
//       (document.getElementById("ready-btn") as HTMLButtonElement).removeAttribute("disabled");
//       (document.getElementById("leave-btn") as HTMLButtonElement).removeAttribute("disabled");
//     }

//     if (sec === 0) {
//       countdownEl.classList.add("hidden");
//     }
//   }

//   escape(s: string) { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
// }





















import { getStateCallbacks } from "colyseus.js";
import { network } from "../networking/NetworkService";
import { ChatUI } from "./ChatUI";
import { ScreenManager } from "./ScreenManager";
import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";
import type { Player } from "../../../server/src/rooms/schema/Player";
import { Room } from "colyseus.js";


export class LobbyUI {
  private room: Room<LobbyState>;
  private chat: ChatUI;
  private locked: boolean = false;

  constructor(room: Room<LobbyState>) {
    this.room = room;
    this.chat = new ChatUI(room);
    this.setupButtons();
    this.listenStates();
  }

  setupButtons() {
    document.getElementById("ready-btn")!.onclick = () => this.handleReadyBtn();
    document.getElementById("leave-btn")!.onclick = () => this.handleLeaveBtn();
  }

  handleReadyBtn() {
    try {
      if (this.locked) return;
      network.toggleReady();
      console.log(`Le joueur ${this.room.sessionId} est prêt.`);

    } catch (e) {
      console.error(`Erreur du joueur ${this.room.sessionId} pour passer prêt.`, e);
      alert("Erreur passer prêt");
    }
  }

  handleLeaveBtn() {
    try {
      if (this.locked) return;
      network.leaveRoom();
      console.log(`Le joueur ${this.room.sessionId} a quitté le lobby.`);
      ScreenManager.show("home-screen");

    } catch (e) {
      console.error(`Erreur du joueur ${this.room.sessionId} pour quitter le lobby.`, e);
      alert("Erreur pour quitter le lobby");
    }
  }

  async listenStates() {
    const $ = getStateCallbacks(this.room);

    $(this.room.state.players).onAdd((p: Player, id: string) => {
      // this.chat.systemMessage(`${p.name ?? id} a rejoint le lobby`);
      $(p).onChange(() => this.updatePlayersList());
      this.updatePlayersList();
    });

    $(this.room.state.players).onRemove((p: Player, id: string) => {
      // this.chat.systemMessage(`${p?.name ?? id} a quitté le lobby`);
      $(p).onChange(() => this.updatePlayersList());
      this.updatePlayersList();
    });

    this.room.onMessage("countdown", (n:number) => this.onCountdown(n));

    // this.room.onMessage("host_changed", (hostName:string) => {
    //   this.chat.systemMessage(`New host: ${hostName}`);
    // });

    this.room.onStateChange(() => {
      this.updatePlayersList();
      this.updateInviteButton();
    });
  }

  updatePlayersList() {
    const container = document.getElementById("players-list")!;
    container.innerHTML = "";

    this.room.state?.players.forEach((p: Player, id: string) => {
      const el = this.createPlayerRow(p, id);
      container.appendChild(el);

      if (id === this.room.sessionId) {
        document.getElementById("ready-btn")!.textContent = p.isReady ? "Not Ready" : "Ready";
      }
    });
  }

  createPlayerRow(p: Player, id: string) {
    const div = document.createElement("div");
    div.className = "player-entry";
    if (this.room.sessionId === p.sessionId) div.classList.add("host");

    const left = document.createElement("div");
    left.innerHTML = `<div style="font-weight:700">${id === this.room.state.hostId ? "👑" : ""}${this.escape(p.name ?? id)}</div>
                      <div class="meta">ELO: ${Number(p.elo ?? 1200)}</div>`;

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.gap = "8px";

    const state = document.createElement("div");
    state.textContent = p.isReady ? "✔ READY" : "⏳";
    state.style.color = p.isReady ? "var(--success)" : "var(--muted)";

    right.appendChild(state);
    div.appendChild(left);
    div.appendChild(right);
    return div;
  }

  updateInviteButton() {
    if (this.room.sessionId === this.room.state.hostId && this.room.state.isPrivate) {
      const div = document.querySelector("#invite-container")!;
      div.innerHTML = "";
      
      const btn = document.createElement("button");
      btn.className = "btn primary";
      btn.textContent = "Invite";
      div.appendChild(btn);
      btn.onclick = () => {
        const inviteURL = `${window.location.origin}/private/${this.room.roomId}`;
        navigator.clipboard.writeText(inviteURL)
          .then(() => this.chat.systemMessage(`Room link copied to clipboard.`))
          .catch(() => alert("Impossible de copier le lien"));
      };
    }
  }

  onCountdown(sec: number) {
    const countdownEl = document.getElementById("countdown")!;
    countdownEl.classList.remove("hidden");
    countdownEl.textContent = String(sec);

    if (sec <= 3) {
      this.locked = true;
      (document.getElementById("ready-btn") as HTMLButtonElement).setAttribute("disabled","true");
      (document.getElementById("leave-btn") as HTMLButtonElement).setAttribute("disabled","true");
      this.chat.systemMessage(`Game starting in ..${sec}`);

    } else {
      this.locked = false;
      (document.getElementById("ready-btn") as HTMLButtonElement).removeAttribute("disabled");
      (document.getElementById("leave-btn") as HTMLButtonElement).removeAttribute("disabled");
    }
  }

  escape(s: string) { return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
}