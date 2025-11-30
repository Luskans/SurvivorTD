import { writable, get } from 'svelte/store';
import type { Room } from 'colyseus.js';

/** État de l'écran actuel: 'home', 'lobby', 'game' */
export const currentScreen = writable<'home' | 'lobby' | 'game'>('home');

/** Stocke l'instance de la Room Colyseus */
export const lobbyRoom = writable<Room | null>(null);

/** L'état du lobby (si besoin de persister des données spécifiques au lobby) */
// Vous devrez définir LobbyState, PlayerState, etc. (non inclus ici, suppose que vous les avez)
// export const lobbyState = writable<LobbyState | null>(null);

/**
 * Fonction utilitaire pour changer d'écran
 */
export function showScreen(screen: 'home' | 'lobby' | 'game') {
  // Pour la cohérence avec le code existant qui gérait les conteneurs DOM
  document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
  const target = document.getElementById(`${screen}-screen`);
  if (target) target.classList.remove("hidden");

  currentScreen.set(screen);
}

/**
 * Fonction pour se déconnecter et revenir à l'accueil
 */
import { network } from './networking/NetworkService';

export function goToHome() {
  network.leaveRoom(); lobbyRoom.set(null);
  showScreen('home');
}