import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { applyTheme, readLight } from "@/lib/theme";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const next = readLight();
    setLight(next);
    applyTheme(next);
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    applyTheme(next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      aria-label={light ? "Switch to dark" : "Switch to light"}
      aria-pressed={light}
      title={light ? "Dark" : "Light"}
      onClick={toggle}
    >
      {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}
