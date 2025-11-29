import { getStateCallbacks } from "colyseus.js";
import { network } from "../networking/NetworkService";
import { ChatUI } from "./ChatUI";
import { ScreenManager } from "./ScreenManager";
import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";
import { Room } from "colyseus.js";
import { game } from "../index.ts";


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
    } catch (e) {
      console.error(`Erreur du joueur ${this.room.sessionId} pour passer prêt.`, e);
      alert("Erreur passer prêt");
    }
  }

  handleLeaveBtn() {
    try {
      if (this.locked) return;
      network.leaveRoom();
      ScreenManager.show("home-screen");

    } catch (e) {
      console.error(`Erreur du joueur ${this.room.sessionId} pour quitter le lobby.`, e);
      alert("Erreur pour quitter le lobby");
    }
  }

  async listenStates() {
    const $ = getStateCallbacks(this.room);

    $(this.room.state.players).onAdd((p: PlayerState, id: string) => {
      // this.chat.systemMessage(`${p.name ?? id} a rejoint le lobby`);
      $(p).onChange(() => this.updatePlayersList());
      this.updatePlayersList();
    });

    $(this.room.state.players).onRemove((p: PlayerState, id: string) => {
      // this.chat.systemMessage(`${p?.name ?? id} a quitté le lobby`);
      $(p).onChange(() => this.updatePlayersList());
      this.updatePlayersList();
      if (this.room.sessionId === id) {
        console.log("test du changelent ecran si kick2")
        ScreenManager.show("home-screen");
        alert("test ta été kick")
      }
    });

    this.room.onMessage("countdown", (n: number) => this.onCountdown(n));

    this.room.onMessage("countdown_stop", () => this.onCountdown_stop());

    this.room.onMessage("kicked", (msg: string) => {
      alert(msg || "You were kicked from this lobby.");
      network.leaveRoom();
      ScreenManager.show("home-screen");
    });

    this.room.onMessage("start_game", async (data) => {
      console.log("Switch to game!", data);
      const gameRoom = await network.joinGame(data.roomId);
      ScreenManager.show("game-screen");
      game.scene.start("GameScene", { room: gameRoom });
    });

    this.room.onStateChange(() => {
      this.updatePlayersList();
      this.updateInviteButton();
    });
  }

  updatePlayersList() {
    const container = document.getElementById("players-list")!;
    container.innerHTML = "";

    this.room.state?.players.forEach((p: PlayerState, id: string) => {
      const el = this.createPlayerRow(p, id);
      container.appendChild(el);

      if (id === this.room.sessionId) {
        document.getElementById("ready-btn")!.textContent = p.isReady ? "Not Ready" : "Ready";
      }
    });
  }

  createPlayerRow(p: PlayerState, id: string) {
    const div = document.createElement("div");
    div.className = "player-entry";
    if (this.room.sessionId === p.sessionId) div.classList.add("host");

    const left = document.createElement("div");
    left.innerHTML = `<div style="font-weight:700">${id === this.room.state.hostId ? "👑" : ""}${this.escape(p.username ?? "Guest")}</div>
                      <div class="meta">ELO: ${Number(p.elo ?? 1200)}</div>`;

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.gap = "8px";

    const state = document.createElement("div");
    state.textContent = p.isReady ? "✔ READY" : "⏳";
    state.style.color = p.isReady ? "var(--success)" : "var(--muted)";

    div.appendChild(left);
    div.appendChild(right);
    right.appendChild(state);

    if (id !== this.room.sessionId) {
      const kickBtn = document.createElement("button");
      kickBtn.textContent = "Kick";
      kickBtn.classList.add("btn", "mini", "kick");

      if (this.room.state.kicks.has(id) && this.room.state.kicks.get(id)?.includes(this.room.sessionId)) {
        kickBtn.disabled = true;
        kickBtn.classList.add("disabled");
      }

      kickBtn.onclick = () => {
        network.voteKick(id);
      };
      right.appendChild(kickBtn);
    }

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
        // const inviteURL = `${window.location.origin}/private/${this.room.roomId}`;
        const inviteURL = `${window.location.origin}/${this.room.roomId}`;
        navigator.clipboard.writeText(inviteURL)
          .then(() => this.chat.systemMessage(`Room link copied to clipboard.`))
          .catch(() => alert("Impossible de copier le lien"));
      };
    }
  }

  // updateKickButton() {
  //   if (this.room.state.kicks =)
  // }

  onCountdown(sec: number) {
    const countdownEl = document.getElementById("countdown")!;
    const readyBtn = (document.getElementById("ready-btn") as HTMLButtonElement);
    const leaveBtn = (document.getElementById("leave-btn") as HTMLButtonElement);
    countdownEl.classList.remove("hidden");
    countdownEl.textContent = `START ${String(sec)}`;
    this.chat.systemMessage(`Game starting in ..${sec}`);

    if (sec <= 3) {
      this.locked = true;
      readyBtn.setAttribute("disabled", "true");
      readyBtn.classList.add("disabled");
      leaveBtn.setAttribute("disabled", "true");
      leaveBtn.classList.add("disabled");

    } else {
      this.locked = false;
      readyBtn.removeAttribute("disabled");
      readyBtn.classList.remove("disabled");
      leaveBtn.removeAttribute("disabled");
      leaveBtn.classList.remove("disabled");
      (document.getElementById("ready-btn") as HTMLButtonElement).removeAttribute("disabled");
      (document.getElementById("leave-btn") as HTMLButtonElement).removeAttribute("disabled");
    }
  }

  onCountdown_stop() {
    const countdownEl = document.getElementById("countdown")!;
    countdownEl.classList.add("hidden");
    this.chat.systemMessage(`Game start stopped, a player is no longer ready.`);
  }

  escape(s: string) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
}