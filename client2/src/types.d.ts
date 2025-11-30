declare global {
  interface Window { __PHASER_GAME__?: any }
}

export type LobbyState = any; // affiner selon ton schema serveur
export type PlayerState = any;