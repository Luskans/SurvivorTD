import { Client, Room } from 'colyseus.js';
import { lobbyRoom, showScreen, goToHome } from '../stores'; // Importation des stores
// ... (Import de LobbyState, PlayerState)

export class NetworkService {
  client = new Client("ws://localhost:2567");
  // room: Room<LobbyState> | null = null; // Remplacé par le store

  // Méthodes de connexion/création
  async joinPublicLobby(options?: { uid: string, username: string, isPrivate: boolean }): Promise<Room> {
    const room = await this.client.joinOrCreate("lobby", options);
    lobbyRoom.set(room);
    return room;
  }

  async createPrivateLobby(options?: { uid: string, username: string, isPrivate: boolean }): Promise<Room> {
    const room = await this.client.create("lobby", options);
    lobbyRoom.set(room);
    return room;
  }

  async joinPrivateLobbyById(roomId: string, options?: { uid: string, username: string }): Promise<Room> {
    const room = await this.client.joinById(roomId, options);
    lobbyRoom.set(room);
    return room;
  }

  async joinGame(roomId: string): Promise<Room> {
    const room = await this.client.joinById(roomId);
    // Ne pas changer lobbyRoom pour l'instant, car la 'GameScene' gère son propre état
    // C'est juste pour le démarrage de Phaser.
    return room
  }

  // Les méthodes d'envoi restent inchangées, mais elles utilisent la room du store
  toggleReady() {
    const room = lobbyRoom.get(); // Utilise la fonction 'get' de Svelte
    room?.send("toggle_ready");
  }

  sendChat(text: string) {
    const room = lobbyRoom.get();
    room?.send("chat", text);
  }

  voteKick(targetId: string) {
    const room = lobbyRoom.get();
    room?.send("vote_kick", targetId);
  }

  leaveRoom() {
    const room = lobbyRoom.get();
    room?.leave();
    lobbyRoom.set(null); // Vider le store
  }
}

export const network = new NetworkService();