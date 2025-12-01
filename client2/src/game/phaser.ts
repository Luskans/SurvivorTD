import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { LoadingScene } from "./scenes/LoadingScene";
import { BootScene } from "./scenes/BootScene";


let game: Phaser.Game | null = null;

export async function createGame() {
  if (game) return game;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: ".game-screen",
    backgroundColor: "#d7899eff",
    physics: { default: "arcade" },
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [LoadingScene, GameScene], // ordre important
  };

  game = new Phaser.Game(config);
  return game;
}

// export function createGame(container: HTMLElement) {
//   if (game) return game;

//   const config: Phaser.Types.Core.GameConfig = {
//     type: Phaser.AUTO,
//     width: 1280,
//     height: 720,
//     parent: container,
//     backgroundColor: "#282828ff",
//     physics: { default: "arcade" },
//     pixelArt: true,
//     scale: {
//       mode: Phaser.Scale.FIT,
//       autoCenter: Phaser.Scale.CENTER_BOTH
//     },
//     scene: [LoadingScene, GameScene], // ordre important
//   };

//   game = new Phaser.Game(config);
//   return game;
// }

export function getGame() {
  return game;
}
