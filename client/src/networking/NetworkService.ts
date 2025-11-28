import { Client, Room } from "colyseus.js";
import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";

export class NetworkService {
  client = new Client("ws://localhost:2567");
  room: Room<LobbyState> | null = null;

  async joinPublicLobby(options?: { uid: string, username: string, isPrivate: boolean }): Promise<Room> {
    this.room = await this.client.joinOrCreate("lobby", options);
    return this.room;
  }

  async createPrivateLobby(options?: { uid: string, username: string, isPrivate: boolean }): Promise<Room> {
    this.room = await this.client.create("lobby", options);
    return this.room;
  }

  async joinPrivateLobbyById(roomId: string, options?: { uid: string, username: string }): Promise<Room> {
    this.room = await this.client.joinById(roomId, options);
    return this.room;
  }

  async joinGame(roomId: string): Promise<Room> {
    this.room = await this.client.joinById(roomId);
    return this.room
  }

  toggleReady() {
    this.room?.send("toggle_ready");
  }

  sendChat(text: string) {
    this.room?.send("chat", text);
  }

  voteKick(targetId: string) {
    this.room?.send("vote_kick", targetId);
  }

  leaveRoom() {
    this.room?.leave();
    this.room = null;
  }
}

export const network = new NetworkService();
