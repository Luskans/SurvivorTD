// import Phaser from "phaser";
// import { network } from "../../services/network";
// import { GameState } from "../../../../server/src/rooms/schema/GameState";
// import { getStateCallbacks, Room } from "colyseus.js";

// export class LoadingScene extends Phaser.Scene {
//   room: Room<GameState> | null = null;
//   roomId: string = "";

//   constructor() {
//     super("LoadingScene");
//   }

//   init(data: { roomId: string }) {
//     this.roomId = data.roomId;
//   }

//   preload() {
//     // Loading bar
//     const width = this.cameras.main.width;
//     const height = this.cameras.main.height;

//     const progressBar = this.add.rectangle(width / 2, height / 2, 0, 30, 0x44aa44);
//     const progressBox = this.add.rectangle(width / 2, height / 2, 320, 40, 0x222222);

//     this.add.text(width / 2, height / 2 - 50, "Chargement...", {
//       font: "20px Arial",
//       color: "#ffffff",
//     }).setOrigin(0.5);

//     this.load.on("progress", (value: number) => {
//       progressBar.width = 300 * value;
//     });

//     this.load.on("complete", () => {
//       progressBar.destroy();
//       progressBox.destroy();
//     });

//     // Assets
//     this.load.image("enemy", "assets/enemy.png");
//     this.load.image("tower", "assets/tower.png");
//     this.load.image('grass', 'assets/grass.jpg');
//   }

//   async create() {
//     console.log("Dans la LoadingScene.");
//     try {
//       // 1. Rejoindre la Colyseus Game Room
//       this.room = await network.joinGame(this.roomId);
//       this.room = await network.joinGame(this.roomId, { uid: uid, username: username });


//       // 2. S'abonner au message "begin"
//       this.room.onMessage("begin", () => {
//         console.log("Tous les joueurs ont chargé! Démarrage de GameScene...");
//         // Démarrer GameScene en passant l'objet room
//         this.scene.start("GameScene", { room: this.room });
//       });
      
//       // 3. Envoyer le message "loaded" au serveur
//       this.room.send("loaded"); 

//     } catch (e) {
//       console.error("Loading scene : erreur de connexion au serveur", e);
//       // Logique pour gérer l'échec de la connexion si nécessaire
//     }
//   }
// }









// import Phaser from "phaser";
// import { network } from "../../services/network";
// import { GameState } from "../../../../server/src/rooms/schema/GameState";
// import { getStateCallbacks, Room } from "colyseus.js";

// export class LoadingScene extends Phaser.Scene {
//   room: Room<GameState> | null = null;

//   constructor() {
//     super("LoadingScene");
//   }

//   init(data: { gameRoom: Room }) {
//     this.room = data.gameRoom;
//   }

//   preload() {
//     // Loading bar
//     const width = this.cameras.main.width;
//     const height = this.cameras.main.height;

//     const progressBar = this.add.rectangle(width / 2, height / 2, 0, 30, 0x44aa44);
//     const progressBox = this.add.rectangle(width / 2, height / 2, 320, 40, 0x222222);

//     this.add.text(width / 2, height / 2 - 50, "Chargement...", {
//       font: "20px Arial",
//       color: "#ffffff",
//     }).setOrigin(0.5);

//     this.load.on("progress", (value: number) => {
//       progressBar.width = 300 * value;
//     });

//     this.load.on("complete", () => {
//       progressBar.destroy();
//       progressBox.destroy();
//     });

//     // Assets
//     this.load.image("enemy", "assets/enemy.png");
//     this.load.image("tower", "assets/tower.png");
//     this.load.image('grass', 'assets/grass.jpg');
//   }

//   create() {
//     console.log("Dans la LoadingScene, on envoi loaded à la room : ", this.room!.roomId);
//     console.log("Dans la LoadingScene, room state : ", this.room!);
//     this.room?.send("loaded"); 

//     this.room?.onMessage("begin", () => {
//       console.log("Tous les joueurs ont chargé! Démarrage de GameScene...");
//       this.scene.start("GameScene", { room: this.room });
//     });
//   }
// }






import Phaser from "phaser";
import { network } from "../../services/network";
import { GameState } from "../../../../server/src/rooms/schema/GameState";
import { getStateCallbacks, Room } from "colyseus.js";

export class LoadingScene extends Phaser.Scene {
  room: Room<GameState> | null = null;
  roomId: string = "";
  options: any = {}; // Pour stocker les options (uid, username, etc.)

  constructor() {
    super("LoadingScene");
  }

  init(data: { roomId: string, options: any }) {
    this.roomId = data.roomId;
    this.options = data.options;
  }

  preload() {
    // Loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.rectangle(width / 2, height / 2, 0, 30, 0x44aa44);
    const progressBox = this.add.rectangle(width / 2, height / 2, 320, 40, 0x222222);

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

  async create() {
    try {
        // 1. Rejoindre la GameRoom APRÈS le chargement des assets
        this.room = await network.joinGame(this.roomId, this.options);

        console.log("Rejoint GameRoom :", this.room.roomId);
        await new Promise(resolve => setTimeout(resolve, 3000));
        // 2. Envoyer le message 'loaded' après avoir rejoint
        this.room.send("loaded"); 

        // 3. Écouteur pour le démarrage du jeu
        this.room.onMessage("begin", () => {
            console.log("Tous les joueurs ont chargé! Démarrage de GameScene...");
            this.scene.start("GameScene", { room: this.room });
        });

    } catch (e) {
        console.error("Erreur lors de la jointure à la GameRoom:", e);
        // Logique pour retourner à l'accueil si échec
    }
  }
}