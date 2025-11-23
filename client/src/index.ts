import { HomeUI } from "./ui/HomeUI";
import { LeaderboardUI } from "./ui/LeaderboardUI";
import { LobbyUI } from "./ui/LobbyUI";
import { network } from "./networking/NetworkService";

// document.addEventListener("DOMContentLoaded", async () => {
//   // Vérifie si on a un roomId dans l’URL → join direct
//   const url = new URL(window.location.href);
//   const roomIdFromURL = url.pathname.split("/").pop();

//   if (roomIdFromURL && roomIdFromURL.length > 0 && roomIdFromURL !== "") {
//     try {
//       console.log("Trying to join private room:", roomIdFromURL);
//       const room = await network.joinPrivateLobbyById(roomIdFromURL);
//       new LobbyUI(room);
//       return;

//     } catch (err) {
//       console.warn("Erreur lors de la connexion à la room privée", err);
//       history.replaceState(null, "", "/");
//     }
//   }

//   new LeaderboardUI().initSampleData(); // remplit demo (remplace par fetch réel)
//   new HomeUI();
// });



document.addEventListener("DOMContentLoaded", async () => {
  const url = new URL(window.location.href);
  // const segments = url.pathname.split("/").filter(s => s.length > 0);
  // let roomIdFromURL: string | null = null;

  // if (segments.length >= 2 && segments[0] === "private") {
  //   roomIdFromURL = segments[1];
  // }

  const segments = url.pathname.split("/").filter(Boolean); // ignore "" segments
  const roomId = segments[segments.length - 1];

  if (segments[0] === "private" && roomId) {
  // if (roomIdFromURL) {
    try {
      console.log("Trying to join private room:", roomId);
      const room = await network.joinPrivateLobbyById(roomId);
      new LobbyUI(room);
      return;

    } catch (err) {
      console.warn("Erreur lors de la connexion à la room privée", err);
      history.replaceState(null, "", "/");
    }
  }

  new LeaderboardUI().initSampleData(); // remplit demo (remplace par fetch réel)
  new HomeUI();
});
