import { network } from "../networking/NetworkService";
import { ScreenManager } from "./ScreenManager";
import { LobbyUI } from "./LobbyUI";
import { getOrCreateUID, getUsername, validateName } from "../networking/PlayerService";

export class HomeUI {
  constructor() {
    this.setupButtons();
    this.setupUsername();
  }

  setupButtons() {
    document.getElementById("play-btn")!.onclick = () => this.handlePlayBtn();
    document.getElementById("create-private-btn")!.onclick = () => this.handleCreatePrivateBtn();
  }

  setupUsername() {
    const usernameInputContainer = document.getElementById("username-input-container");
    const usernameWelcomeContainer = document.getElementById("username-welcome-container");
    const username = getUsername();
    if (username) {
      usernameInputContainer?.classList.add("hidden");
      usernameWelcomeContainer?.classList.remove("hidden");
      (usernameWelcomeContainer) ? usernameWelcomeContainer.textContent = `Welcome back ${username}` : "";
    }
  }

  async handlePlayBtn() {
    const pathName = window.location.pathname;
    const roomId = pathName.substring(1);
    let username = await getUsername();
    const uid = await getOrCreateUID();

    if (!username) {
      const valid = await validateName();
      if (!valid) return;

      username = await getUsername();
    }
    this.setupUsername();

    try {
      let room;
      if (roomId) {
        room = await network.joinPrivateLobbyById(roomId, { uid: uid, username : username! });
        console.log(`Connection du joueur ${username} au lobby privé ${room.roomId} réussie.`);
      } else {
        room = await network.joinPublicLobby({ uid: uid, username : username!, isPrivate: false });
        console.log(`Connection du joueur ${username} au lobby public ${room.roomId} réussie.`);
      }
      new LobbyUI(room);
      ScreenManager.show("lobby-screen");

    } catch (e) {
      console.error("Error join public:", e);
      alert("Impossible de rejoindre le lobby public.");
    }
  }

  async handleCreatePrivateBtn() {
    const username = getUsername();
    const uid = getOrCreateUID();
    try {
      const room = await network.createPrivateLobby({ uid: uid, username : username!, isPrivate: true });
      console.log(`Création du lobby privé ${room.roomId} par le joueur ${username} réussie.`);
      new LobbyUI(room);
      ScreenManager.show("lobby-screen");

    } catch (e) {
      console.error("Error create private:", e);
      alert("Impossible de créer un lobby privé.");
    }
  }
}
