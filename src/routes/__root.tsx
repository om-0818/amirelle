import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Toaster } from "sonner";
import { AppErrorComponent } from "@/lib/error-component";
import { registerOffline } from "@/lib/offline";
import { SITE } from "@/lib/site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  errorComponent: AppErrorComponent,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE.name },
      { name: "theme-color", content: SITE.theme },
      { name: "description", content: SITE.description },
      { property: "og:title", content: SITE.name },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SITE.ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: SITE.ogImage },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Figtree:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <script src="/theme-boot.js" />
        <HeadContent />
      </head>
      <body>
        <OfflineBoot />
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
          <Toaster
            position="bottom-center"
            toastOptions={{
              className:
                "!bg-fg !text-bg !border-none !rounded-xl !font-sans !text-sm",
            }}
          />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});

function OfflineBoot() {
  useEffect(() => {
    registerOffline();
  }, []);
  return null;
}
