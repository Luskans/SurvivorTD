<script lang="ts">
  import {
    getOrCreateUID,
    usernameStore,
    updateAndSaveUsername,
  } from "../networking/PlayerService";
  import { network } from "../networking/NetworkService";
  import { showScreen } from "../stores";
  import Leaderboard from "./Leaderboard.svelte";

  let usernameInput = $usernameStore ?? "";
  let inputError: string | null = null;

  // Détecter si un nom est déjà défini
  $: isUsernameSet = !!$usernameStore;

  // --- Fonctions de gestion ---

  async function handlePlayBtn() {
    if (!isUsernameSet) {
      if (!updateAndSaveUsername(usernameInput)) {
        inputError = "2-20 caractères, lettres et chiffres uniquement.";
        return;
      }
      inputError = null;
    }

    const pathName = window.location.pathname;
    const roomId = pathName.substring(1);
    const uid = getOrCreateUID();
    const username = $usernameStore!;

    try {
      let room;
      if (roomId && roomId.length > 5) {
        // Vérification simple de roomId
        room = await network.joinPrivateLobbyById(roomId, { uid, username });
        console.log(
          `Connection du joueur ${username} au lobby privé ${room.roomId} réussie.`,
        );
      } else {
        room = await network.joinPublicLobby({
          uid,
          username,
          isPrivate: false,
        });
        console.log(
          `Connection du joueur ${username} au lobby public ${room.roomId} réussie.`,
        );
      }
      // LobbyUI n'est plus instancié, le composant Lobby.svelte est affiché via le store.
      showScreen("lobby");
    } catch (e) {
      console.error("Error join public/private:", e);
      alert("Impossible de rejoindre le lobby.");
    }
  }

  async function handleCreatePrivateBtn() {
    if (!isUsernameSet) {
      if (!updateAndSaveUsername(usernameInput)) {
        inputError = "2-20 caractères, lettres et chiffres uniquement.";
        return;
      }
      inputError = null;
    }

    const uid = getOrCreateUID();
    const username = $usernameStore!;
    try {
      const room = await network.createPrivateLobby({
        uid,
        username,
        isPrivate: true,
      });
      console.log(
        `Création du lobby privé ${room.roomId} par le joueur ${username} réussie.`,
      );
      showScreen("lobby");
    } catch (e) {
      console.error("Error create private:", e);
      alert("Impossible de créer un lobby privé.");
    }
  }
</script>

<header>
  <h1>Tower Brawl</h1>
  <p class="subtitle">
    Competitive Tower Defense — play with friends or survive in solo
  </p>
</header>

<div class="home-body">
  <div class="home-actions">
    <div class="home-actions-inside">
      {#if !isUsernameSet}
        <div id="username-input-container">
          <input
            type="text"
            bind:value={usernameInput}
            placeholder="Enter your username"
            minlength="2"
            maxlength="20"
            required
          />
          <p id="username-input-infos">
            {inputError || "2-20 characters, letters and numbers only"}
          </p>
        </div>
      {:else}
        <p id="username-welcome-container">Welcome back **{$usernameStore}**</p>
      {/if}

      <button on:click={handlePlayBtn} class="btn primary">Play</button>
      <button on:click={handleCreatePrivateBtn} class="btn secondary"
        >Create private room</button
      >
    </div>
  </div>

  <div class="home-leaderboard">
    <Leaderboard />
  </div>
</div>
