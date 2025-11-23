import { network } from "../networking/NetworkService";
import { ScreenManager } from "./ScreenManager";
import { LobbyUI } from "./LobbyUI";

export class HomeUI {
  constructor() {
    this.listenButtons();
  }

  listenButtons() {
    document.getElementById("play-btn")!.onclick = () => this.play();
    document.getElementById("create-private-btn")!.onclick = () => this.createPrivate();
    // document.getElementById("join-private-btn")!.onclick = () => this.onJoinPrivate();
  }

  async play() {
    try {
      await network.joinPublicLobby();
      new LobbyUI(network.room);
      ScreenManager.show("lobby-screen");

    } catch (e) {
      console.error("Error join public:", e);
      alert("Impossible de rejoindre le lobby public.");
    }
  }

  async createPrivate() {
    try {
      // const code = Math.random().toString(36).slice(2,7).toUpperCase();
      // await network.createPrivateLobby(code);
      await network.createPrivateLobby();
      new LobbyUI(network.room);
      // (document.getElementById("room-code")!).textContent = code;
      // document.getElementById("room-code-container")!.classList.remove("hidden");
      ScreenManager.show("lobby-screen");

    } catch (e) {
      console.error("Error create private:", e);
      alert("Impossible de créer un lobby privé.");
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
