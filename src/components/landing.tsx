import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

export function Landing() {
  return (
    <section className="relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-16">
      <p className="kicker-brand text-accent">{SITE.name}</p>
      <h1 className="mt-3 font-display text-5xl italic leading-none sm:text-6xl">
        Clothes that exist.
        <br />
        The day you are having.
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-muted">{SITE.line}</p>
      <Link
        to="/login"
        className="mt-10 inline-flex min-h-11 w-fit items-center bg-fg px-6 font-display text-xl italic text-bg"
      >
        Enter
      </Link>
    </section>
  );
}
