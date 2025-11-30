<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { network } from "../networking/NetworkService";
  import { lobbyRoom, goToHome, showScreen, currentScreen } from "../stores";
  import Chat from "./Chat.svelte";
  import { GameScene } from "../game/GameScene"; // Pour démarrer la scène
  // Assurez-vous d'importer getStateCallbacks, PlayerState, LobbyState
import { getStateCallbacks } from "colyseus.js";
  // type PlayerState = any; // Définir vos types Colyseus
  // type LobbyState = any; // Définir vos types Colyseus

  // Assurez-vous d'avoir une Room active
  $: room = $lobbyRoom;

  let playersList: PlayerState[] = [];
  let isLocked: boolean = false;
  let countdown: number | null = null;

  // Pour le bouton "Ready"
  $: myPlayer = playersList.find((p) => p.sessionId === room?.sessionId);
  $: isReady = myPlayer?.isReady ?? false;
  $: readyButtonText = isReady ? "Not Ready" : "Ready";

  // Fonction d'échappement (réutilisée)
  function escape(s: string) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;");
  }

  // --- Logique Colyseus et Svelte ---
  onMount(() => {
    if (!room) return; // Ne pas continuer si pas de room

    const $: any = getStateCallbacks(room);

    // Mise à jour de la liste des joueurs
    const playerAddListener = $(room.state.players).onAdd(
      (p: PlayerState, id: string) => {
        $(p).onChange(() => updatePlayersList());
        updatePlayersList();
      },
    );

    const playerRemoveListener = $(room.state.players).onRemove(
      (p: PlayerState, id: string) => {
        updatePlayersList();
        // Vérifier si c'est le joueur actuel qui quitte (ou est kické)
        if (room?.sessionId === id) {
          console.log("Déconnexion ou kick détecté, retour à l'accueil.");
          goToHome();
        }
      },
    );

    const countdownListener = room.onMessage("countdown", (n: number) =>
      onCountdown(n),
    );
    const countdownStopListener = room.onMessage("countdown_stop", () =>
      onCountdown_stop(),
    );

    const kickedListener = room.onMessage("kicked", (msg: string) => {
      alert(msg || "You were kicked from this lobby.");
      goToHome();
    });

    const startGameListener = room.onMessage(
      "start_game",
      async (data: { roomId: string }) => {
        console.log("Switch to game!", data);
        const gameRoom = await network.joinGame(data.roomId);
        showScreen("game");
        game.scene.start("GameScene", { room: gameRoom });
      },
    );

    const stateChangeListener = room.onStateChange(() => {
      updatePlayersList(); // S'assure de l'update sur tout changement d'état
    });

    // Nettoyage
    return () => {
      playerAddListener();
      playerRemoveListener();
      countdownListener();
      countdownStopListener();
      kickedListener();
      startGameListener();
      stateChangeListener();
    };
  });

  function updatePlayersList() {
    if (room && room.state.players) {
      playersList = Array.from(room.state.players.values());
    }
  }

  // --- Gestion des événements UI ---

  function handleReadyBtn() {
    try {
      if (isLocked) return;
      network.toggleReady();
    } catch (e) {
      console.error(`Erreur du joueur pour passer prêt.`, e);
      alert("Erreur passer prêt");
    }
  }

  function handleLeaveBtn() {
    try {
      if (isLocked) return;
      goToHome();
    } catch (e) {
      console.error(`Erreur du joueur pour quitter le lobby.`, e);
      alert("Erreur pour quitter le lobby");
    }
  }

  function onCountdown(sec: number) {
    countdown = sec;
    // ChatUI s'occupe de l'affichage du message système via le message Colyseus
    isLocked = sec <= 3;
  }

  function onCountdown_stop() {
    countdown = null;
    isLocked = false;
    // ChatUI s'occupe de l'affichage du message système
  }

  function handleInviteClick() {
    if (!room || !room.state.isPrivate) return;
    const inviteURL = `${window.location.origin}/${room.roomId}`;
    navigator.clipboard
      .writeText(inviteURL)
      .then(() => console.log("Lien copié")) // Idéalement, informer l'utilisateur via le Chat
      .catch(() => alert("Impossible de copier le lien"));
  }
</script>

{#if room}
  <div class="lobby-header">
    <h2>Lobby {room.roomId}</h2>
    <div id="invite-container">
      {#if room.sessionId === room.state.hostId && room.state.isPrivate}
        <button on:click={handleInviteClick} class="btn primary">Invite</button>
      {/if}
    </div>
  </div>

  <section class="lobby-section">
    <div class="lobby-left">
      <div class="players-list">
        {#each playersList as player}
          <div
            class="player-entry"
            class:host={player.sessionId === room.sessionId}
          >
            <div>
              <div style="font-weight:700">
                {player.sessionId === room.state.hostId ? "👑" : ""}{escape(
                  player.username ?? "Guest",
                )}
              </div>
              <div class="meta">ELO: {Number(player.elo ?? 1200)}</div>
            </div>

            <div style="display: flex; gap: 8px;">
              <div
                style="color: {player.isReady
                  ? 'var(--success)'
                  : 'var(--muted)'}"
              >
                {player.isReady ? "✔ READY" : "⏳"}
              </div>

              {#if player.sessionId !== room.sessionId}
                <button
                  class="btn mini kick"
                  disabled={isLocked ||
                    (room.state.kicks.has(player.sessionId) &&
                      room.state.kicks
                        .get(player.sessionId)
                        ?.includes(room.sessionId))}
                  on:click={() => network.voteKick(player.sessionId)}
                >
                  Kick
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <div class="lobby-controls">
        <button
          on:click={handleReadyBtn}
          class="btn primary"
          disabled={isLocked}>{readyButtonText}</button
        >
        <button
          on:click={handleLeaveBtn}
          class="btn secondary"
          disabled={isLocked}>Leave</button
        >
        {#if countdown}
          <div class="countdown">START {countdown}</div>
        {/if}
      </div>
    </div>

    <div class="lobby-right">
      <Chat />
    </div>
  </section>
{:else}
  <p>Connexion au lobby perdue. Retour à l'accueil...</p>
{/if}
