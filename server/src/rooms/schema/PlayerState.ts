import { Schema, type } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") sessionId!: string;
  @type("string") name: string = "Player";
  @type("number") elo: number = 1200;
  @type("boolean") isReady: boolean = false;
}