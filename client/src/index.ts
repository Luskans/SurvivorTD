// import Phaser from "phaser";
// import { GameScene } from "./scenes/GameScene";
// import "./ui/home.css";
// import "./ui/lobby.css";
// import { network } from "./networking";
// import { getStateCallbacks } from "colyseus.js";

// const $ = getStateCallbacks(this.room);

// const homeScreen = document.getElementById("home-screen")!;
// const lobbyScreen = document.getElementById("lobby-screen")!;
// const playersList = document.getElementById("players-list")!;
// const chatMessages = document.getElementById("chat-messages")!;

// function showHome() {
//   homeScreen.style.display = "flex";
//   lobbyScreen.style.display = "none";
// }

// function showLobby() {
//   homeScreen.style.display = "none";
//   lobbyScreen.style.display = "flex";
// }

// function enterLobbyUI() {
//   console.log("Entering lobby UI!");
//   showLobby();

//   const room = network.room;
//   if (!room) {
//     console.error("enterLobbyUI called but network.room is null");
//     return;
//   }

//   // Render list on player changes
//   room.state.players.onAdd = (player, key) => updatePlayersList();
//   room.state.players.onRemove = (player, key) => updatePlayersList();
  
//   // Render ready changes
//   room.state.players.onChange = () => updatePlayersList();

//   room.onMessage("chat", addChatMessage);

//   setupUIEvents();
// }

// function updatePlayersList() {
//   const room = network.room;
//   let html = "<h3>Joueurs</h3>";
//   room.state.players.forEach((player) => {
//     html += `
//       <div>
//         <strong>${player.name}</strong>
//         (ELO: ${player.elo})
//         - ${player.ready ? "✔ READY" : "⏳"}
//       </div>
//     `;
//   });
//   playersList.innerHTML = html;
// }

// function addChatMessage({ from, text }) {
//   chatMessages.innerHTML += `<div><strong>${from}:</strong> ${text}</div>`;
//   chatMessages.scrollTop = chatMessages.scrollHeight;
// }

// function setupUIEvents() {
//   const room = network.room;

//   document.getElementById("ready-btn")!.onclick = () => {
//     room.send("toggle_ready");
//   };

//   document.getElementById("chat-send-btn")!.onclick = () => {
//     const input = document.getElementById("chat-text") as HTMLInputElement;
//     const message = input.value.trim();
//     if (!message) return;
//     room.send("chat", message);
//     input.value = "";
//   };
// }

// document.getElementById("play-btn")!.addEventListener("click", async () => {
//   console.log("Searching public lobby…");

//   try {
//     network.room = await network.client.joinOrCreate("public_lobby");
//     console.log("Joined public lobby!");
//     enterLobbyUI();
//   } catch (e) {
//     console.error(e);
//   }
// });

// document.getElementById("create-private-btn")!.addEventListener("click", async () => {
//   const code = Math.random().toString(36).substring(2, 7).toUpperCase();
//   console.log("Creating private lobby:", code);

//   try {
//     network.room = await network.client.create("private_lobby", { code });
//     console.log("Private lobby created!");
//     enterLobbyUI();
//   } catch (e) {
//     console.error(e);
//   }
// });

// document.getElementById("join-private-btn")!.addEventListener("click", async () => {
//   const code = (document.getElementById("private-code") as HTMLInputElement).value;

//   if (!code) return alert("Entrez un code!");

//   try {
//     network.room = await network.client.joinById("private_lobby", { code });
//     enterLobbyUI();
//   } catch (e) {
//     alert("Code invalide!");
//   }
// });


// // game config
// const config: Phaser.Types.Core.GameConfig = {
//     type: Phaser.AUTO,
//     width: 800,
//     height: 600,
//     backgroundColor: '#b6d53c',
//     parent: 'phaser-example',
//     physics: { default: "arcade" },
//     pixelArt: true,
//     scene: [ GameScene ],
// };
 
// // instantiate the game
// const game = new Phaser.Game(config);



// ###############################


// import Phaser from "phaser";
// import { HomeScene } from "./scenes/HomeScene";
// import { LobbyScene } from "./scenes/LobbyScene";
// import { GameScene } from "./scenes/GameScene";

// const config: Phaser.Types.Core.GameConfig = {
//     type: Phaser.AUTO,
//     width: 800,
//     height: 600,
//     backgroundColor: '#b6d53c',
//     parent: 'phaser-example',
//     physics: { default: "arcade" },
//     pixelArt: true,
//     scene: [ HomeScene, LobbyScene, GameScene ],
// };
 
// const game = new Phaser.Game(config);



// ###############################


import { initHomeUI } from "./ui/home";

window.addEventListener("DOMContentLoaded", () => {
  initHomeUI();
});

