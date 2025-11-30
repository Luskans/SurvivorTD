<script lang="ts">
  import Home from "./components/Home.svelte";
  import Lobby from "./components/Lobby.svelte";
  import { currentScreen, showScreen } from "./stores";
  import { onMount } from "svelte";
  import Leaderboard from "./components/Leaderboard.svelte"; // Pour le maintenir sur la Home

  // Initialisation: Svelte prend le contrôle de l'UI.
  // Les éléments du DOM existants dans index.html (sauf #app) sont conservés
  // pour la phase de transition (PhaserGame prend le contrôle de #game-screen)

  onMount(() => {
    // Initialisation des écrans selon le prototype (Phaser est monté dans #game-screen)
    // Nous n'utilisons plus ScreenManager.ts
    showScreen("home"); // S'assure que 'home-screen' est visible au démarrage
  });
</script>id="home-screen" class="screen"

{#if $currentScreen === "home"}
  <div >
    <Home />
  </div>

  <div id="lobby-screen" class="screen hidden">
    <Lobby />
  </div>

  <div id="game-screen" class="screen hidden"></div>
{:else if $currentScreen === "lobby"}
  <div id="home-screen" class="screen hidden">
    <Home />
  </div>

  <div id="lobby-screen" class="screen">
    <Lobby />
  </div>

  <div id="game-screen" class="screen hidden"></div>
{:else if $currentScreen === "game"}
  <div id="home-screen" class="screen hidden">
    <Home />
  </div>

  <div id="lobby-screen" class="screen hidden">
    <Lobby />
  </div>

  <div id="game-screen" class="screen"></div>
{/if}

<style>
  /* Assurez-vous que seule la div d'application est montrée par défaut si elle n'est pas masquée par la logique ci-dessus */
</style>
