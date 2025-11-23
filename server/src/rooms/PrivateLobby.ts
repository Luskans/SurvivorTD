// import { Room, Client } from "colyseus";
// import { Player } from "./schema/Player";
// import { LobbyState } from "./schema/LobbyState";

// export class PrivateLobby extends Room<LobbyState> {
//   maxClients = 8;

//   onCreate(options: any) {
//     this.setState(new LobbyState());

//     this.onMessage("chat", (client, text: string) => {
//       const p = this.state.players.get(client.sessionId);
//       if (p) this.broadcast("chat", { from: p.name, text });
//     });

//     this.onMessage("toggle_ready", (client) => {
//       const p = this.state.players.get(client.sessionId);
//       if (!p) return;

//       p.ready = !p.ready;
//       this.checkStart();
//     });
//   }

//   onJoin(client: Client, options: any) {
//     const name = options.nickname ?? `Player_${client.sessionId.slice(0,4)}`;

//     this.state.players.set(client.sessionId, new Player(name));

//     // first join = host
//     if (!this.state.host) {
//       this.state.host = client.sessionId;
//       const p = this.state.players.get(client.sessionId);
//       p.isHost = true;
//     }

//     this.broadcast("sys", `${name} a rejoint le lobby.`);
//   }

//   onLeave(client: Client) {
//     const p = this.state.players.get(client.sessionId);
//     if (!p) return;

//     this.broadcast("sys", `${p.name} a quitté le lobby.`);
//     this.state.players.delete(client.sessionId);

//     // host left => transfer host
//     if (this.state.host === client.sessionId && this.state.players.size > 0) {
//       const newHost = [...this.state.players.keys()][0];
//       this.state.host = newHost;
//       this.state.players.get(newHost).isHost = true;
//       this.broadcast("host_changed", this.state.players.get(newHost).name);
//     }
//   }

//   checkStart() {
//     const allReady = Array.from(this.state.players.values()).every(p => p.ready);
//     if (allReady && this.state.players.size >= 2) {
//       this.broadcast("sys", "Tous prêts → lancement !");
//     }
//   }
// }










import { Room, Client } from "colyseus";
import { LobbyState } from "./schema/LobbyState";
import { Player } from "./schema/Player";


export class PrivateLobby extends Room<LobbyState> {
  maxClients = 8;

  onCreate(options: any) {
    // assign state
    // this.setState(new LobbyState());
    this.state = new LobbyState();

    if (options?.private) {
      this.setMetadata({ isPrivate: true });
    }

    // chat
    this.onMessage("chat", (client, text: string) => {
      const p = this.state.players.get(client.sessionId);
      this.broadcast("chat", {
        from: p?.name ?? "???",
        text: String(text)
      });
    });

    // ready toggling
    this.onMessage("toggle_ready", (client) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;

      p.ready = !p.ready;
      this.broadcast("sys", `${p.name} est ${p.ready ? "READY" : "NOT READY"}`);
    });
  }

  onJoin(client: Client, options: any) {
    const player = new Player();
    player.sessionId = client.sessionId;
    player.name = options?.name ?? `Player_${client.sessionId.substring(0,4)}`;
    player.elo = typeof options?.elo === "number" ? options.elo : 1500;

    // First player => Host
    if (this.state.players.size === 0) {
      player.isHost = true;
    }

    this.state.players.set(client.sessionId, player);

    this.broadcast("sys", `${player.name} a rejoint la partie (privée).`);
  }

  onLeave(client: Client) {
    const p = this.state.players.get(client.sessionId);
    if (!p) return;

    this.broadcast("sys", `${p.name} a quitté la partie.`);
    const wasHost = p.isHost;
    this.state.players.delete(client.sessionId);

    // Reassign host if host left
    if (wasHost && this.state.players.size > 0) {
      const newHostId = this.state.players.keys().next().value;
      this.state.players.get(newHostId).isHost = true;
      this.broadcast("host_changed",
        this.state.players.get(newHostId).name
      );
    }
  }
}
