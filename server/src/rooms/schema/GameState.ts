import { Schema, MapSchema, type } from "@colyseus/schema";
import { TowerState } from "./TowerState";
import { EnemyState } from "./EnemyState";

export class GameState extends Schema {
  @type({ map: TowerState }) towers = new MapSchema<TowerState>();
  @type({ map: EnemyState }) enemies = new MapSchema<EnemyState>();
}