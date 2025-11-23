import { network } from "../networking/network";
import { showLobby } from "./lobby";

export function initHomeUI() {
  const btnPlay = document.getElementById("play-btn")!;

  btnPlay.onclick = async () => {
    try {
      await network.joinPublicLobby();
      showLobby();
    } catch (err) {
      console.error("Lobby join failed", err);
    }
  };
}

export function showHome() {
  document.getElementById("home-screen")!.classList.remove("hidden");
  document.getElementById("lobby-screen")!.classList.add("hidden");
  // document.getElementById("home-screen")!.style.display = "none";
  // document.getElementById("lobby-screen")!.style.display = "flex";
}
