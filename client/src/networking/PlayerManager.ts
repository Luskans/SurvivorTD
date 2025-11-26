// src/PlayerManager.ts
import { v4 as uuidv4 } from 'uuid'; // Nécessite l'installation de 'uuid' : npm install uuid @types/uuid

const STORAGE_KEY_PLAYER_ID = 'tower_brawl_playerId';
const STORAGE_KEY_USERNAME = 'tower_brawl_username';

/**
 * Gère l'ID unique persistant (UUID) du joueur et son pseudo côté client.
 */
export class PlayerManager {
    private playerId: string;
    private username: string | null;

    constructor() {
        this.playerId = this.getOrCreatePlayerId();
        this.username = localStorage.getItem(STORAGE_KEY_USERNAME);
    }

    /**
     * Récupère l'UUID depuis localStorage ou en génère un nouveau.
     * @returns L'UUID du joueur.
     */
    private getOrCreatePlayerId(): string {
        let id = localStorage.getItem(STORAGE_KEY_PLAYER_ID);
        if (!id) {
            id = uuidv4();
            localStorage.setItem(STORAGE_KEY_PLAYER_ID, id);
            console.log("Nouvel UUID de joueur généré et sauvegardé:", id);
        } else {
            console.log("UUID de joueur existant récupéré:", id);
        }
        return id;
    }

    public getPlayerId(): string {
        return this.playerId;
    }

    public getUsername(): string | null {
        return this.username;
    }

    public isUsernameSet(): boolean {
        // Un pseudo est considéré comme défini s'il existe et n'est pas vide/que des espaces
        return !!this.username && this.username.trim().length > 0;
    }

    public setUsername(newUsername: string): void {
        this.username = newUsername.trim();
        localStorage.setItem(STORAGE_KEY_USERNAME, this.username);
    }
}

// Instance singleton pour un accès facile
export const playerManager = new PlayerManager();