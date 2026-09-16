try {
  if (localStorage.getItem("amirelle_light") === "1") {
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";
  }
} catch (e) {}
