export const LIGHT_KEY = "amirelle_light";

export function readLight(): boolean {
  try {
    return localStorage.getItem(LIGHT_KEY) === "1";
  } catch {
    return false;
  }
}

export function applyTheme(light: boolean) {
  const root = document.documentElement;
  root.classList.toggle("light", light);
  root.style.colorScheme = light ? "light" : "dark";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", light ? "#f5f2ec" : "#0a0908");
  try {
    localStorage.setItem(LIGHT_KEY, light ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export const THEME_BOOT = `try{if(localStorage.getItem("${LIGHT_KEY}")==="1"){document.documentElement.classList.add("light");document.documentElement.style.colorScheme="light"}}catch(e){}`;
