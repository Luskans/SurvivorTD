<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { network } from "../networking/NetworkService";
  import { lobbyRoom } from "../stores";

  // Types pour le chat
  type ChatMessage = { type: "chat" | "sys"; text: string; from?: string };

  let chatMessages: ChatMessage[] = [];
  let chatInput = "";
  let messagesEl: HTMLElement; // Pour scroller

  // Fonction d'échappement HTML pour la sécurité (XSS)
  function escape(s: string) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Fonction d'affichage des messages (append)
  $: {
    // Svelte gère le DOM, on a juste besoin de scroller à la fin lorsque la liste est mise à jour
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function systemMessage(text: string) {
    chatMessages = [...chatMessages, { type: "sys", text: String(text) }];
  }

  // Souscription aux messages Colyseus
  onMount(() => {
    const room = $lobbyRoom;
    if (!room) return;

    const chatListener = room.onMessage(
      "chat",
      (msg: { from: string; text: string }) => {
        chatMessages = [
          ...chatMessages,
          { type: "chat", text: escape(msg.text), from: escape(msg.from) },
        ];
      },
    );

    const sysListener = room.onMessage("sys", (text: string) => {
      systemMessage(String(text));
    });

    // Nettoyage lors de la destruction du composant
    return () => {
      chatListener();
      sysListener();
    };
  });

  function handleSend() {
    const v = chatInput.trim();
    if (!v) return;
    network.sendChat(v);
    chatInput = ""; // Réinitialiser l'input
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      handleSend();
    }
  }
</script>

<div class="chat-panel">
  <h4>Chat</h4>
  <div bind:this={messagesEl} class="chat-messages">
    {#each chatMessages as msg}
      <div class:sys={msg.type === "sys"}>
        {msg.type === "chat" ? `**${msg.from}**: ${msg.text}` : msg.text}
      </div>
    {/each}
  </div>
  <div class="chat-input-row">
    <input
      bind:value={chatInput}
      on:keydown={handleKeydown}
      placeholder="Message..."
    />
    <button on:click={handleSend} class="btn">Envoyer</button>
  </div>
</div>
