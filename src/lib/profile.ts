import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export type ProfileRow = {
  birthDate: string;
  identity: string;
  city: string;
  onboarded: boolean;
  gender: string;
};

export const getProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ProfileRow | null> => {
    const sql = await getSql();
    const rows = await sql<{
      birth_date: string;
      identity: string;
      city: string;
      onboarded: boolean;
      gender: string;
    }>`select birth_date, identity, city, onboarded, coalesce(gender, '') as gender from profiles where user_id = ${context.userId} limit 1`;
    const r = rows[0];
    if (!r) return null;
    return {
      birthDate: String(r.birth_date).slice(0, 10),
      identity: r.identity,
      city: r.city,
      onboarded: Boolean(r.onboarded),
      gender: r.gender || "",
    };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .validator((input: ProfileRow) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into profiles (user_id, birth_date, identity, city, onboarded, gender, updated_at)
      values (${context.userId}, ${data.birthDate}, ${data.identity}, ${data.city}, ${data.onboarded}, ${data.gender}, now())
      on conflict (user_id) do update set
        birth_date = excluded.birth_date,
        identity = excluded.identity,
        city = excluded.city,
        onboarded = excluded.onboarded,
        gender = excluded.gender,
        updated_at = now()
    `;
    return { ok: true as const };
  });
