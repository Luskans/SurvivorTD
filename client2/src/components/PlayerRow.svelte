<script lang="ts">
  type PlayerState = any; // Remplacez par le type réel

  export let p: PlayerState;
  export let id: string;
  export let room: any;
  export let isLocked: boolean;

  import { network } from "../services/network";

  $: isKickVoted = room.state.kicks.has(id) && room.state.kicks.get(id)?.includes(room.sessionId);
  $: isDisabled = isKickVoted || isLocked;

  function kick() {
    network.voteKick(id);
  }
</script>

<div class="player-entry" class:host={id === room.sessionId}>
  <div>
    <div style="font-weight:700">
      {#if id === room.state.hostId}👑{/if}
      {p.username ?? "Guest"}
    </div>
    <div class="meta">ELO: {p.elo ?? 1200}</div>
  </div>

  <div class="right" style="display: flex; gap: 8px;">
    <div style="color: {p.isReady ? 'var(--success)' : 'var(--muted)'}">
      {p.isReady ? "✔ READY" : "⏳"}
    </div>

    {#if id !== room.sessionId}
      <button class="btn mini kick" on:click={kick} disabled={isDisabled} class:disabled={isDisabled}>
        Kick
      </button>
    {/if}
  </div>
</div>

<style>
  .player-entry {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #f1f4f9;
  }
  .player-entry .meta {
    color: var(--muted);
    font-size: 13px;
  }
  /* .player-entry.host{ outline: 2px solid rgba(255,159,207,0.12); } */
  .player-entry.host {
    color: var(--primary);
  }
</style>
