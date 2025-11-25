export class ScreenManager {
  static show(id: string) {
    document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
    const target = document.getElementById(id);
    if (target) target.classList.remove("hidden");
  }
}
