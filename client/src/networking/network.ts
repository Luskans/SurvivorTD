import { Client, Room } from "colyseus.js";
// import { Player } from "../../../server/src/rooms/schema/Player.ts";
import { LobbyState } from "../../../server/src/rooms/schema/LobbyState.ts";

export class NetworkService {
  private client = new Client("ws://localhost:2567");
  room: Room<LobbyState> | null = null;

  async joinPublicLobby() {
    console.log("Connecting to lobby...");
    this.room = await this.client.joinOrCreate<LobbyState>("public_lobby");
    console.log("Connected to lobby", this.room.sessionId);
    return this.room;
  }

  sendChat(text: string) {
    this.room?.send("chat", text);
  }

  toggleReady() {
    this.room?.send("toggle_ready");
  }

  leaveRoom() {
    this.room?.leave();
    this.room = null;
  }
}

// Singleton accessible partout
export const network = new NetworkService();
