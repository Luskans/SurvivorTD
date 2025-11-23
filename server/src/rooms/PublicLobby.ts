import { Room, Client } from "@colyseus/core";
import { Player } from "./schema/Player";
import { LobbyState } from "./schema/LobbyState";

// export class PublicLobby extends Room<LobbyState> {
//   maxClients = 8;

//   onCreate(options: any) {
//     this.state = new LobbyState();

//     this.onMessage("toggle_ready", (client) => {
//       const player = this.state.players.get(client.sessionId);
//       if (!player) return;
//       player.ready = !player.ready;
//     });

//     this.onMessage("chat", (client, message: string) => {
//       this.broadcast("chat", {
//         from: client.sessionId,
//         text: message,
//       });
//     });

//     console.log("Public Lobby created!");
//   }

//   onJoin(client: Client) {
//     const player = new Player();
//     player.sessionId = client.sessionId;
//     this.state.players.set(client.sessionId, player);
//     console.log(client.sessionId, "joined Public Lobby", this.clients.length, "/", this.maxClients);
//   }

//   onLeave(client: Client) {
//     this.state.players.delete(client.sessionId);
//     console.log(client.sessionId, "left Public Lobby");
//   }
// }






export class PublicLobby extends Room<LobbyState> {
  maxClients = 8;

  // configuration
  minPlayersToStart = 2;
  countdownSecondsDefault = 6; // durée totale du countdown
  countdownIntervalHandle: any = null;
  countdownRemaining: number | null = null;

  onCreate(options: any) {
    // assign state
    this.state = new LobbyState();

    // optional metadata (e.g. private code)
    // if (options?.code) {
    //   this.setMetadata({ code: options.code });
    // }

    // messages handlers
    this.onMessage("toggle_ready", (client: Client) => {
      // if countdown in final 3 seconds -> ignore toggle
      if (this.countdownRemaining !== null && this.countdownRemaining <= 3) {
        // ignore toggle during locked phase
        client.send("sys", "Action verrouillée (démarrage imminent).");
        return;
      }

      const p = this.state.players.get(client.sessionId);
      if (!p) return;

      // toggle
      p.ready = !p.ready;

      // notify all (we use broadcast 'sys' to log)
      this.broadcast("sys", `${p.name} est ${p.ready ? "READY" : "NOT READY"}`);

      // if someone unready while countdown running and more than 3s left -> cancel countdown
      if (!p.ready && this.countdownRemaining !== null && this.countdownRemaining > 3) {
        this._stopCountdown("Countdown annulé — un joueur n'est plus ready.");
      }

      // check start condition
      this._maybeStartCountdown();
    });

    this.onMessage("chat", (client: Client, message: string) => {
      const p = this.state.players.get(client.sessionId);
      const from = (p && p.name) ? p.name : client.sessionId;
      // broadcast structured chat
      this.broadcast("chat", { from, text: String(message) });
    });

    // optional: admin commands (kick, start) can be added here
  }

  onJoin(client: Client, options: any) {
    const player = new Player();
    player.sessionId = client.sessionId;
    player.name = options?.name ?? `Player_${client.sessionId.substring(0,4)}`;
    player.elo = typeof options?.elo === "number" ? options.elo : 1500;
    player.ready = false;

    // set host if none exists
    if (this.state.players.size === 0) {
      player.isHost = true;
      // set in metadata for easy UI
      this.setMetadata({ hostSessionId: client.sessionId });
    }

    this.state.players.set(client.sessionId, player);

    // announce join
    // this.broadcast("sys", `${player.name} a rejoint le lobby.`);

    // if after join all ready -> possibly start countdown
    this._maybeStartCountdown();
  }

  onLeave(client: Client, consented: boolean) {
    const leaving = this.state.players.get(client.sessionId);
    if (leaving) {
      this.state.players.delete(client.sessionId);
      // this.broadcast("sys", `${leaving.name} a quitté le lobby.`);

      // if host left, reassign host
      if (leaving.isHost) {
        this._assignNewHost();
      }

      // if players drop below minimum or someone left while countdown running:
      if (this.countdownRemaining !== null) {
        // if we are in final 3s, we decide to keep countdown running (cannot prevent actual disconnect).
        // if we are earlier (>3s) we stop countdown to allow re-negociation.
        if (this.countdownRemaining > 3) {
          this._stopCountdown("Countdown annulé — joueur quitté.");
        } else {
          // allow countdown to continue; clients are locked UI-side.
          // optionally announce
          // this.broadcast("sys", "Un joueur a quitté pendant les dernières secondes ; le lancement continue.");
        }
      }
    }
  }

  onDispose() {
    // cleanup if needed
    // if (this.countdownIntervalHandle) {
    //   this.clock.clearInterval(this.countdownIntervalHandle);
    //   this.countdownIntervalHandle = null;
    // }
    console.log("Disposing lobby", this.roomId);
  }

  // ---------- helper functions ----------

  _assignNewHost() {
    // choose first player in map as host
    const iter = this.state.players.entries();
    const next = iter.next();
    if (next && next.value) {
      const [sessionId, player] = next.value;
      player.isHost = true;
      this.setMetadata({ hostSessionId: sessionId });
      this.broadcast("host_changed", player.name);
      // this.broadcast("sys", `${player.name} est le nouveau host.`);
    } else {
      // no players left
      this.setMetadata({ hostSessionId: null });
    }
  }

  _allPlayersReady(): boolean {
    const players = Array.from(this.state.players.values());
    if (players.length < this.minPlayersToStart) return false;
    return players.every(p => p.ready === true);
  }

  _maybeStartCountdown() {
    // if countdown already running -> nothing to do
    if (this.countdownRemaining !== null) return;

    if (this._allPlayersReady()) {
      // start countdown
      this._startCountdown(this.countdownSecondsDefault);
    }
  }

  _startCountdown(seconds: number) {
    // guard
    if (this.countdownRemaining !== null) return;

    this.countdownRemaining = seconds;
    // broadcast initial value
    this.broadcast("countdown", this.countdownRemaining);

    // use room clock to tick each second
    this.countdownIntervalHandle = this.clock.setInterval(() => {
      if (this.countdownRemaining === null) return;

      this.countdownRemaining!--;
      // broadcast current second
      this.broadcast("countdown", this.countdownRemaining);

      // when reaches zero -> create game room and move players
      if (this.countdownRemaining <= 0) {
        // clear interval first
        // if (this.countdownIntervalHandle) {
        //   this.clock.clearInterval(this.countdownIntervalHandle);
        //   this.countdownIntervalHandle = null;
        // }
        const playersToMove = Array.from(this.clients); // list of Client objects
        // create the actual GameRoom and move players there
        (async () => {
          try {
            const room = await (this.matchMaker as any).createRoom("game", {});
            // join each session into the new room
            for (const c of playersToMove) {
              try {
                await (this.matchMaker as any).joinRoom(room.roomId, c.sessionId);
              } catch (err) {
                console.warn("Failed to move player to game room:", c.sessionId, err);
              }
            }
            // optionally close this lobby
            this.disconnect();
          } catch (err) {
            console.error("Failed to create/join game room:", err);
            this.broadcast("sys", "Erreur lors de la création de la partie.");
            // reset countdown state to allow retry
            this.countdownRemaining = null;
          }
        })();
      }
    }, 1000);
  }

  _stopCountdown(reason?: string) {
    // if (this.countdownIntervalHandle) {
    //   this.clock.clearInterval(this.countdownIntervalHandle);
    //   this.countdownIntervalHandle = null;
    // }
    this.countdownRemaining = null;
    if (reason) this.broadcast("sys", reason);
    // broadcast a special countdown -1 or explicit cancel event could be used
    this.broadcast("countdown", -1);
  }
}