import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
      super("BootScene");
  }

  // Cette scène est vide, elle attend qu'on l'appelle explicitement
  // à partir de Svelte pour lancer la prochaine scène avec des données.
  // Laissez create() vide ou ajoutez un simple texte d'attente.
  create() {
      console.log("Dans la BootScene.");
  }
}