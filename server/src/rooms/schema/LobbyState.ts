import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";

export class LobbyState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("boolean") isPrivate: boolean = false;
  @type("string") hostId: string;
  @type({ map: "string" }) kicks = new MapSchema<string>();
  // @type({ map: { array: "string" } }) kicks = new MapSchema<ArraySchema<string>>();
}