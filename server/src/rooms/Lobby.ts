import { Room, Client } from "@colyseus/core";
import { Player } from "./schema/Player";
import { LobbyState } from "./schema/LobbyState";

export class Lobby extends Room<LobbyState> {
  maxClients: number = 8;
  minClients: number = 2;
  countdownDefault: number = 8;
  countdownRemaining: number = 8;
  countdownInterval: any;

  onCreate(options: any) {
    this.state = new LobbyState();

    if (options?.isPrivate) {
      this.state.isPrivate = true;
    }

    this.setPrivate(options?.isPrivate === true)

    this.onMessage("toggle_ready", (client: Client) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;

      p.isReady = !p.isReady;

      if (this.countdownInterval && !p.isReady && this.countdownRemaining > 3) {
        this._stopCountdown("Countdown annulé — un joueur n'est plus ready.");
      }

      this._checkStartGame();
    });

    this.onMessage("chat", (client: Client, message: string) => {
      const p = this.state.players.get(client.sessionId);
      const from = (p && p.name) ? p.name : client.sessionId;
      this.broadcast("chat", { from, text: String(message) });
    });
  }

  onJoin(client: Client, options: any) {
    console.log(`[Lobby ${this.roomId}] Client rejoint. Clients actuels: ${this.clients.length + 1}`);
    if (this.clients.length > this.maxClients) {
        throw new Error("The room is full.");
    }

    if (this.countdownRemaining < this.countdownDefault) {
        throw new Error("Too late, the game is about to start.");
    }

    if (this.countdownInterval) { 
        this._stopCountdown("Countdown annulé — nouveau joueur a rejoint.");
    }

    const player = new Player();
    player.sessionId = client.sessionId;
    player.name = options?.name ?? `Player_${client.sessionId.substring(0,4)}`;
    player.elo = typeof options?.elo === "number" ? options.elo : 1500;
    player.isReady = false;

    if (this.state.players.size === 0) {
      this.state.hostId = player.sessionId;
    }

    this.state.players.set(client.sessionId, player);
    this.broadcast("sys", `${player.name} has joined the room.`);
  }

  onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.state.players.delete(client.sessionId);
      this.broadcast("sys", `${player.name} has left the room.`);

      if (this.state.hostId === player.sessionId) {
        const firstSessionId = this.state.players.keys().next().value;

        if (firstSessionId) {
            this.state.hostId = firstSessionId; 
            const newHost = this.state.players.get(firstSessionId);
            // this.broadcast("host_changed", newHost.name);
            this.broadcast("sys", `${newHost.name} is the new room owner.`);
        }
      }

      // les autres joueurs seront ready dans tous les cas
      // if (this.countdownRemaining > 3) {
      //   this._stopCountdown("Countdown annulé — un joueur a quitté.");
      // }

      // this._checkStartGame();
    }
  }

  onDispose() {
    console.log("Disposing lobby", this.roomId);
  }

  // ---------- helper functions ----------

  _checkStartGame() {
    if (this.countdownInterval) return;
    const players = Array.from(this.state.players.values());
    if (players.length >= this.minClients && players.every(p => p.isReady === true)) {
      this._startCountdown(this.countdownDefault);
    }
  }

  _startCountdown(seconds: number) {
    if (this.countdownInterval) return;
    this.lock();
    this.countdownRemaining = seconds;
    this.broadcast("countdown", this.countdownRemaining);

    this.countdownInterval = this.clock.setInterval(() => {
      this.countdownRemaining!--;
      this.broadcast("countdown", this.countdownRemaining);

      if (this.countdownRemaining <= 0) {
        this._launchGame();
      }
    }, 1000);
  }

  _stopCountdown(reason: string) {
    if (this.countdownInterval) {
      // this.clock.clearInterval(this.countdownInterval);
      this.countdownInterval.clear();
      this.countdownInterval = null;
    }
    this.unlock();
    this.countdownRemaining = this.countdownDefault;
    console.log("Compte à rebourd arrêté : " + reason);
  }

  _launchGame() {
    this._stopCountdown("Lancement de la partie.");
    console.log("🚀 PARTIE LANCEE !");
  }
}