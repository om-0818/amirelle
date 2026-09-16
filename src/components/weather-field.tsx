import { useCloset } from "@/store/closet";

export function WeatherField() {
  const theme = useCloset((s) => s.weather.theme);
  const icon = useCloset((s) => s.weather.icon);
  const showSun = icon === "sun" || icon === "hot";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {showSun && (
        <div className="absolute right-8 top-8 size-16 rounded-full bg-accent/15" />
      )}
      {theme === "rainy" && (
        <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(-20deg,transparent,transparent_12px,color-mix(in_oklab,var(--color-fg)_12%,transparent)_13px,transparent_14px)]" />
      )}
      {theme === "cold" && (
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle,color-mix(in_oklab,var(--color-fg)_18%,transparent)_1px,transparent_1.5px)] [background-size:18px_22px]" />
      )}
    </div>
  );
}
