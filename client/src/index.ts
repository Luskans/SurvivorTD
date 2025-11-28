import { HomeUI } from "./ui/HomeUI";
import { LeaderboardUI } from "./ui/LeaderboardUI";
import { LobbyUI } from "./ui/LobbyUI";
import { network } from "./networking/NetworkService";
import { ScreenManager } from "./ui/ScreenManager";
import { GameScene } from "./ui/GameScene";
import { getOrCreateUID } from "./networking/PlayerService";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#b6d53c',
    parent: 'game-screen',
    physics: { default: "arcade" },
    pixelArt: true,
    scene: [ GameScene ],
};
 
export const game = new Phaser.Game(config);

// document.addEventListener("DOMContentLoaded", async () => {
//   getOrCreateUID();

//   const url = new URL(window.location.href);
//   const segments = url.pathname.split("/").filter(Boolean);
//   const roomId = segments[segments.length - 1];

//   let joinedPrivateRoom = false;

//   if (segments[0] === "private" && roomId) {
//     try {
//       console.log("Trying to join private room:", roomId);
//       const room = await network.joinPrivateLobbyById(roomId);
//       new LobbyUI(room!);
//       ScreenManager.show("lobby-screen");
//       joinedPrivateRoom = true;

//     } catch (err) {
//       console.warn("Erreur lors de la connexion à la room privée", err);
//       let errorMessage = "Impossible de rejoindre la salle.";
//       if (err instanceof Error) {
//           errorMessage = err.message;
//       }
//       alert(errorMessage);
//       history.replaceState(null, "", "/");   
//     }
//   }

//   if (!joinedPrivateRoom) {
//     new LeaderboardUI().initSampleData();
//     new HomeUI();
//   }
// });


document.addEventListener("DOMContentLoaded", async () => {
  getOrCreateUID();

  // const pathName = window.location.pathname;
  // const roomId = pathName.substring(1);

  new LeaderboardUI().initSampleData();
  new HomeUI();
});