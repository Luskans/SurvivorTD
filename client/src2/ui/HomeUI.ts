// import { network } from "../networking/NetworkService";
// import { LobbyUI } from "./LobbyUI";
// import { ScreenManager } from "./ScreenManager";

// export class HomeUI {
//   constructor() {
//     this.init();
//   }

//   init() {
//     document.getElementById("play-btn")!.onclick = () => this.join();
//     document.getElementById("create-private-btn")!.onclick = () => alert("Soon!");
//   }

//   async join() {
//     await network.joinPublicLobby();
//     new LobbyUI();
//     ScreenManager.show("lobby-screen");
//   }
// }



import { network } from "../networking/NetworkService";
import { ScreenManager } from "./ScreenManager";
import { LobbyUI } from "./LobbyUI";

export class HomeUI {
  constructor() {
    this.init();
  }

  init() {
    // Buttons
    document.getElementById("play-btn")!.onclick = () => this.onPlay();
    document.getElementById("create-private-btn")!.onclick = () => this.onCreatePrivate();
    document.getElementById("join-private-btn")!.onclick = () => this.onJoinPrivate();
  }

  async onPlay() {
    try {
      await network.joinPublicLobby();
      // open lobby UI
      new LobbyUI(network.room);
      ScreenManager.show("lobby-screen");
    } catch (e) {
      console.error("Erreur join public:", e);
      alert("Impossible de rejoindre le lobby public.");
    }
  }

  async onCreatePrivate() {
    try {
      const code = Math.random().toString(36).slice(2,7).toUpperCase();
      await network.createPrivateLobby(code);
      new LobbyUI(network.room);
      // show the generated code in UI
      (document.getElementById("room-code")!).textContent = code;
      document.getElementById("room-code-container")!.classList.remove("hidden");
      ScreenManager.show("lobby-screen");
    } catch (e) {
      console.error(e);
    }
  }

  // async onJoinPrivate() {
  //   const code = (document.getElementById("private-code") as HTMLInputElement).value.trim();
  //   if (!code) { alert("Entrez un code"); return; }
  //   try {
  //     await network.joinPrivateLobbyByCode(code);
  //     new LobbyUI(network.room);
  //     ScreenManager.show("lobby-screen");
  //   } catch (e) {
  //     console.error("Failed join private", e);
  //     alert("Impossible de rejoindre la partie privée.");
  //   }
  // }
}
