// import { network } from "../networking/network";
// import { showHome } from "./home";

// export function showLobby() {
//   document.getElementById("home-screen")!.classList.add("hidden");
//   document.getElementById("lobby-screen")!.classList.remove("hidden");

//   const room = network.room;
//   if (!room) return;

//   const playersList = document.getElementById("players-list")!;
//   const chatMessages = document.getElementById("chat-messages")!;

//   room.state.players.onAdd((player, key) => updatePlayersList());
//   room.state.players.onRemove((player, key) => updatePlayersList());
//   room.state.players.onChange((player, key) => updatePlayersList());

//   function updatePlayersList() {
//     let html = "<h3>Joueurs</h3>";
//     room.state.players.forEach((p) => {
//       html += `<div>${p.name} - ELO ${p.elo} ${p.ready ? "✔" : ""}</div>`;
//     });
//     playersList.innerHTML = html;
//   }

//   // chat incoming
//   room.onMessage("chat", (msg) => {
//     chatMessages.innerHTML += `<div>${msg.text}</div>`;
//   });

//   document.getElementById("ready-btn")!.onclick = () => {
//     network.toggleReady();
//   };

//   document.getElementById("chat-send-btn")!.onclick = () => {
//     const input = document.getElementById("chat-text") as HTMLInputElement;
//     if (input.value) {
//       network.sendChat(input.value);
//       input.value = "";
//     }
//   };

//   document.getElementById("leave-btn")!.onclick = () => {
//     network.leaveRoom();
//     showHome();
//   };
// }



// #########################


import { getStateCallbacks } from "colyseus.js";
import { network } from "../networking/network";
import { showHome } from "./home";

export function showLobby() {
  const room = network.room!;
  const $ = getStateCallbacks(room);

  document.getElementById("home-screen")!.classList.add("hidden");
  document.getElementById("lobby-screen")!.classList.remove("hidden");

  const playersList = document.getElementById("players-list")!;
  const chatMessages = document.getElementById("chat-messages")!;

  // Track players list
  $(room.state).players.onAdd((player, sessionId) => {
    updatePlayers();
    $(player).onChange(updatePlayers);
  });

  $(room.state).players.onRemove(() => updatePlayers());

  function updatePlayers() {
    let html = "<h3>Joueurs</h3>";
    room.state.players.forEach((p) => {
      html += `<div>${p.name} — ELO: ${p.elo} ${p.ready ? "✔" : "⏳"}</div>`;
    });
    playersList.innerHTML = html;
  }

  // Chat messages
  room.onMessage("chat", (msg) => {
    chatMessages.innerHTML += `<div>${msg.text}</div>`;
  });

  // UI Buttons
  document.getElementById("ready-btn")!.onclick = () => {
    network.toggleReady();
  };

  document.getElementById("chat-send-btn")!.onclick = () => {
    const input = document.getElementById("chat-text") as HTMLInputElement;
    if (input.value.trim()) {
      network.sendChat(input.value);
    }
    input.value = "";
  };

  document.getElementById("leave-btn")!.onclick = () => {
    network.leaveRoom();
    showHome();
  };
}
