import { network } from "../networking/NetworkService";
import { ScreenManager } from "./ScreenManager";
import { LobbyUI } from "./LobbyUI";

export class HomeUI {
  constructor() {
    this.setupButtons();
  }

  setupButtons() {
    document.getElementById("play-btn")!.onclick = () => this.handlePlayBtn();
    document.getElementById("create-private-btn")!.onclick = () => this.handleCreatePrivateBtn();
  }

  async handlePlayBtn() {
    try {
      const room = await network.joinPublicLobby();
      console.log("Connection au lobby public réussie :", room.roomId);
      new LobbyUI(room);
      ScreenManager.show("lobby-screen");

    } catch (e) {
      console.error("Error join public:", e);
      alert("Impossible de rejoindre le lobby public.");
    }
  }

  async handleCreatePrivateBtn() {
    try {
      const room = await network.createPrivateLobby(true);
      console.log("Connection au lobby privé réussie :", room.roomId);
      new LobbyUI(room);
      ScreenManager.show("lobby-screen");

    } catch (e) {
      console.error("Error create private:", e);
      alert("Impossible de créer un lobby privé.");
    }
  }
}
