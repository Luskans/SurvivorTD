export function getOrCreateUID(): string {
  let uid = localStorage.getItem("player_uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("player_uid", uid);
  }
  return uid;
}

export function getUsername(): string | null {
  let username = localStorage.getItem("player_username");
  return username;
}

export function createUsername(username : string): void {
  let newUsername = username.trim();
  localStorage.setItem("player_username", newUsername);
}

export function validateName(): boolean {
    const nameInput = document.getElementById("username-input") as HTMLInputElement;
    const regex = /^[\p{L}0-9]{2,20}$/u;

    if (!regex.test(nameInput.value)) {
        alert("Invalid username");
        return false;
    }

    createUsername(nameInput.value);
    return true;
}