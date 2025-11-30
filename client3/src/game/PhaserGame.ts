import * as Phaser from 'phaser';
import { GameScene } from './GameScene'; // Assurez-vous d'avoir GameScene.ts
// ... imports

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#b6d53c',
  parent: 'game-screen', // Phaser se monte dans ce div, géré par App.svelte
  physics: { default: "arcade" },
  pixelArt: true,
  scene: [GameScene],
};

export const game = new Phaser.Game(config);

// L'événement DOMContentLoaded est maintenant dans main.ts