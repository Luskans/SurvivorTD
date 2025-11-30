import Phaser from "phaser";
import { Room } from "colyseus.js";
import { GameState } from "../../../server/src/rooms/schema/GameState";

export class GameScene extends Phaser.Scene {

  room!: Room<GameState>;

  constructor() {
    super("GameScene");
  }

  init(data: any) {
    this.room = data.room;
  }

  preload() {
    this.load.image("enemy", "assets/enemy.png");
    this.load.image("tower", "assets/tower.png");
  }

  create() {
    console.log("partie crée normalement")
    // this.room.state.towers.onAdd((tower, id) => {
    //   console.log("Tower created", id);
    //   this.add.sprite(400, 300, "tower");
    // });

    // this.room.state.enemies.onAdd((enemy, id) => {
    //   const sprite = this.add.sprite(enemy.x, enemy.y, "enemy");
    //   enemy.onChange(() => {
    //     sprite.setPosition(enemy.x, enemy.y);
    //   });
    // });
  }

  update(time: number, delta: number): void {
    // game loop
  }
}
