import { Room, Client } from "@colyseus/core";
import { PlayerState } from "./schema/PlayerState";
import { LobbyState } from "./schema/LobbyState";
import { matchMaker } from "colyseus";
import { ArraySchema } from "@colyseus/schema";

export class LobbyRoom extends Room<LobbyState> {
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
      const from = (p && p.username) ? p.username : client.sessionId;
      this.broadcast("chat", { from, text: String(message) });
    });

    this.onMessage("vote_kick", (client: Client, targetId: string) => {
      const voters = this._getKickVotes(client.sessionId, targetId);
      if (!voters) return;
      
      const totalPlayers = this.state.players.size;
      const votes = voters.length;
      const required = Math.floor(totalPlayers / 2) + 1;
      
      this.broadcast("sys", `${this.state.players.get(client.sessionId)?.username} voted to kick ${this.state.players.get(targetId)?.username} out. (${votes}/${required})`);
      console.log(`[KickVote] ${votes}/${required} contre ${targetId}`);

      if (votes >= required) {
        const targetClient = this.clients.find(c => c.sessionId === targetId);
        this.broadcast("sys", `${this.state.players.get(targetId)?.username} has been kicked!`);
        this.state.bannedUids.set(this.state.players.get(targetId).uid, true);
        this.state.players.delete(targetId);
        targetClient.send("kicked", "You have been kicked from the room!");

        if (this.state.hostId === targetId) {
          const firstSessionId = this.state.players.keys().next().value;

          if (firstSessionId) {
              this.state.hostId = firstSessionId; 
              const newHost = this.state.players.get(firstSessionId);
              this.broadcast("sys", `${newHost.username} is the new room owner.`);
          }
        }
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(`[Lobby ${this.roomId}] Client ${client.sessionId} rejoint. Clients actuels: ${this.clients.length}`);
    // if (this.clients.length > this.maxClients) {
    //     throw new Error("The room is full.");
    // }

    if (this.countdownInterval) { 
        this._stopCountdown("Countdown annulé — nouveau joueur a rejoint.");
    }

    const uid = options?.uid;
    if (uid && this.state.bannedUids.has(uid)) {
        console.warn(`Tentative de reconnexion bloquée pour l'UID: ${uid}. Il est banni.`);
        throw new Error("Banned from this room."); 
    }

    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.uid = options?.uid;
    player.username = options?.username;
    // player.username = options?.username ?? `Player_${client.sessionId.substring(0,4)}`;
    player.elo = typeof options?.elo === "number" ? options.elo : 1500;
    player.isReady = false;

    if (this.state.players.size === 0) {
      this.state.hostId = player.sessionId;
    }

    this.state.players.set(client.sessionId, player);
    this.broadcast("sys", `${player.username} has joined the room.`);
  }

  onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.state.players.delete(client.sessionId);
      this.broadcast("sys", `${player.username} has left the room.`);

      if (this.state.hostId === player.sessionId) {
        const firstSessionId = this.state.players.keys().next().value;

        if (firstSessionId) {
            this.state.hostId = firstSessionId; 
            const newHost = this.state.players.get(firstSessionId);
            this.broadcast("sys", `${newHost.username} is the new room owner.`);
        }
      }
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
    // this.lock();
    this.countdownRemaining = seconds;
    this.broadcast("countdown", this.countdownRemaining);

    this.countdownInterval = this.clock.setInterval(() => {
      this.countdownRemaining!--;
      this.broadcast("countdown", this.countdownRemaining);

      if (this.countdownRemaining <= 3) {
        this.lock();
      }

      if (this.countdownRemaining <= 0) {
        this._launchGame();
      }
    }, 1000);
  }

  _stopCountdown(reason: string) {
    if (this.countdownInterval) {
      this.countdownInterval.clear();
      this.countdownInterval = null;
    }
    this.unlock();
    this.countdownRemaining = this.countdownDefault;
    this.broadcast("countdown_stop");
    console.log("Compte à rebourd arrêté : " + reason);
  }

  async _launchGame() {
    this._stopCountdown("Lancement de la partie.");
    console.log("🚀 PARTIE LANCEE !");

    const gameRoom = await matchMaker.createRoom("game", { 
      players: Array.from(this.state.players.keys())
    });

    for (const client of this.clients) {
      client.send("start_game", { roomId: gameRoom.roomId });
    }

    this.disconnect();
    this._dispose();
  }

  _getKickVotes(voter: string, target: string): string[] | null {
    if (voter === target) return null;
    if (!this.state.players.has(target)) return null;
    if (!this.state.players.has(voter)) return null;

    let voters: string[] = [];
    const currentVoters = this.state.kicks.get(target);
    if (currentVoters) voters = JSON.parse(currentVoters);

    if (voters.includes(voter)) return null;

    voters.push(voter);
    this.state.kicks.set(target, JSON.stringify(voters));
    return voters;
  }
}