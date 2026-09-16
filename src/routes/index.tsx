import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { WeatherField } from "@/components/weather-field";
import { AppErrorComponent } from "@/lib/error-component";

export const Route = createFileRoute("/")({
  component: Home,
  errorComponent: AppErrorComponent,
});

function Home() {
  return (
    <main className="relative min-h-dvh bg-bg text-fg">
      <WeatherField />
      <Shell />
    </main>
  );
}
