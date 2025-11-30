<script lang="ts">
  import { onMount } from "svelte";
  import { usernameStore } from "../networking/PlayerService";

  type LeaderboardItem = { rank: number; name: string; elo: number };
  let leaderboardList: LeaderboardItem[] = [];
  let currentName = $usernameStore; // Récupère le nom d'utilisateur

  // onMount simule l'initSampleData()
  onMount(() => {
    // demo data (remplacer par fetch réel depuis le serveur)
    const demo: LeaderboardItem[] = [
      { rank: 1, name: "Aster", elo: 1620 },
      { rank: 2, name: "Blossom", elo: 1590 },
      { rank: 3, name: "Clover", elo: 1555 },
      { rank: 4, name: $usernameStore ?? "You", elo: 1500 }, // Utilise le nom réel si disponible
      { rank: 5, name: "Dune", elo: 1420 },
      { rank: 6, name: "Echo", elo: 1390 },
    ];
    leaderboardList = demo;
    // currentName est mis à jour si l'utilisateur change de nom
    usernameStore.subscribe((name) => (currentName = name));
  });

  // Données personnelles filtrées
  $: personnalData = leaderboardList.find((item) => item.name === currentName);
</script>

<div class="leaderboard-panel">
  <h3>Leaderboard</h3>
  <div class="leaderboard">
    {#each leaderboardList as item}
      <div class="leader-row" class:self={item.name === currentName}>
        <div>\#{item.rank} {item.name}</div>
        <div>{item.elo}</div>
      </div>
    {/each}
  </div>
</div>

<div class="leaderboard-panel">
  <div id="personnal-leaderboard">
    {#if personnalData}
      <div class="leader-row self">
        <div>\#{personnalData.rank} {personnalData.name}</div>
        <div>{personnalData.elo}</div>
      </div>
    {:else}
      <p>Connectez-vous pour voir votre classement.</p>
    {/if}
  </div>
</div>
