import { createServerFn } from "@tanstack/react-start";
import type { WeatherTheme } from "./types";
import { HOUR_MS, WEATHER_PER_HOUR, takeToken, weatherRequestUrl } from "./server-surface";

export const DEFAULT_WEATHER: WeatherTheme = {
  label: "Clear",
  icon: "sun",
  sub: "Dress for the day you have.",
  theme: "",
};

export const fetchWeather = createServerFn({ method: "POST" })
  .validator((input: { city: string }) => input)
  .handler(async ({ data }): Promise<WeatherTheme> => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const url = weatherRequestUrl(data.city);
    if (!url) return DEFAULT_WEATHER;
    if (!takeToken(`weather:${url}`, WEATHER_PER_HOUR, HOUR_MS)) return DEFAULT_WEATHER;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("weather");
      const json = (await res.json()) as {
        current_condition: { weatherCode: string; temp_C: string }[];
      };
      const code = parseInt(json.current_condition[0].weatherCode, 10);
      const tempC = parseInt(json.current_condition[0].temp_C, 10);
      let theme: WeatherTheme;
      if (code === 113 && tempC >= 30) {
        theme = {
          label: "Hot",
          icon: "hot",
          sub: "Light cloth. Skip wool.",
          theme: "",
        };
      } else if (code === 113) {
        theme = {
          label: "Sun",
          icon: "sun",
          sub: "Open weaves, closed or open shoes.",
          theme: "",
        };
      } else if ([116, 119, 122].includes(code)) {
        theme = {
          label: "Cloud",
          icon: "cloud",
          sub: "A layer you can take off.",
          theme: "",
        };
      } else if (
        [176, 263, 266, 293, 296, 299, 302, 305, 308, 353, 356, 359].includes(
          code,
        )
      ) {
        theme = {
          label: "Rain",
          icon: "rain",
          sub: "Closed shoes. No suede.",
          theme: "rainy",
        };
      } else if (tempC < 18) {
        theme = {
          label: "Cool",
          icon: "snow",
          sub: "A knit or a coat.",
          theme: "cold",
        };
      } else {
        theme = DEFAULT_WEATHER;
      }
      return { ...theme, tempC };
    } catch {
      return DEFAULT_WEATHER;
    }
  });
