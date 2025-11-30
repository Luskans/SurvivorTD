export function getOrCreateUID(): string {
  let uid = localStorage.getItem('player_uid');
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem('player_uid', uid);
  }
  return uid;
}

export function getUsername(): string | null {
  return localStorage.getItem('player_username');
}

export function setUsername(username: string) {
  const v = username.trim();
  if (v.length >= 2 && v.length <= 20) {
    localStorage.setItem('player_username', v);
    return true;
  }
  return false;
}