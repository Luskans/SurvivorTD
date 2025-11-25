import { Client, Room } from "colyseus.js";
import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";

export class NetworkService {
  client = new Client("ws://localhost:2567");
  room: Room<LobbyState> | null = null;

  async joinPublicLobby(): Promise<Room> {
    this.room = await this.client.joinOrCreate("lobby");
    return this.room;
  }

  async createPrivateLobby(isPrivate: boolean): Promise<Room> {
    this.room = await this.client.create("lobby", { isPrivate: true });
    return this.room;
  }

  async joinPrivateLobbyById(roomId: string): Promise<Room> {
    this.room = await this.client.joinById(roomId);
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
