import App from './App.svelte';
import { GameScene } from './game/GameScene'; // Renommé 'index.ts' en 'PhaserGame.ts'
import { getOrCreateUID } from './networking/PlayerService';

// Le code de LeaderboardUI est déplacé dans un composant Svelte.
// Le code de HomeUI est déplacé dans un composant Svelte.

document.addEventListener("DOMContentLoaded", () => {
  getOrCreateUID(); // Initialisation de l'UID au chargement

  const app = new App({
    target: document.getElementById('app')!,
    props: {
      // Passer l'instance Phaser si nécessaire, mais on la laisse en global dans game.ts pour l'instant
    }
  });
});

// Export de l'instance Phaser (si vous la gardez globale)
export { GameScene };