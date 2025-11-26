import { Room, Client } from "colyseus";
import { GameState } from "./schema/GameState";
import { TowerState } from "./schema/TowerState";
import { EnemyState } from "./schema/EnemyState";

export class GameRoom extends Room<GameState> {

  waveIntervalMs = 30000; // 30s

  onCreate(options: any) {
    this.state = new GameState();

    const players: string[] = options?.players ?? [];
    players.forEach(sessionId => {
      const tower = new TowerState();
      this.state.towers.set(sessionId, tower);
    });

    // this.lock();

    this.clock.setInterval(() => this.spawnWave(), this.waveIntervalMs);
  }

  onJoin(client: Client, options: any) {
    // Déjà dans create() il faut que tous en même temps
    // const t = new TowerState();
    // this.state.towers.set(client.sessionId, t);
  }

  spawnWave() {
    console.log("🌑 Nouvelle Vague !");
    this.state.towers.forEach((tower, ownerId) => {
      const e = new EnemyState();
      e.x = Math.random() * 500;
      e.y = Math.random() * 500;
      this.state.enemies.set(ownerId + "_" + Date.now(), e);
    });
  }
}
