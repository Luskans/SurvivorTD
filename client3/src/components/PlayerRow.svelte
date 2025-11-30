<script lang="ts">
  export let p: any;
  export let id: string;
  export let room: any;
  import { network } from "../networking/NetworkService";

  function kick() {
    network.voteKick(id);
  }
</script>

<div class="player-entry">
  <div>
    {#if id === room.state.hostId}👑{/if}
    {p.username ?? "Guest"}
    <div class="meta">ELO: {p.elo ?? 1200}</div>
  </div>
  <div class="right">
    <div>{p.isReady ? "✔ READY" : "⏳"}</div>
    {#if id !== room.sessionId}
      <button on:click={kick}>Kick</button>
    {/if}
  </div>
</div>
