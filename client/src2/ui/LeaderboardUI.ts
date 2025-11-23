export class LeaderboardUI {
  container = document.getElementById("leaderboard")!;

  initSampleData() {
    // demo data (remplacer par fetch réel depuis le serveur)
    const demo = [
      { rank: 1, name: "Aster", elo: 1620 },
      { rank: 2, name: "Blossom", elo: 1590 },
      { rank: 3, name: "Clover", elo: 1555 },
      { rank: 4, name: "You", elo: 1500 }, // example line for current player
      { rank: 5, name: "Dune", elo: 1420 },
      { rank: 6, name: "Echo", elo: 1390 },
    ];
    this.render(demo, "You");
  }

  render(list: {rank:number,name:string,elo:number}[], currentName?: string) {
    this.container.innerHTML = "";
    list.forEach(item => {
      const row = document.createElement("div");
      row.className = "leader-row" + (item.name === currentName ? " self" : "");
      row.innerHTML = `<div>#${item.rank} ${item.name}</div><div>${item.elo}</div>`;
      this.container.appendChild(row);
    });
  }
}
