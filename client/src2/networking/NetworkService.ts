// import { Client, Room } from "colyseus.js";
// import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";

// class NetworkService {
//   client = new Client("ws://localhost:2567");
//   room: Room<LobbyState> | null = null;

//   async joinPublicLobby() {
//     this.room = await this.client.joinOrCreate<LobbyState>("public_lobby");
//     return this.room;
//   }

//   async joinPrivateLobby(code: string) {
//     this.room = await this.client.joinOrCreate<LobbyState>("private_lobby", { code });
//     return this.room;
//   }

//   toggleReady() {
//     this.room?.send("toggle_ready");
//   }

//   sendChat(text: string) {
//     this.room?.send("chat", text);
//   }

//   leaveRoom() {
//     this.room?.leave();
//     this.room = null;
//   }
// }

// export const network = new NetworkService();






import { Client, Room } from "colyseus.js";

/**
 * NOTE: LobbyState is typed as any on the client to avoid cross-import issues.
 * If you later add a shared `shared/` package, import the real type there.
 */
type AnyRoom = Room<any> | null;

export class NetworkService {
  client = new Client("ws://localhost:2567");
  room: AnyRoom = null;

  async joinPublicLobby(): Promise<AnyRoom> {
    this.room = await this.client.joinOrCreate("public_lobby");
    return this.room;
  }

  async createPrivateLobby(code?: string): Promise<AnyRoom> {
    this.room = await this.client.create("private_lobby", { code });
    return this.room;
  }

  async joinPrivateLobbyById(id: string): Promise<AnyRoom> {
    this.room = await this.client.joinOrCreate("private_lobby", { id });
    return this.room;
  }

  toggleReady() {
    this.room?.send("toggle_ready");
  }

  sendChat(text: string) {
    this.room?.send("chat", text);
  }

  leaveRoom() {
    this.room?.leave();
    this.room = null;
  }
}

export const network = new NetworkService();
