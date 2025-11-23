// export class ScreenManager {
//   static show(screenId: string) {
//     document.querySelectorAll(".screen")
//       .forEach(div => div.classList.add("hidden"));
    
//     document.getElementById(screenId)?.classList.remove("hidden");
//   }
// }



export class ScreenManager {
  static show(id: string) {
    document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
    const target = document.getElementById(id);
    if (target) target.classList.remove("hidden");
  }
}
