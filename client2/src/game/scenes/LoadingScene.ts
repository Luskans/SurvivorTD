export class LoadingScene extends Phaser.Scene {
  constructor() {
    super("LoadingScene");
  }

  preload() {
    // Loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.rectangle(width / 2, height / 2, 0, 25, 0x00ff00);
    const progressBox = this.add.rectangle(
      width / 2,
      height / 2,
      320,
      40,
      0x222222,
      0.8
    );

    this.add.text(width / 2, height / 2 - 50, "Chargement...", {
      font: "20px Arial",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      progressBar.width = 300 * value;
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // Assets
    this.load.image("enemy", "assets/enemy.png");
    this.load.image("tower", "assets/tower.png");
    this.load.image('grass', 'assets/grass.jpg');
  }

  create() {
    this.scene.start("GameScene");
  }
}
