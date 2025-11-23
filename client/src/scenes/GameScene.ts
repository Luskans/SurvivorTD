import Phaser from "phaser";
import { Room, Client } from "colyseus.js";

export class GameScene extends Phaser.Scene {
    client = new Client("ws://localhost:2567");
    room: Room;

    async preload() {
      // preload scene
    }
 
    async create() {
      // create scene
      console.log("Joining room...");
 
      try {
        this.room = await this.client.joinOrCreate("my_room");
        console.log("Joined successfully!");
 
      } catch (e) {
        console.error(e);
      }
    }

    async connect() {
      // add connection status text
    }
 
    update(time: number, delta: number): void {
      // game loop
    }
}