import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") sessionId!: string;
  @type("string") name: string = "Player";
  @type("number") elo: number = 1200;
  @type("boolean") ready: boolean = false;
  @type("boolean") isHost: boolean = false;
}