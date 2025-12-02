import type { Scene } from "phaser";
import type { PlayerState } from "../../../../server/src/rooms/schema/PlayerState";

const ZONE_SIZE = 1024;
const SPACING = 100;
const TILE_SIZE = 256;
const GRID_COLUMNS = 4;
const HALF_ZONE = ZONE_SIZE / 2;
// const TILES_PER_SIDE = ZONE_SIZE / TILE_SIZE;

export class SetupService {

  constructor(private scene: Scene) {}

  // createPlayersZone(players: Map<string, any> | any[]) {
  //   // Convertir la Map Colyseus en tableau pour utiliser l'index
  //   const playerArray = Array.from(players.values());

  //   playerArray.forEach((player, index) => {
  //       // 1. Calculer la position sur la grille
  //       const col = index % GRID_COLUMNS;
  //       const row = Math.floor(index / GRID_COLUMNS);

  //       // CSG (Coin Supérieur Gauche) de la zone
  //       const csgX = col * (ZONE_SIZE + SPACING);
  //       const csgY = row * (ZONE_SIZE + SPACING);

  //       // Position centrale de la tour (Coordonnées du monde)
  //       const centerX = csgX + HALF_ZONE;
  //       const centerY = csgY + HALF_ZONE;
        
  //       // --- 2. Création de la Zone de Tuiles (1024x1024) ---
        
  //       // Utiliser un Tilemap pour un meilleur rendu de la zone
  //       const map = this.scene.make.tilemap({ tileWidth: TILE_SIZE, tileHeight: TILE_SIZE, width: TILES_PER_SIDE, height: TILES_PER_SIDE });
  //       const tileset = map.addTilesetImage('grass', 'grass', TILE_SIZE, TILE_SIZE); // 'grass' doit être la clé de votre image tuile
        
  //       // Créer une couche de tuiles (remplir la zone)
  //       const layer = map.createBlankLayer(`Zone_${index}`, tileset);
        
  //       // Positionner la couche au CSG calculé
  //       layer.setPosition(csgX, csgY);
        
  //       // Remplir la couche avec la tuile (index 0 ou 1, selon votre tileset)
  //       layer.fill(1, 0, 0, TILES_PER_SIDE, TILES_PER_SIDE); 

  //       // Rendre les bords un peu plus visibles si nécessaire (Optionnel)
  //       // layer.setDepth(-1); 

  //       // --- 3. Placement de la Tour au centre ---
        
  //       // Placer le sprite 'tower' à la position centrale
  //       const towerSprite = this.scene.add.sprite(centerX, centerY, 'tower');
  //       towerSprite.setOrigin(0.5, 0.5); // S'assurer que le centre du sprite est à (centerX, centerY)

  //       // --- 4. Mise à jour des données du Joueur (Serveur/Client) ---

  //       // Mettre à jour la position de la tour sur l'objet joueur
  //       // (Ceci doit idéalement se synchroniser AVEC le serveur via Colyseus si c'est la source de vérité!)
  //       if (player.tower && player.tower.position) {
  //           player.tower.position.x = centerX;
  //           player.tower.position.y = centerY;
  //       }

  //       // Stocker la référence visuelle pour la suite du jeu (attaques, dégâts)
  //       // this.playerTowers.set(player.sessionId, towerSprite);
  //   });

  //   // Optionnel : Régler la caméra pour centrer le champ de jeu total
  //   // Calculez la taille totale (4 colonnes * 1024) + (3 espacements * 100)
  //   // Et le centre pour la caméra.
  // }

  createPlayersZone(players: Map<string, any> | any[]) {
    const playerArray = Array.from(players.values());

    // Calculer les dimensions totales pour définir les limites de la caméra
    const totalWidth = GRID_COLUMNS * ZONE_SIZE + (GRID_COLUMNS - 1) * SPACING;
    const totalHeight = 2 * ZONE_SIZE + (2 - 1) * SPACING; // 2 rangées max

    // Définir les limites du monde de jeu
    this.scene.physics.world.setBounds(0, 0, totalWidth, totalHeight);
    this.scene.cameras.main.setBounds(0, 0, totalWidth, totalHeight);
    
    // Centrer la caméra au début pour voir la première zone
    this.scene.cameras.main.centerOn(totalWidth / 2, totalHeight / 2);
    
    // Zoom initial pour voir une partie de la grille
    this.scene.cameras.main.setZoom(0.7); 

    playerArray.forEach((player, index) => {
      // 1. Calculer la position sur la grille
      const col = index % GRID_COLUMNS;
      const row = Math.floor(index / GRID_COLUMNS);

      // CSG (Coin Supérieur Gauche) de la zone
      const csgX = col * (ZONE_SIZE + SPACING);
      const csgY = row * (ZONE_SIZE + SPACING);

      // Position centrale de la tour (Coordonnées du monde)
      const centerX = csgX + HALF_ZONE;
      const centerY = csgY + HALF_ZONE;
      
      // --- 2. Création de la Zone de Tuiles (1024x1024) ---
      
      // Utilisation d'un TileSprite pour répéter l'image 'grass' sur la zone
      // Le TileSprite démarre au CSG et a une taille de ZONE_SIZE x ZONE_SIZE
      const grassTile = this.scene.add.tileSprite(
        csgX, 
        csgY, 
        ZONE_SIZE, 
        ZONE_SIZE, 
        'grass' // Clé de votre image PNG 256x256
      );
      // Le TileSprite doit être aligné sur son coin supérieur gauche
      grassTile.setOrigin(0, 0); 
      // Positionner le fond derrière les autres éléments
      grassTile.setDepth(-10); 

      // --- 3. Placement de la Tour au centre ---
      
      // Placer le sprite 'tower' à la position centrale
      const towerSprite = this.scene.add.sprite(centerX, centerY, 'tower');
      towerSprite.setOrigin(0.5, 0.5); 
      towerSprite.setDepth(1); // S'assurer que la tour est au-dessus du TileSprite

      // --- 4. Mise à jour des données du Joueur (Optionnel, dépend du serveur) ---
      if (player.tower && player.tower.position) {
        player.tower.position.x = centerX;
        player.tower.position.y = centerY;
      }

      // Afficher l'index pour vérification
      this.scene.add.text(centerX, centerY + 200, `Zone ${index}`, { fontSize: '40px', color: '#ff00ff' }).setOrigin(0.5);
    });
  }
}
